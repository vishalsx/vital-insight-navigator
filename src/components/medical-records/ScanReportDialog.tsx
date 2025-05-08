
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ScanReportForm from "./ScanReportForm";
import { useToast } from "@/hooks/use-toast";
import { usePatientsList } from "@/hooks/usePatientsList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface ReportAnalysis {
  summary: string;
  diagnosis: string;
  recommendations: string[];
  confidence: number;
}

export interface ReportData {
  id: string;
  patientId: string;
  reportType: string;
  date: string;
  content?: string;
  imageUrl?: string;
  analysis?: ReportAnalysis;
  recommendation?: any; // Add recommendation to handle various API response formats
}

interface ScanReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanComplete: (data: ReportData) => void;
}

const ScanReportDialog: React.FC<ScanReportDialogProps> = ({
  open,
  onOpenChange,
  onScanComplete,
}) => {
  const { toast } = useToast();
  const [patientId, setPatientId] = useState<string>("");
  const { patients, isLoading, isError } = usePatientsList();
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const handleSubmit = () => {
    if (!reportData) {
      toast({
        title: "No report data",
        description: "Please analyze a report before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!patientId) {
      toast({
        title: "No patient selected",
        description: "Please select a patient before submitting.",
        variant: "destructive",
      });
      return;
    }

    const updatedReportData: ReportData = {
      ...reportData,
      patientId: patientId,
    };

    onScanComplete(updatedReportData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Scan Medical Report</DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-2">
          <Select onValueChange={setPatientId}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select a patient" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>
                  Loading...
                </SelectItem>
              ) : isError ? (
                <SelectItem value="error" disabled>
                  Error loading patients
                </SelectItem>
              ) : (
                patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-auto">
          <ScanReportForm
            reportType=""
            notes=""
            previewUrl={null}
            isScanLoading={false}
            scanResult={null}
            onReportTypeChange={() => {}}
            onNotesChange={() => {}}
            onFileChange={() => {}}
            onCaptureImage={() => {}}
            onAnalyzeReport={() => {}}
          />
        </div>

        <DialogFooter className="p-6 border-t bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Create Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScanReportDialog;
