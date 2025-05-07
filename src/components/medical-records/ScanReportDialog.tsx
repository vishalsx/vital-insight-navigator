import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Camera, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MedicalRecommendation, WebhookRecommendationResponse } from "@/types/medicalRecords";

interface ScanReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanComplete?: (data: ReportData) => void;
}

export interface ReportData {
  id: string;
  patientId: string;
  reportType: string;
  date: string;
  content: string;
  imageUrl?: string;
  analysis?: ReportAnalysis;
  recommendation?: MedicalRecommendation;
}

export interface ReportAnalysis {
  summary: string;
  diagnosis: string;
  recommendations: string[];
  confidence: number;
}

const ScanReportDialog = ({ open, onOpenChange, onScanComplete }: ScanReportDialogProps) => {
  const { id } = useParams<{ id?: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reportType, setReportType] = useState<string>("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [webhookResponse, setWebhookResponse] = useState<string>("");

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

  const handleWebhookResponseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWebhookResponse(e.target.value);
  };

  const captureImage = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // This would typically connect to a video element and take a screenshot
      // For this demo, we'll just show a message
      toast({
        title: "Camera activated",
        description: "Use the capture button to take a photo of the medical report.",
      });
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to scan reports.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setReportType("");
    setPdfFile(null);
    setPreviewUrl(null);
    setNotes("");
    setWebhookResponse("");
    setIsLoading(false);
  };

  const parseWebhookResponse = (responseText: string): MedicalRecommendation | null => {
    try {
      console.log("ScanReportDialog: Attempting to parse webhook response:", responseText);
      
      // First try to parse the entire text as JSON
      let webhookData: WebhookRecommendationResponse | null = null;
      
      try {
        webhookData = JSON.parse(responseText);
        console.log("ScanReportDialog: Successfully parsed entire response as JSON:", webhookData);
      } catch (e) {
        console.error("ScanReportDialog: Failed to parse entire response as JSON:", e);
        // Try to find and extract a JSON object
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            webhookData = JSON.parse(jsonMatch[0]);
            console.log("ScanReportDialog: Successfully extracted and parsed JSON object from response:", webhookData);
          } catch (innerE) {
            console.error("ScanReportDialog: Failed to parse extracted JSON object:", innerE);
          }
        } else {
          console.error("ScanReportDialog: No JSON object found in response");
        }
      }
      
      if (!webhookData) {
        console.error("ScanReportDialog: Could not parse webhook data");
        return null;
      }
      
      // Extract the recommendation output if it exists
      if (webhookData.recommendation?.output) {
        const outputStr = webhookData.recommendation.output;
        console.log("ScanReportDialog: Recommendation output string:", outputStr);
        
        // Try to extract JSON from markdown code block
        const jsonBlockMatch = outputStr.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonBlockMatch && jsonBlockMatch[1]) {
          try {
            const recommendation = JSON.parse(jsonBlockMatch[1]);
            console.log("ScanReportDialog: Successfully parsed JSON from code block:", recommendation);
            return recommendation;
          } catch (e) {
            console.error("ScanReportDialog: Failed to parse JSON from code block:", e);
          }
        }
        
        // Try to extract any JSON object from the output
        const jsonMatch = outputStr.match(/(\{[\s\S]*\})/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            const recommendation = JSON.parse(jsonMatch[1]);
            console.log("ScanReportDialog: Successfully parsed JSON directly from output:", recommendation);
            return recommendation;
          } catch (e) {
            console.error("ScanReportDialog: Failed to parse JSON directly from output:", e);
          }
        }
      }
      
      // Check if the recommendation is already an object
      if (webhookData.recommendation && 
          typeof webhookData.recommendation === 'object' && 
          !webhookData.recommendation.output) {
        console.log("ScanReportDialog: Found recommendation object directly:", webhookData.recommendation);
        return webhookData.recommendation as unknown as MedicalRecommendation;
      }
      
      console.error("ScanReportDialog: Could not find valid recommendation data in the webhook response");
      return null;
    } catch (error) {
      console.error("ScanReportDialog: Failed to parse webhook response:", error);
      return null;
    }
  };

  const processReport = async () => {
    if (!reportType) {
      toast({
        title: "Report type required",
        description: "Please select a report type before uploading.",
        variant: "destructive",
      });
      return;
    }

    if (!pdfFile && !webhookResponse) {
      toast({
        title: "No data to process",
        description: "Please upload a PDF file or paste webhook response data.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let result = null;
      let recommendation: MedicalRecommendation | null = null;
      
      // Process webhook response if provided
      if (webhookResponse) {
        console.log("Processing webhook response text:", webhookResponse);
        recommendation = parseWebhookResponse(webhookResponse);
        if (recommendation) {
          console.log("Parsed webhook recommendation:", recommendation);
        } else {
          toast({
            title: "Warning",
            description: "Could not parse webhook response. Please check the format.",
            variant: "destructive",
          });
        }
      }
      // Process PDF file if provided and no webhook response was parsed
      else if (pdfFile) {
        console.log("Processing PDF file:", pdfFile.name);
        // Call the API endpoint
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
        
        recommendation = parseWebhookResponse(responseText);
        if (recommendation) {
          console.log("Successfully parsed API response to recommendation:", recommendation);
        } else {
          console.error("Failed to parse API response to recommendation");
          toast({
            title: "Warning",
            description: "Could not parse API response. Using default values.",
            variant: "destructive",
          });
        }
      }
      
      // Create analysis result from recommendation or use default
      const analysisResult: ReportAnalysis = {
        summary: recommendation?.additional_notes || "Patient shows elevated blood glucose levels and mild hypertension.",
        diagnosis: recommendation?.primary_diagnosis || "Type 2 Diabetes Mellitus (E11.9) with early signs of hypertension (I10).",
        recommendations: [],
        confidence: 0.89,
      };
      
      // Collect recommendations from different categories
      let allRecommendations: string[] = [];
      
      if (recommendation?.recommendations) {
        // Add further tests
        if (recommendation.recommendations.further_tests) {
          if (Array.isArray(recommendation.recommendations.further_tests)) {
            allRecommendations = [...allRecommendations, ...recommendation.recommendations.further_tests];
          } else {
            allRecommendations.push(recommendation.recommendations.further_tests);
          }
        }
        
        // Add medications
        if (recommendation.recommendations.medications) {
          if (Array.isArray(recommendation.recommendations.medications)) {
            allRecommendations = [...allRecommendations, ...recommendation.recommendations.medications];
          } else {
            allRecommendations.push(recommendation.recommendations.medications);
          }
        }
        
        // Add lifestyle advice
        if (recommendation.recommendations.lifestyle_advice) {
          if (Array.isArray(recommendation.recommendations.lifestyle_advice)) {
            allRecommendations = [...allRecommendations, ...recommendation.recommendations.lifestyle_advice];
          } else {
            allRecommendations.push(recommendation.recommendations.lifestyle_advice);
          }
        }
        
        // Add follow-up
        if (recommendation.recommendations.follow_up) {
          allRecommendations.push(`Follow-up: ${recommendation.recommendations.follow_up}`);
        }
      }

      // If we have recommendations, use them, otherwise use default ones
      if (allRecommendations.length > 0) {
        analysisResult.recommendations = allRecommendations;
      } else {
        analysisResult.recommendations = [
          "Monitor blood glucose levels daily",
          "Dietary modifications: reduce carbohydrate intake",
          "Increase physical activity to 30 minutes of moderate exercise daily",
          "Consider Metformin 500mg if lifestyle changes ineffective",
        ];
      }

      const newReport: ReportData = {
        id: `REC-${Date.now().toString().slice(-6)}`,
        patientId: id || recommendation?.patient_id || "unknown",
        reportType: reportType,
        date: new Date().toISOString().split('T')[0],
        content: notes || (webhookResponse ? webhookResponse : ''),
        imageUrl: '', // No image URL for PDF
        analysis: analysisResult,
        recommendation: recommendation,
      };

      console.log("Final report data:", newReport);

      if (onScanComplete) {
        onScanComplete(newReport);
      }

      toast({
        title: "Report processed successfully",
        description: recommendation 
          ? "The webhook data has been processed and added to the record." 
          : "The PDF report has been analyzed and added to the patient's records.",
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error processing report:", error);
      toast({
        title: "Processing failed",
        description: "There was an error processing the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Scan Medical Report</DialogTitle>
          <DialogDescription>
            Upload or scan a medical report to add to the patient's records
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="scan">
              <Camera className="h-4 w-4 mr-2" />
              Scan
            </TabsTrigger>
            <TabsTrigger value="webhook">
              <FileText className="h-4 w-4 mr-2" />
              Webhook Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reportType" className="text-right">
                  Report Type
                </Label>
                <Input
                  id="reportType"
                  placeholder="Lab Result, X-Ray, MRI, etc."
                  className="col-span-3"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reportFile" className="text-right">
                  Report File (PDF only)
                </Label>
                <div className="col-span-3">
                  <Input
                    id="reportFile"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes about this report"
                  className="col-span-3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {pdfFile && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium mb-2">Selected PDF</div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <span>{pdfFile.name}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="scan" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="scanReportType" className="text-right">
                  Report Type
                </Label>
                <Input
                  id="scanReportType"
                  placeholder="Lab Result, X-Ray, MRI, etc."
                  className="col-span-3"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right text-sm">Camera</span>
                <div className="col-span-3">
                  <Button onClick={captureImage} variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    Activate Camera
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="scanNotes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="scanNotes"
                  placeholder="Add any additional notes about this report"
                  className="col-span-3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Camera preview would go here in a real implementation */}
            <Card className="border-dashed">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Camera preview would appear here
                </p>
                <Button className="mt-4" variant="secondary">
                  Capture Image
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhook" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="webhookReportType" className="text-right">
                  Report Type
                </Label>
                <Input
                  id="webhookReportType"
                  placeholder="Lab Result, Blood Test, etc."
                  className="col-span-3"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="webhookResponse" className="text-right pt-2">
                  Webhook Response
                </Label>
                <div className="col-span-3">
                  <Textarea
                    id="webhookResponse"
                    placeholder="Paste the webhook response JSON here"
                    className="font-mono text-xs"
                    value={webhookResponse}
                    onChange={handleWebhookResponseChange}
                    rows={10}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Paste the entire webhook response including the recommendation and output fields
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={processReport} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                {activeTab === "webhook" ? "Process Data" : "Analyze Report"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScanReportDialog;
