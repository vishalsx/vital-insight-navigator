
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export interface CreateEditRecordProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    patientId: string;
    recordType: string;
    date: string;
    doctor: string;
    department: string;
    status: string;
    notes?: string;
  }) => void;
  patientMap: { [id: string]: string };
}

const CreateEditRecordDialog = ({
  open,
  onOpenChange,
  onSubmit,
  patientMap,
}: CreateEditRecordProps) => {
  const [patientId, setPatientId] = useState("");
  const [recordType, setRecordType] = useState("");
  const [date, setDate] = useState("");
  const [doctor, setDoctor] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  // Reset form on close
  React.useEffect(() => {
    if (!open) {
      setPatientId("");
      setRecordType("");
      setDate("");
      setDoctor("");
      setDepartment("");
      setStatus("");
      setNotes("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !recordType || !date || !doctor) return;
    onSubmit({ patientId, recordType, date, doctor, department, status, notes });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Medical Record</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="patient">Patient</Label>
            <select
              id="patient"
              className="w-full border rounded px-2 py-1"
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              required
            >
              <option value="">Select patient...</option>
              {Object.entries(patientMap).map(([id, name]) => (
                <option key={id} value={id}>
                  {name} ({id})
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="recordType">Record Type</Label>
            <Input id="recordType" value={recordType} onChange={e => setRecordType(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="doctor">Doctor</Label>
            <Input id="doctor" value={doctor} onChange={e => setDoctor(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="department">Department</Label>
            <Input id="department" value={department} onChange={e => setDepartment(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Input id="status" value={status} onChange={e => setStatus(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Record</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEditRecordDialog;
