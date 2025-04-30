
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import AddMedicalHistoryRecordDialog from "@/components/patients/AddMedicalHistoryRecordDialog";
import { formatDate } from "@/utils/dateUtils";

interface MedicalHistoryTabProps {
  historyRecords: any[];
  patientId: string;
  onRecordAdded: () => void;
}

export default function MedicalHistoryTab({
  historyRecords,
  patientId,
  onRecordAdded,
}: MedicalHistoryTabProps) {
  const [addRecordOpen, setAddRecordOpen] = useState(false);

  // Default records when no data is available
  const medicalHistory = [
    {
      date: "2023-07-15",
      type: "Check-up",
      diagnosis: "Hypertension - Controlled",
      notes: "Blood pressure improved. Continue current medication regimen.",
      doctor: "Dr. Sarah Chen",
    },
    {
      date: "2023-04-02",
      type: "Emergency",
      diagnosis: "Acute Asthma Attack",
      notes: "Patient presented with wheezing and shortness of breath. Administered albuterol nebulizer treatment.",
      doctor: "Dr. Michael Rodriguez",
    },
    {
      date: "2022-11-10",
      type: "Check-up",
      diagnosis: "Hypertension - Poorly Controlled",
      notes: "Blood pressure elevated. Adjusted medication dosage.",
      doctor: "Dr. Sarah Chen",
    },
    {
      date: "2022-06-23",
      type: "Specialist Consult",
      diagnosis: "Allergy Assessment",
      notes: "Confirmed allergies to penicillin and peanuts. Provided EpiPen prescription and education.",
      doctor: "Dr. Lisa Johnson, Allergist",
    },
  ];

  // Use real data if available, otherwise use default data
  const recordsToDisplay = historyRecords.length > 0 ? historyRecords : medicalHistory;

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium">Medical Record History</h3>
            <Button onClick={() => setAddRecordOpen(true)}>
              <FileText className="mr-2 h-4 w-4" /> Add Record
            </Button>
          </div>
          
          <div className="space-y-6">
            {recordsToDisplay.map((record, index) => (
              <div key={index} className="border-b pb-6 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <Badge variant={record.type === "Emergency" ? "destructive" : "outline"}>
                    {record.type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(record.date)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {record.doctor}
                  </span>
                </div>
                <h4 className="font-medium mb-1">
                  {record.diagnosis}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {record.notes}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <AddMedicalHistoryRecordDialog
        open={addRecordOpen}
        onOpenChange={setAddRecordOpen}
        onRecordAdded={onRecordAdded}
        patientId={patientId}
      />
    </>
  );
}
