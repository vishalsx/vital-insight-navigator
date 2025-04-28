
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PatientDateSelectorProps {
  patientId: string;
  date: string;
  patientMap: { [id: string]: string };
  onPatientChange: (value: string) => void;
  onDateChange: (value: string) => void;
}

const PatientDateSelector = ({
  patientId,
  date,
  patientMap,
  onPatientChange,
  onDateChange,
}: PatientDateSelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <Label htmlFor="patient">Patient</Label>
        <select
          id="patient"
          className="w-full border rounded px-2 py-1"
          value={patientId}
          onChange={e => onPatientChange(e.target.value)}
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
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={e => onDateChange(e.target.value)}
          required
        />
      </div>
    </div>
  );
};

export default PatientDateSelector;
