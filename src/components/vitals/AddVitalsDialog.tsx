
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddVitalsForm from "./AddVitalsForm";

interface AddVitalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  onSuccess: () => void;
}

const AddVitalsDialog = ({
  open,
  onOpenChange,
  patientId,
  onSuccess,
}: AddVitalsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Vital Measurements</DialogTitle>
        </DialogHeader>
        <AddVitalsForm
          patientId={patientId}
          onSuccess={() => {
            onSuccess();
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddVitalsDialog;
