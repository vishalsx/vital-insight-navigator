
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Loader2, FileText } from "lucide-react";
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
        <Label htmlFor="reportFile">Report File</Label>
        <Input
          id="reportFile"
          type="file"
          accept="image/*"
          onChange={onFileChange}
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
            <div className="text-sm font-medium mb-2">Image Preview</div>
            <div className="max-h-[200px] overflow-auto">
              <img
                src={previewUrl}
                alt="Report Preview"
                className="max-w-full rounded-md border"
              />
            </div>
          </CardContent>
        </Card>
      )}
      <div className="flex justify-end gap-2 mt-2">
        <Button type="button" variant="outline" onClick={onCaptureImage}>
          <Camera className="h-4 w-4 mr-2" /> Activate Camera
        </Button>
        <Button type="button" onClick={onAnalyzeReport} disabled={isScanLoading}>
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
