
import { useEffect, useState } from "react";
import RecordsHeader from "@/components/medical-records/RecordsHeader";
import RecordsSearchFilters from "@/components/medical-records/RecordsSearchFilters";
import RecordsContent from "@/components/medical-records/RecordsContent";
import CreateEditRecordDialog from "@/components/medical-records/CreateEditRecordDialog";
import ViewReportDialog from "@/components/medical-records/ViewReportDialog";
import ScanReportDialog from "@/components/medical-records/ScanReportDialog";
import { useMedicalRecords } from "@/hooks/useMedicalRecords";
import { ReportData } from "@/components/medical-records/ScanReportDialog";

export default function MedicalRecords() {
  const {
    filteredRecords,
    searchTerm,
    setSearchTerm,
    isLoading,
    hasError,
    patientMap,
    createDialogOpen,
    viewReportDialogOpen,
    setViewReportDialogOpen,
    selectedRecord,
    recordToEdit,
    handleCreateRecord,
    handleEditRecord,
    handleUpdateRecord,
    handleDeleteRecord,
    handleViewReport,
    handleDialogOpenChange,
    retryFetch,
    records,
    setCreateDialogOpen,
  } = useMedicalRecords();

  const [scanReportDialogOpen, setScanReportDialogOpen] = useState(false);

  const handleScanComplete = (reportData: ReportData) => {
    // Convert the scanned report data to a medical record format and create it
    const newRecord = {
      id: reportData.id,
      patientId: reportData.patientId,
      patientName: patientMap[reportData.patientId]?.name || "Unknown Patient",
      recordType: reportData.reportType,
      date: reportData.date,
      doctor: "",  // These fields could be filled from the reportData if available
      department: "",
      status: "New",
      notes: reportData.content || "",
      scannedReport: reportData
    };
    
    handleCreateRecord(newRecord);
  };

  return (
    <div className="space-y-6">
      <RecordsHeader
        onScanReport={() => setScanReportDialogOpen(true)}
        onCreateRecord={() => setCreateDialogOpen(true)}
      />
      {!isLoading && records.length > 0 && (
        <RecordsSearchFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      )}
      
      <RecordsContent
        isLoading={isLoading}
        hasError={hasError}
        records={records}
        filteredRecords={filteredRecords}
        onRetry={retryFetch}
        onCreateRecord={() => setCreateDialogOpen(true)}
        onEditRecord={handleEditRecord}
        onDeleteRecord={handleDeleteRecord}
        onViewReport={handleViewReport}
      />

      <CreateEditRecordDialog
        open={createDialogOpen}
        onOpenChange={handleDialogOpenChange}
        onSubmit={recordToEdit ? handleUpdateRecord : handleCreateRecord}
        patientMap={patientMap}
        recordToEdit={recordToEdit}
      />

      <ViewReportDialog
        open={viewReportDialogOpen}
        onOpenChange={setViewReportDialogOpen}
        record={selectedRecord}
      />

      <ScanReportDialog 
        open={scanReportDialogOpen}
        onOpenChange={setScanReportDialogOpen}
        onScanComplete={handleScanComplete}
      />
    </div>
  );
}
