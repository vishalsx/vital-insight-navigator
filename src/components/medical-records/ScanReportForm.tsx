
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ReportData } from "./ScanReportDialog";

interface ScanReportFormProps {
  reportType: string;
  notes: string;
  previewUrl: string | null;
  isScanLoading: boolean;
  scanResult: ReportData | null;
  onReportTypeChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCaptureImage: () => void;
  onAnalyzeReport: () => void;
}

const ScanReportForm = ({
  reportType,
  notes,
  previewUrl,
  isScanLoading,
  scanResult,
  onReportTypeChange,
  onNotesChange,
  onFileChange,
  onCaptureImage,
  onAnalyzeReport,
}: ScanReportFormProps) => {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

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
      
      // Still call the parent's onFileChange to maintain compatibility
      onFileChange(e);
    }
  };

  const handleAnalyzeReport = async () => {
    if (!reportType) {
      toast({
        title: "Report type required",
        description: "Please enter a report type before analyzing.",
        variant: "destructive",
      });
      return;
    }

    if (!pdfFile) {
      toast({
        title: "No PDF file",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    setApiError(null);
    
    try {
      // Create form data to send the file
      const formData = new FormData();
      formData.append('file', pdfFile);
      formData.append('reportType', reportType);
      
      // Call the API
      const response = await fetch(
        "http://localhost:5678/webhook-test/3e721c0e-13ec-4e57-8ce2-b928860d8d86", 
        {
          method: 'POST',
          body: pdfFile, // Send the binary file directly
          headers: {
            'Content-Type': 'application/pdf',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log("API response:", result);
      
      // Call the parent's onAnalyzeReport to update the state
      onAnalyzeReport();
      
    } catch (error) {
      console.error("Error analyzing report:", error);
      setApiError(error instanceof Error ? error.message : "Unknown error occurred");
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing the report.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="scanReportType">Report Type</Label>
        <Input
          id="scanReportType"
          placeholder="Lab Result, X-Ray, MRI, etc."
          value={reportType}
          onChange={(e) => onReportTypeChange(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="reportFile">Report File (PDF only)</Label>
        <Input
          id="reportFile"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
      </div>
      <div>
        <Label htmlFor="scanNotes">Notes</Label>
        <Textarea
          id="scanNotes"
          placeholder="Add any notes about this report"
          value={notes}
          onChange={e => onNotesChange(e.target.value)}
          rows={3}
        />
      </div>
      {previewUrl && (
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium mb-2">File Selected</div>
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <span>{pdfFile?.name || "PDF Document"}</span>
            </div>
          </CardContent>
        </Card>
      )}
      {apiError && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-red-600 mb-1">Error</div>
            <div className="text-xs text-red-500">{apiError}</div>
          </CardContent>
        </Card>
      )}
      <div className="flex justify-end gap-2 mt-2">
        <Button type="button" variant="outline" onClick={onCaptureImage}>
          <Camera className="h-4 w-4 mr-2" /> Activate Camera
        </Button>
        <Button type="button" onClick={handleAnalyzeReport} disabled={isScanLoading}>
          {isScanLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Analyze Report
            </>
          )}
        </Button>
      </div>
      {scanResult && (
        <Card className="mt-4 border-green-400">
          <CardContent className="p-4">
            <div className="font-bold mb-2">AI Analysis Result:</div>
            <div className="text-sm text-green-900 mb-1">
              Diagnosis: {scanResult.analysis?.diagnosis}
            </div>
            <div className="text-muted-foreground text-xs mb-1">
              Summary: {scanResult.analysis?.summary}
            </div>
            <div>
              <strong>Recommendations:</strong>
              <ul className="list-disc ml-6">
                {scanResult.analysis?.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
            <div className="text-xs text-right mt-2 opacity-70">
              Confidence: {(scanResult.analysis?.confidence ?? 0 * 100).toFixed(0)}%
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScanReportForm;
