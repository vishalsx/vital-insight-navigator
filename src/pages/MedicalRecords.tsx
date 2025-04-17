
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import RecordsHeader from "@/components/medical-records/RecordsHeader";
import RecordsSearchFilters from "@/components/medical-records/RecordsSearchFilters";
import RecordsTable from "@/components/medical-records/RecordsTable";
import ScanReportDialog, { ReportData } from "@/components/medical-records/ScanReportDialog";
import ViewReportDialog from "@/components/medical-records/ViewReportDialog";
import { MedicalRecord, initialRecords } from "@/types/medicalRecords";

export default function MedicalRecords() {
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState<MedicalRecord[]>(initialRecords);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [viewReportDialogOpen, setViewReportDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const { toast } = useToast();
  
  const filteredRecords = records.filter(
    (record) =>
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.recordType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleScanComplete = (reportData: ReportData) => {
    // Find a matching patient for this report
    const matchingPatient = records.find(record => record.patientId === reportData.patientId);
    
    // Create a new medical record entry
    const newRecord: MedicalRecord = {
      id: reportData.id,
      patientId: reportData.patientId,
      patientName: matchingPatient?.patientName || "Unknown Patient",
      recordType: reportData.reportType,
      date: reportData.date,
      doctor: "AI Analysis System",
      department: "Diagnostics",
      status: "Completed",
      scannedReport: reportData,
    };
    
    // Add the new record to our records list
    setRecords([newRecord, ...records]);
    
    toast({
      title: "Report Added",
      description: `${reportData.reportType} report has been added to medical records.`,
    });
  };

  const handleViewReport = (record: MedicalRecord) => {
    if (record.scannedReport) {
      setSelectedReport(record.scannedReport);
      setViewReportDialogOpen(true);
    } else {
      toast({
        title: "No scanned report",
        description: "This record doesn't have a scanned report to view.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <RecordsHeader onScanReport={() => setScanDialogOpen(true)} />
      <RecordsSearchFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <RecordsTable records={filteredRecords} onViewReport={handleViewReport} />

      {/* Scan Report Dialog */}
      <ScanReportDialog
        open={scanDialogOpen}
        onOpenChange={setScanDialogOpen}
        onScanComplete={handleScanComplete}
      />

      {/* View Report Dialog */}
      <ViewReportDialog
        open={viewReportDialogOpen}
        onOpenChange={setViewReportDialogOpen}
        report={selectedReport}
      />
    </div>
  );
}
