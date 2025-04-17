
import React from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Upload } from "lucide-react";
import { MedicalRecord } from "@/types/medicalRecords";

interface RecordsTableProps {
  records: MedicalRecord[];
  onViewReport: (record: MedicalRecord) => void;
}

const RecordsTable = ({ records, onViewReport }: RecordsTableProps) => {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Record ID</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">
                <Link
                  to={`/records/${record.id}`}
                  className="text-primary hover:underline flex items-center"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  {record.id}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  to={`/patients/${record.patientId}`}
                  className="hover:underline"
                >
                  {record.patientName}
                  <span className="text-xs text-muted-foreground ml-1">
                    ({record.patientId})
                  </span>
                </Link>
              </TableCell>
              <TableCell>{record.recordType}</TableCell>
              <TableCell>{record.date}</TableCell>
              <TableCell>{record.doctor}</TableCell>
              <TableCell>{record.department}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    record.status === "Critical"
                      ? "destructive"
                      : record.status === "Pending"
                      ? "outline"
                      : "default"
                  }
                >
                  {record.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {record.scannedReport ? (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onViewReport(record)}
                    title="View scanned report"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecordsTable;
