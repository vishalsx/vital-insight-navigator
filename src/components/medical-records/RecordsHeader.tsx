import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, ScanLine } from "lucide-react";

interface RecordsHeaderProps {
  onScanReport: () => void;
  onCreateRecord: () => void;
}

const RecordsHeader = ({ onScanReport, onCreateRecord }: RecordsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Medical Records</h1>
        <p className="text-muted-foreground">
          View and manage medical records
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onScanReport} variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <ScanLine className="mr-2 h-4 w-4" /> Scan Report
        </Button>
        <Button onClick={onCreateRecord}>
          <Plus className="mr-2 h-4 w-4" /> Create New Record
        </Button>
      </div>
    </div>
  );
};

export default RecordsHeader;
