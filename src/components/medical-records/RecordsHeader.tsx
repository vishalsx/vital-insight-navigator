
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface RecordsHeaderProps {
  onScanReport?: (() => void) | undefined;
  onCreateRecord: () => void;
}

const RecordsHeader = ({ onCreateRecord }: RecordsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Medical Records</h1>
        <p className="text-muted-foreground">
          View and manage medical records
        </p>
      </div>
      <div>
        <Button onClick={onCreateRecord}>
          <Plus className="mr-2 h-4 w-4" /> Create New Record
        </Button>
      </div>
    </div>
  );
};

export default RecordsHeader;
