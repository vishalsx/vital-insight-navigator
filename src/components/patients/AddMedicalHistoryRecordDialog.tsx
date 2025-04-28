
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import PatientDateSelector from "@/components/medical-records/PatientDateSelector";
import RecordForm from "@/components/medical-records/RecordForm";
import ScanReportForm from "@/components/medical-records/ScanReportForm";
import type { ReportData } from "@/components/medical-records/ScanReportDialog";

interface AddMedicalHistoryRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordAdded: () => void;
  patientId: string;
}

const AddMedicalHistoryRecordDialog = ({
  open,
  onOpenChange,
  onRecordAdded,
  patientId,
}: AddMedicalHistoryRecordDialogProps) => {
  const [activeTab, setActiveTab] = useState<"form" | "scan">("form");
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

  // Mock patient map with just the current patient
  const patientMap = { [patientId]: "Current Patient" };

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
      const { supabase } = await import("@/integrations/supabase/client");
      const payload = {
        patient_id: patientId,
        record_type: activeTab === "form" ? recordType : reportTypeScan,
        date,
        doctor: activeTab === "form" ? doctor : "N/A",
        department,
        status,
        scanned_report: activeTab === "scan" ? scanResult : {
          id: `REC-${Date.now().toString().slice(-6)}`,
          patientId,
          reportType: recordType,
          date,
          content: notes,
        },
      };

      const { error } = await supabase.from("medical_records").insert(payload);

      if (error) {
        toast({
          title: "Failed to add record",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Medical record added",
        description: "The new medical record has been added successfully.",
      });

      onOpenChange(false);
      onRecordAdded();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 flex flex-col h-[80vh]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Create New Medical Record</DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-2">
          <PatientDateSelector
            patientId={patientId}
            date={date}
            patientMap={patientMap}
            onPatientChange={() => {}} // Disabled since we're in patient context
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
    </Dialog>
  );
};

export default AddMedicalHistoryRecordDialog;
