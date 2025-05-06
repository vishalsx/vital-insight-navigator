
import { useEffect } from "react";
import RecordsHeader from "@/components/medical-records/RecordsHeader";
import RecordsSearchFilters from "@/components/medical-records/RecordsSearchFilters";
import RecordsContent from "@/components/medical-records/RecordsContent";
import CreateEditRecordDialog from "@/components/medical-records/CreateEditRecordDialog";
import ViewReportDialog from "@/components/medical-records/ViewReportDialog";
import { useMedicalRecords } from "@/hooks/useMedicalRecords";

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

  return (
    <div className="space-y-6">
      <RecordsHeader
        onScanReport={undefined}
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
    </div>
  );
}
