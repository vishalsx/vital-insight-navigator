
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface AddMedicalHistoryRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordAdded: () => void;
  patientId: string;
}

const recordTypes = [
  "Check-up",
  "Emergency",
  "Specialist Consult",
  "Lab Test",
  "Surgery",
  "Imaging",
  "Consultation",
];

const AddMedicalHistoryRecordDialog = ({
  open,
  onOpenChange,
  onRecordAdded,
  patientId,
}: AddMedicalHistoryRecordDialogProps) => {
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [doctor, setDoctor] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !date || !diagnosis || !doctor) return;
    setLoading(true);

    // Save record to Supabase
    const { supabase } = await import("@/integrations/supabase/client");
    const payload = {
      patient_id: patientId,
      record_type: type,
      date,
      doctor,
      status: "Completed",
      department: "", // Can be extended to set department
      scanned_report: {
        id: `REC-${Date.now().toString().slice(-6)}`,
        patientId,
        reportType: type,
        date,
        content: notes,
        diagnosis,
      },
    };
    const { error } = await supabase.from("medical_records").insert(payload);
    setLoading(false);

    if (error) {
      if (window && window.toast) {
        window.toast({
          title: "Failed to add record",
          description: error.message,
          variant: "destructive",
        });
      } else {
        alert("Failed to add record: " + error.message);
      }
      return;
    }
    if (window && window.toast) {
      window.toast({
        title: "Medical record added",
        description: "The new medical record has been added successfully.",
      });
    }
    onOpenChange(false);
    onRecordAdded();
    // Reset form
    setType("");
    setDate("");
    setDiagnosis("");
    setNotes("");
    setDoctor("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Medical History Record</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="type">Type</Label>
            <select id="type" className="w-full border rounded px-2 py-1" value={type} onChange={e => setType(e.target.value)} required>
              <option value="">Select...</option>
              {recordTypes.map(rt => (
                <option key={rt} value={rt}>{rt}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input id="diagnosis" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="doctor">Doctor</Label>
            <Input id="doctor" value={doctor} onChange={e => setDoctor(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMedicalHistoryRecordDialog;
