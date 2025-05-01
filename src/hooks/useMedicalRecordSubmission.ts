
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { ReportData } from "@/components/medical-records/ScanReportDialog";

interface MedicalRecordFormData {
  patientId: string;
  activeTab: "form" | "scan";
  recordType: string;
  reportTypeScan: string;
  date: string;
  doctor: string;
  department: string;
  status: string;
  notes: string;
  scanResult: ReportData | null;
}

export const useMedicalRecordSubmission = (onSuccess: () => void) => {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (formData: MedicalRecordFormData) => {
    const {
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
    } = formData;

    if (!patientId || !date || (activeTab === "form" && (!recordType || !doctor))) {
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
      
      const basePayload: any = {
        patient_id: patientId,
        record_type: activeTab === "form" ? recordType : reportTypeScan,
        date,
        doctor: activeTab === "form" ? doctor : "N/A",
        department,
        status,
      };
      
      // Create a plain serializable object for the scanned_report
      if (activeTab === "scan" && scanResult) {
        basePayload.scanned_report = {
          id: scanResult.id,
          patientId: scanResult.patientId,
          reportType: scanResult.reportType,
          date: scanResult.date,
          content: scanResult.content,
          imageUrl: scanResult.imageUrl || "",
          analysis: scanResult.analysis ? {
            summary: scanResult.analysis.summary,
            diagnosis: scanResult.analysis.diagnosis,
            recommendations: scanResult.analysis.recommendations,
            confidence: scanResult.analysis.confidence
          } : undefined
        };
      } else {
        basePayload.scanned_report = notes ? {
          id: `REC-${Date.now().toString().slice(-6)}`,
          patientId,
          reportType: recordType,
          date,
          content: notes
        } : null;
      }

      const { error } = await supabase.from("medical_records").insert(basePayload);

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

      onSuccess();
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

  return {
    submitting,
    handleSubmit,
  };
};
