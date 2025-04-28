import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ReportData } from "./ScanReportDialog";
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
}

const CreateEditRecordDialog = ({
  open,
  onOpenChange,
  onSubmit,
  patientMap,
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanNotes, setScanNotes] = useState<string>("");
  const [isScanLoading, setIsScanLoading] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ReportData | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset form on close
  React.useEffect(() => {
    if (!open) {
      setPatientId("");
      setDate("");
      setRecordType("");
      setDoctor("");
      setDepartment("");
      setStatus("");
      setNotes("");
      setReportTypeScan("");
      setImageFile(null);
      setPreviewUrl(null);
      setScanNotes("");
      setIsScanLoading(false);
      setActiveTab("form");
      setScanResult(null);
      setSubmitting(false);
    }
  }, [open]);

  // Form handling functions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
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
    if (!imageFile && !previewUrl) {
      toast({
        title: "No report file",
        description: "Please upload or scan an image.",
        variant: "destructive",
      });
      return;
    }
    setIsScanLoading(true);
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
      id: `REC-${Date.now().toString().slice(-6)}`,
      patientId: patientId || "unknown",
      reportType: reportTypeScan,
      date: date || new Date().toISOString().split("T")[0],
      content: scanNotes,
      imageUrl: previewUrl || undefined,
      analysis,
    };
    setScanResult(newReport);
    toast({
      title: "Report analyzed",
      description: "The report has been analyzed and added.",
    });
    setIsScanLoading(false);
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
        await onSubmit({
          patientId,
          recordType: scanResult.reportType,
          date,
          doctor: doctor || "N/A",
          department,
          status,
          notes: scanNotes,
          scannedReport: scanResult,
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error creating record",
        description: "There was a problem creating the medical record.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 flex flex-col h-[80vh]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Create New Medical Record</DialogTitle>
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
            {submitting ? "Creating..." : "Create Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEditRecordDialog;
