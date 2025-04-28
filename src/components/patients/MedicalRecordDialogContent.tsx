
import React, { useState } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import PatientDateSelector from "@/components/medical-records/PatientDateSelector";
import RecordForm from "@/components/medical-records/RecordForm";
import ScanReportForm from "@/components/medical-records/ScanReportForm";
import type { ReportData } from "@/components/medical-records/ScanReportDialog";
import { useMedicalRecordSubmission } from "@/hooks/useMedicalRecordSubmission";

interface MedicalRecordDialogContentProps {
  patientId: string;
  onOpenChange: (open: boolean) => void;
  onRecordAdded: () => void;
  patientMap: { [id: string]: string };
}

const MedicalRecordDialogContent = ({
  patientId,
  onOpenChange,
  onRecordAdded,
  patientMap,
}: MedicalRecordDialogContentProps) => {
  const [activeTab, setActiveTab] = useState<"form" | "scan">("form");
  const [date, setDate] = useState("");
  const [recordType, setRecordType] = useState("");
  const [doctor, setDoctor] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [reportTypeScan, setReportTypeScan] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanNotes, setScanNotes] = useState<string>("");
  const [isScanLoading, setIsScanLoading] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ReportData | null>(null);

  const { submitting, handleSubmit } = useMedicalRecordSubmission(() => {
    onOpenChange(false);
    onRecordAdded();
  });

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

  const analyzeReport = async () => {
    if (!reportTypeScan) {
      toast({
        title: "Report type required",
        description: "Please enter a report type before analyzing.",
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
      patientId: patientId,
      reportType: reportTypeScan,
      date: date,
      content: scanNotes,
      imageUrl: previewUrl || undefined,
      analysis,
    };
    setScanResult(newReport);
    setIsScanLoading(false);
    toast({
      title: "Report analyzed",
      description: "The report has been analyzed and is ready to be added.",
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit({
      patientId,
      activeTab,
      recordType,
      reportTypeScan,
      date,
      doctor,
      department,
      status,
      notes,
      scanResult,
    });
  };

  return (
    <DialogContent className="max-w-2xl p-0 flex flex-col h-[80vh]">
      <DialogHeader className="p-6 pb-2">
        <DialogTitle>Create New Medical Record</DialogTitle>
      </DialogHeader>

      <div className="p-6 pt-2">
        <PatientDateSelector
          patientId={patientId}
          date={date}
          patientMap={patientMap}
          onPatientChange={() => {}}
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
            onCaptureImage={() => {}}
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
  );
};

export default MedicalRecordDialogContent;
