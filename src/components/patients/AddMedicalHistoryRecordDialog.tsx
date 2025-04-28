
import React from "react";
import { Dialog } from "@/components/ui/dialog";
import MedicalRecordDialogContent from "./MedicalRecordDialogContent";

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
  // Mock patient map with just the current patient
  const patientMap = { [patientId]: "Current Patient" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <MedicalRecordDialogContent
        patientId={patientId}
        onOpenChange={onOpenChange}
        onRecordAdded={onRecordAdded}
        patientMap={patientMap}
      />
    </Dialog>
  );
};

export default AddMedicalHistoryRecordDialog;
