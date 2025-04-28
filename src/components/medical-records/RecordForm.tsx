
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface RecordFormProps {
  recordType: string;
  doctor: string;
  department: string;
  status: string;
  notes: string;
  onRecordTypeChange: (value: string) => void;
  onDoctorChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}

const RecordForm = ({
  recordType,
  doctor,
  department,
  status,
  notes,
  onRecordTypeChange,
  onDoctorChange,
  onDepartmentChange,
  onStatusChange,
  onNotesChange,
}: RecordFormProps) => {
  return (
    <form id="recordForm" className="space-y-4">
      <div>
        <Label htmlFor="recordType">Record Type</Label>
        <Input
          id="recordType"
          value={recordType}
          onChange={e => onRecordTypeChange(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="doctor">Doctor</Label>
        <Input
          id="doctor"
          value={doctor}
          onChange={e => onDoctorChange(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          value={department}
          onChange={e => onDepartmentChange(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Input
          id="status"
          value={status}
          onChange={e => onStatusChange(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={e => onNotesChange(e.target.value)}
        />
      </div>
    </form>
  );
};

export default RecordForm;
