
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FileImage, Camera, Upload, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");

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
    setImageFile(null);
    setPreviewUrl(null);
    setNotes("");
    setIsLoading(false);
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

    if (!imageFile && !previewUrl) {
      toast({
        title: "No image selected",
        description: "Please upload or capture an image of the report.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Mock AI analysis - in a real app, this would call an AI service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis result
      const analysisResult: ReportAnalysis = {
        summary: "Patient shows elevated blood glucose levels and mild hypertension.",
        diagnosis: "Type 2 Diabetes Mellitus (E11.9) with early signs of hypertension (I10).",
        recommendations: [
          "Monitor blood glucose levels daily",
          "Dietary modifications: reduce carbohydrate intake",
          "Increase physical activity to 30 minutes of moderate exercise daily",
          "Consider Metformin 500mg if lifestyle changes ineffective",
        ],
        confidence: 0.89,
      };

      const newReport: ReportData = {
        id: `REC-${Date.now().toString().slice(-6)}`,
        patientId: id || "unknown",
        reportType: reportType,
        date: new Date().toISOString().split('T')[0],
        content: notes,
        imageUrl: previewUrl || '',
        analysis: analysisResult,
      };

      if (onScanComplete) {
        onScanComplete(newReport);
      }

      toast({
        title: "Report processed successfully",
        description: "The report has been analyzed and added to the patient's records.",
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
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
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="scan">
              <Camera className="h-4 w-4 mr-2" />
              Scan
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
                  Report File
                </Label>
                <div className="col-span-3">
                  <Input
                    id="reportFile"
                    type="file"
                    accept="image/*"
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

            {previewUrl && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium mb-2">Preview</div>
                  <div className="max-h-[300px] overflow-auto">
                    <img
                      src={previewUrl}
                      alt="Report Preview"
                      className="max-w-full rounded-md border"
                    />
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
                Analyze Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScanReportDialog;
