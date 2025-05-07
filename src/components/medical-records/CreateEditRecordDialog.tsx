import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ReportData } from "./ScanReportDialog";
import type { MedicalRecord } from "@/types/medicalRecords";
import PatientDateSelector from "./PatientDateSelector";
import RecordForm from "./RecordForm";
import ScanReportForm from "./ScanReportForm";

interface CreateEditRecordProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    patientId: string;
    recordType: string;
    date: string;
    doctor: string;
    department: string;
    status: string;
    notes?: string;
    scannedReport?: ReportData;
  }) => void;
  patientMap: { [id: string]: string };
  recordToEdit?: MedicalRecord | null;
}

const CreateEditRecordDialog = ({
  open,
  onOpenChange,
  onSubmit,
  patientMap,
  recordToEdit,
}: CreateEditRecordProps) => {
  const [activeTab, setActiveTab] = useState<"form" | "scan">("form");
  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState("");
  // Form state
  const [recordType, setRecordType] = useState("");
  const [doctor, setDoctor] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  // Scan report state
  const [reportTypeScan, setReportTypeScan] = useState<string>("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanNotes, setScanNotes] = useState<string>("");
  const [isScanLoading, setIsScanLoading] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ReportData | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Set form values if editing a record
  useEffect(() => {
    if (open && recordToEdit) {
      setPatientId(recordToEdit.patientId);
      setDate(recordToEdit.date);
      setRecordType(recordToEdit.recordType);
      setDoctor(recordToEdit.doctor);
      setDepartment(recordToEdit.department);
      setStatus(recordToEdit.status);
      
      // If there's a scanned report, populate those fields
      if (recordToEdit.scannedReport) {
        setActiveTab("scan");
        setReportTypeScan(recordToEdit.scannedReport.reportType);
        setScanNotes(recordToEdit.scannedReport.content || recordToEdit.notes || "");
        setScanResult(recordToEdit.scannedReport);
        setPreviewUrl(recordToEdit.scannedReport.imageUrl || null);
      } else {
        setActiveTab("form");
        // Get notes from the record
        setNotes(recordToEdit.notes || "");
      }
    }
  }, [open, recordToEdit]);

  // Reset form on close
  useEffect(() => {
    if (!open) {
      setPatientId("");
      setDate("");
      setRecordType("");
      setDoctor("");
      setDepartment("");
      setStatus("");
      setNotes("");
      setReportTypeScan("");
      setPdfFile(null);
      setPreviewUrl(null);
      setScanNotes("");
      setIsScanLoading(false);
      setActiveTab("form");
      setScanResult(null);
      setSubmitting(false);
    }
  }, [open]);

  const parseWebhookResponse = (responseText: string) => {
    console.log("CreateEditRecordDialog: Attempting to parse webhook response:", responseText);
    
    try {
      // First try to parse the entire text as JSON
      let webhookData = null;
      
      try {
        webhookData = JSON.parse(responseText);
        console.log("CreateEditRecordDialog: Successfully parsed entire response as JSON:", webhookData);
      } catch (e) {
        console.error("CreateEditRecordDialog: Failed to parse entire response as JSON:", e);
        // Try to find and extract a JSON object
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            webhookData = JSON.parse(jsonMatch[0]);
            console.log("CreateEditRecordDialog: Successfully extracted and parsed JSON object from response:", webhookData);
          } catch (innerE) {
            console.error("CreateEditRecordDialog: Failed to parse extracted JSON object:", innerE);
          }
        } else {
          console.error("CreateEditRecordDialog: No JSON object found in response");
        }
      }
      
      if (!webhookData) {
        console.error("CreateEditRecordDialog: Could not parse webhook data");
        return null;
      }
      
      // Extract the recommendation output if it exists
      if (webhookData.recommendation?.output) {
        const outputStr = webhookData.recommendation.output;
        console.log("CreateEditRecordDialog: Recommendation output string:", outputStr);
        
        // Try to extract JSON from markdown code block
        const jsonBlockMatch = outputStr.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonBlockMatch && jsonBlockMatch[1]) {
          try {
            const recommendation = JSON.parse(jsonBlockMatch[1]);
            console.log("CreateEditRecordDialog: Successfully parsed JSON from code block:", recommendation);
            return recommendation;
          } catch (e) {
            console.error("CreateEditRecordDialog: Failed to parse JSON from code block:", e);
          }
        }
        
        // Try to extract any JSON object from the output
        const jsonMatch = outputStr.match(/(\{[\s\S]*\})/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            const recommendation = JSON.parse(jsonMatch[1]);
            console.log("CreateEditRecordDialog: Successfully parsed JSON directly from output:", recommendation);
            return recommendation;
          } catch (e) {
            console.error("CreateEditRecordDialog: Failed to parse JSON directly from output:", e);
          }
        }
      }
      
      // Check if the recommendation is already an object
      if (webhookData.recommendation && 
          typeof webhookData.recommendation === 'object' && 
          !webhookData.recommendation.output) {
        console.log("CreateEditRecordDialog: Found recommendation object directly:", webhookData.recommendation);
        return webhookData.recommendation;
      }
      
      return null;
    } catch (error) {
      console.error("CreateEditRecordDialog: Failed to parse webhook response:", error);
      return null;
    }
  };

  // Form handling functions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Only PDF files are allowed",
          variant: "destructive",
        });
        e.target.value = '';
        return;
      }
      
      setPdfFile(file);
      setPreviewUrl(""); // Just to indicate a file is selected
    }
  };

  const captureImage = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      toast({
        title: "Camera activated",
        description: "Use upload or drag-and-drop to choose a file.",
      });
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access in your browser settings.",
        variant: "destructive",
      });
    }
  };

  const analyzeReport = async () => {
    if (!reportTypeScan) {
      toast({
        title: "Report type required",
        description: "Please enter a report type before analyzing.",
        variant: "destructive",
      });
      return;
    }
    if (!pdfFile && !previewUrl) {
      toast({
        title: "No report file",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }
    
    setIsScanLoading(true);
    
    try {
      // Call the API endpoint if we have a file to upload
      if (pdfFile) {
        console.log("Calling API with PDF file", pdfFile.name);
        
        const response = await fetch(
          "http://localhost:5678/webhook-test/3e721c0e-13ec-4e57-8ce2-b928860d8d86",
          {
            method: 'POST',
            body: pdfFile,
            headers: {
              'Content-Type': 'application/pdf',
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        // Handle potential JSON parsing errors
        const responseText = await response.text();
        console.log("Raw API response:", responseText);
        
        // Create a default analysis structure
        let apiResult = {
          analysis: {
            summary: "No analysis data provided.",
            diagnosis: "Manual review required.",
            recommendations: ["Review report manually"],
            confidence: 0.5
          }
        };
        
        // Try to parse and extract recommendation data
        const parsedRecommendation = parseWebhookResponse(responseText);
        console.log("Parsed recommendation:", parsedRecommendation);
        
        if (parsedRecommendation) {
          // Create the analysis structure from the recommendation
          apiResult.analysis = {
            summary: parsedRecommendation.additional_notes || "No summary provided",
            diagnosis: parsedRecommendation.primary_diagnosis || "No diagnosis provided",
            recommendations: [],
            confidence: 0.85 // Default confidence value
          };
          
          // Collect recommendations from different categories
          let allRecommendations = [];
          
          if (parsedRecommendation.recommendations) {
            // Add further tests
            if (parsedRecommendation.recommendations.further_tests) {
              if (Array.isArray(parsedRecommendation.recommendations.further_tests)) {
                allRecommendations = [...allRecommendations, ...parsedRecommendation.recommendations.further_tests];
              } else {
                allRecommendations.push(parsedRecommendation.recommendations.further_tests);
              }
            }
            
            // Add medications
            if (parsedRecommendation.recommendations.medications) {
              if (Array.isArray(parsedRecommendation.recommendations.medications)) {
                allRecommendations = [...allRecommendations, ...parsedRecommendation.recommendations.medications];
              } else {
                allRecommendations.push(parsedRecommendation.recommendations.medications);
              }
            }
            
            // Add lifestyle advice
            if (parsedRecommendation.recommendations.lifestyle_advice) {
              if (Array.isArray(parsedRecommendation.recommendations.lifestyle_advice)) {
                allRecommendations = [...allRecommendations, ...parsedRecommendation.recommendations.lifestyle_advice];
              } else {
                allRecommendations.push(parsedRecommendation.recommendations.lifestyle_advice);
              }
            }
            
            // Add follow-up
            if (parsedRecommendation.recommendations.follow_up) {
              allRecommendations.push(`Follow-up: ${parsedRecommendation.recommendations.follow_up}`);
            }
          }
          
          // If we have any recommendations, add them to the result
          if (allRecommendations.length > 0) {
            apiResult.analysis.recommendations = allRecommendations;
          } else {
            apiResult.analysis.recommendations = ["No specific recommendations provided."];
          }
          
          // Store the original recommendation
          apiResult.recommendation = parsedRecommendation;
        }
        
        // Create the report with validated data
        const newReport: ReportData = {
          id: recordToEdit?.scannedReport?.id || `REC-${Date.now().toString().slice(-6)}`,
          patientId: patientId || "unknown",
          reportType: reportTypeScan,
          date: date || new Date().toISOString().split('T')[0],
          content: scanNotes,
          imageUrl: "",
          analysis: {
            summary: apiResult.analysis.summary,
            diagnosis: apiResult.analysis.diagnosis,
            recommendations: apiResult.analysis.recommendations,
            confidence: apiResult.analysis.confidence
          },
          recommendation: parsedRecommendation || undefined
        };
        
        console.log("Final report to set:", newReport);
        setScanResult(newReport);
        
        toast({
          title: "Report analyzed",
          description: "The report has been analyzed successfully.",
        });
        
      } else {
        // Use mock data if we don't have a new file (e.g., when editing)
        await new Promise(res => setTimeout(res, 1800));
        const analysis: any = {
          summary: "Patient shows elevated blood glucose and mild hypertension.",
          diagnosis: "Type 2 Diabetes Mellitus (E11.9), early hypertension (I10).",
          recommendations: [
            "Daily glucose monitoring",
            "Reduce carbs in diet",
            "30 min moderate exercise/day",
            "Consider Metformin 500mg if needed",
          ],
          confidence: 0.89,
        };
        
        const newReport: ReportData = {
          id: recordToEdit?.scannedReport?.id || `REC-${Date.now().toString().slice(-6)}`,
          patientId: patientId || "unknown",
          reportType: reportTypeScan,
          date: date || new Date().toISOString().split('T')[0],
          content: scanNotes,
          imageUrl: previewUrl || undefined,
          analysis,
        };
        
        setScanResult(newReport);
        toast({
          title: "Report analyzed",
          description: "The report has been analyzed and added.",
        });
      }
      
    } catch (error) {
      console.error("Error analyzing report:", error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze the report.",
        variant: "destructive",
      });
    } finally {
      setIsScanLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !date ||
      (activeTab === "form" && (!recordType || !doctor))
    ) {
      toast({
        title: "Missing required fields",
        description: "Patient and Date are required on all tabs. Record Type and Doctor are required in Record Form.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      if (activeTab === "form") {
        await onSubmit({
          patientId, recordType, date, doctor, department, status, notes,
        });
      } else if (activeTab === "scan") {
        if (!scanResult) {
          toast({
            title: "No scanned report analyzed",
            description: "Please complete analysis before creating record.",
            variant: "destructive",
          });
          setSubmitting(false);
          return;
        }
        
        // Make sure we preserve notes in the scan result
        const updatedScanResult = {
          ...scanResult,
          content: scanNotes
        };
        
        await onSubmit({
          patientId,
          recordType: scanResult.reportType,
          date,
          doctor: doctor || "N/A",
          department,
          status,
          notes: scanNotes, // Include scanNotes as notes to ensure it's saved in both places
          scannedReport: updatedScanResult,
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error with record",
        description: "There was a problem processing the medical record.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const dialogTitle = recordToEdit ? "Edit Medical Record" : "Create New Medical Record";
  const submitButtonText = recordToEdit ? (submitting ? "Updating..." : "Update Record") : (submitting ? "Creating..." : "Create Record");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 flex flex-col h-[80vh]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{recordToEdit ? "Edit Medical Record" : "Create New Medical Record"}</DialogTitle>
          <DialogDescription>
            Patient and Date are required for both options.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-2">
          <PatientDateSelector
            patientId={patientId}
            date={date}
            patientMap={patientMap}
            onPatientChange={setPatientId}
            onDateChange={setDate}
            disabled={Boolean(recordToEdit)} // Disable patient selection when editing
          />

          <Tabs value={activeTab} onValueChange={t => setActiveTab(t as "form" | "scan")} className="w-full">
            <TabsList className="grid grid-cols-2 w-72 mx-auto mb-4">
              <TabsTrigger value="form">Record Form</TabsTrigger>
              <TabsTrigger value="scan">Scan Report</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1 px-6 overflow-auto">
          {activeTab === "form" ? (
            <RecordForm
              recordType={recordType}
              doctor={doctor}
              department={department}
              status={status}
              notes={notes}
              onRecordTypeChange={setRecordType}
              onDoctorChange={setDoctor}
              onDepartmentChange={setDepartment}
              onStatusChange={setStatus}
              onNotesChange={setNotes}
            />
          ) : (
            <ScanReportForm
              reportType={reportTypeScan}
              notes={scanNotes}
              previewUrl={previewUrl}
              isScanLoading={isScanLoading}
              scanResult={scanResult}
              onReportTypeChange={setReportTypeScan}
              onNotesChange={setScanNotes}
              onFileChange={handleFileChange}
              onCaptureImage={captureImage}
              onAnalyzeReport={analyzeReport}
            />
          )}
        </ScrollArea>

        <DialogFooter className="p-6 border-t bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleFormSubmit}
            disabled={submitting}
          >
            {recordToEdit 
              ? (submitting ? "Updating..." : "Update Record") 
              : (submitting ? "Creating..." : "Create Record")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEditRecordDialog;
