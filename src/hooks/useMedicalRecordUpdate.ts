
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { ReportData } from "@/components/medical-records/ScanReportDialog";
import type { MedicalRecord } from "@/types/medicalRecords";

interface MedicalRecordUpdateData {
  recordId: string;
  patientId: string;
  recordType: string;
  date: string;
  doctor: string;
  department: string;
  status: string;
  notes?: string;
  scanResult?: ReportData | null;
}

export const useMedicalRecordUpdate = (onSuccess: () => void) => {
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async (formData: MedicalRecordUpdateData) => {
    const {
      recordId,
      patientId,
      recordType,
      date,
      doctor,
      department,
      status,
      notes,
      scanResult,
    } = formData;

    if (!patientId || !date || !recordType || !doctor) {
      toast({
        title: "Missing required fields",
        description: "Patient, Date, Record Type, and Doctor are required fields.",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      const basePayload: any = {
        patient_id: patientId,
        record_type: recordType,
        date,
        doctor,
        department,
        status,
      };
      
      // Create a plain serializable object for the scanned_report
      if (scanResult) {
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
      } else if (notes) {
        basePayload.scanned_report = {
          id: scanResult?.id || `REC-${Date.now().toString().slice(-6)}`,
          patientId,
          reportType: recordType,
          date,
          content: notes
        };
      } else {
        basePayload.scanned_report = null;
      }

      const { error } = await supabase
        .from("medical_records")
        .update(basePayload)
        .eq("id", recordId);

      if (error) {
        toast({
          title: "Failed to update record",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Medical record updated",
        description: "The medical record has been updated successfully.",
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error updating record",
        description: "There was a problem updating the medical record.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return {
    updating,
    handleUpdate,
  };
};
