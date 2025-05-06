
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Pencil, Trash2 } from "lucide-react";
import { MedicalRecord } from "@/types/medicalRecords";
import { formatDate } from "@/utils/dateUtils";

interface RecordsContentProps {
  isLoading: boolean;
  hasError: boolean;
  records: MedicalRecord[];
  filteredRecords: MedicalRecord[];
  onRetry: () => void;
  onCreateRecord: () => void;
  onEditRecord: (record: MedicalRecord) => void;
  onDeleteRecord: (record: MedicalRecord) => void;
  onViewReport: (record: MedicalRecord) => void;
}

const RecordsContent: React.FC<RecordsContentProps> = ({
  isLoading,
  hasError,
  records,
  filteredRecords,
  onRetry,
  onCreateRecord,
  onEditRecord,
  onDeleteRecord,
  onViewReport,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border bg-card p-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md bg-muted/10">
        <h3 className="text-lg font-medium mb-2">Failed to fetch records</h3>
        <p className="text-muted-foreground mb-4">
          There was an error loading the medical records. Please try again.
        </p>
        <Button onClick={onRetry}>Retry</Button>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md bg-muted/10">
        <h3 className="text-lg font-medium mb-2">No records found</h3>
        <p className="text-muted-foreground mb-4">
          No medical records have been added yet.
        </p>
        <Button onClick={onCreateRecord}>Add Record</Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Type</th>
            <th>Date</th>
            <th>Doctor</th>
            <th>Status</th>
            <th className="w-28"></th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.map((record) => (
            <tr key={record.id}>
              <td>{record.patientName}</td>
              <td>{record.recordType}</td>
              <td>{formatDate(record.date)}</td>
              <td>{record.doctor}</td>
              <td>{record.status}</td>
              <td className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => onEditRecord(record)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDeleteRecord(record)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onViewReport(record)}>
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecordsContent;
