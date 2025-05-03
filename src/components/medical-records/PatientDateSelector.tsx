
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PatientDateSelectorProps {
  patientId: string;
  date: string;
  patientMap: { [id: string]: string };
  onPatientChange: (value: string) => void;
  onDateChange: (value: string) => void;
  disabled?: boolean;
}

const PatientDateSelector = ({
  patientId,
  date,
  patientMap,
  onPatientChange,
  onDateChange,
  disabled = false,
}: PatientDateSelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="space-y-2">
        <Label htmlFor="patient">Patient *</Label>
        <Select
          value={patientId}
          onValueChange={onPatientChange}
          disabled={disabled}
        >
          <SelectTrigger id="patient" className={disabled ? "bg-gray-100" : ""}>
            <SelectValue placeholder="Select patient" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(patientMap).map(([id, name]) => (
              <SelectItem key={id} value={id}>
                {name} ({id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Date *</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          required
        />
      </div>
    </div>
  );
};

export default PatientDateSelector;
