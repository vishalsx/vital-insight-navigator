
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Camera, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportAnalysisCard from "./ReportAnalysisCard";
import RecommendationsCard from "./RecommendationsCard";
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

const ScanReportForm: React.FC<ScanReportFormProps> = ({
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
}) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="reportType" className="text-right">
            Report Type
          </Label>
          <Input
            id="reportType"
            className="col-span-3"
            placeholder="Lab Result, X-Ray Report, etc."
            value={reportType}
            onChange={(e) => onReportTypeChange(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Upload Report</Label>
          <div className="col-span-3">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="upload" className="w-full">
                  <Upload className="h-4 w-4 mr-2" /> Upload
                </TabsTrigger>
                <TabsTrigger value="camera" className="w-full">
                  <Camera className="h-4 w-4 mr-2" /> Camera
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="pt-2">
                <div className="flex flex-col space-y-2">
                  <Input
                    id="reportFile"
                    type="file"
                    onChange={onFileChange}
                    accept="application/pdf"
                  />
                  <p className="text-xs text-muted-foreground">
                    PDF files only
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="camera" className="pt-2">
                <Button onClick={onCaptureImage} variant="outline" className="w-full">
                  <Camera className="h-4 w-4 mr-2" /> Activate Camera
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="notes" className="text-right pt-2">
            Notes
          </Label>
          <Textarea
            id="notes"
            className="col-span-3"
            placeholder="Add notes about this report"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
          />
        </div>
      </div>

      <div className="text-center my-6">
        <Button
          onClick={onAnalyzeReport}
          disabled={isScanLoading}
          size="lg"
          className="w-1/2"
        >
          {isScanLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Analyze Report
            </>
          )}
        </Button>
      </div>

      {scanResult && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Analysis Results</h3>
            
            <div className="space-y-6">
              {scanResult.analysis && (
                <ReportAnalysisCard analysis={scanResult.analysis} />
              )}
              
              {scanResult.recommendation && (
                <RecommendationsCard 
                  recommendation={scanResult.recommendation} 
                  showPatientInfo={false} 
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScanReportForm;
