import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import RecordsHeader from "@/components/medical-records/RecordsHeader";
import RecordsSearchFilters from "@/components/medical-records/RecordsSearchFilters";
import RecordsTable from "@/components/medical-records/RecordsTable";
import ScanReportDialog, { ReportData } from "@/components/medical-records/ScanReportDialog";
import ViewReportDialog from "@/components/medical-records/ViewReportDialog";
import CreateEditRecordDialog from "@/components/medical-records/CreateEditRecordDialog";
import { MedicalRecord } from "@/types/medicalRecords";
import { supabase } from "@/integrations/supabase/client";
import { fetchPatientMap } from "@/supabasePatients";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { formatDate } from "@/utils/dateUtils";
import { Skeleton } from "@/components/ui/skeleton";

type PatientMap = { [patientId: string]: string };

export default function MedicalRecords() {
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewReportDialogOpen, setViewReportDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [patientMap, setPatientMap] = useState<PatientMap>({});
  const { toast } = useToast();
  const [recordToEdit, setRecordToEdit] = useState<MedicalRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const getPatientMap = async () => {
      try {
        const map = await fetchPatientMap();
        setPatientMap(map);
      } catch (error) {
        console.error("Error fetching patient map:", error);
        toast({ 
          title: "Error fetching patients", 
          description: "Unable to load patient information", 
          variant: "destructive" 
        });
        setHasError(true);
      }
    };
    getPatientMap();
  }, [toast]);

  const fetchMedicalRecords = async () => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      const { data, error } = await supabase
        .from("medical_records")
        .select("*")
        .order("date", { ascending: false });
      
      if (error) {
        toast({ 
          title: "Error fetching records", 
          description: error.message, 
          variant: "destructive" 
        });
        setRecords([]);
        setHasError(true);
        return;
      }
      
      // Type-safe conversion of data from Supabase
      const mappedRecords: MedicalRecord[] = (data || []).map((rec) => {
        // Safely extract content from scanned_report if it exists
        const scannedReport = rec.scanned_report as any; // Use any temporarily to extract values
        
        // Default notes to empty string if it doesn't exist in the record
        const recordNotes = rec.notes || "";
        const contentFromReport = scannedReport?.content || "";
        
        // Use record notes or fallback to content from scannedReport
        const notes = recordNotes || contentFromReport;
        
        return {
          id: rec.id,
          patientId: rec.patient_id,
          patientName: patientMap[rec.patient_id] || "Unknown Patient",
          recordType: rec.record_type,
          date: rec.date,
          doctor: rec.doctor || "",
          department: rec.department || "",
          status: rec.status || "",
          notes: notes,
          scannedReport: rec.scanned_report ? {
            id: scannedReport?.id || "",
            patientId: scannedReport?.patientId || rec.patient_id,
            reportType: scannedReport?.reportType || rec.record_type,
            date: scannedReport?.date || rec.date,
            content: scannedReport?.content || notes,
            imageUrl: scannedReport?.imageUrl || "",
            analysis: scannedReport?.analysis
          } as ReportData : undefined,
        };
      });
      
      setRecords(mappedRecords);
      console.log("Fetched records:", mappedRecords);
    } catch (fetchError) {
      console.error("Error in fetchMedicalRecords:", fetchError);
      toast({ 
        title: "Failed to fetch records", 
        description: "An unexpected error occurred. Please try again.", 
        variant: "destructive" 
      });
      setRecords([]);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch records when we have patient data available
    if (Object.keys(patientMap).length > 0) {
      fetchMedicalRecords();
    }
  }, [patientMap]);

  const retryFetch = () => {
    fetchMedicalRecords();
  };

  const filteredRecords = records.filter(
    (record) =>
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.recordType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRecord = async (formData: {
    patientId: string;
    recordType: string;
    date: string;
    doctor: string;
    department: string;
    status: string;
    notes?: string;
    scannedReport?: ReportData;
  }) => {
    if (!patientMap[formData.patientId]) {
      toast({
        title: "Unknown Patient",
        description: "No such patient exists. Please select a valid patient.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create a plain object from the scanned report to ensure it's compatible with Json type
      const scannedReportJson = formData.scannedReport 
        ? {
            id: formData.scannedReport.id,
            patientId: formData.scannedReport.patientId,
            reportType: formData.scannedReport.reportType,
            date: formData.scannedReport.date,
            content: formData.scannedReport.content || formData.notes || "",
            imageUrl: formData.scannedReport.imageUrl || "",
            analysis: formData.scannedReport.analysis ? {
              summary: formData.scannedReport.analysis.summary,
              diagnosis: formData.scannedReport.analysis.diagnosis,
              recommendations: formData.scannedReport.analysis.recommendations,
              confidence: formData.scannedReport.analysis.confidence
            } : undefined
          }
        : (formData.notes ? {
            id: `REC-${Date.now().toString().slice(-6)}`,
            patientId: formData.patientId,
            reportType: formData.recordType,
            date: formData.date,
            content: formData.notes
          } : null);

      const payload = {
        patient_id: formData.patientId,
        record_type: formData.recordType,
        date: formData.date,
        doctor: formData.doctor,
        department: formData.department || "",
        status: formData.status || "",
        notes: formData.notes || "", // Store notes directly in the record
        scanned_report: scannedReportJson
      };

      const { data, error } = await supabase
        .from("medical_records")
        .insert(payload)
        .select()
        .single();

      if (error) {
        toast({
          title: "Failed to add record",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Now we can safely access the notes field since it exists in the database
      const notesFromDb = data.notes || "";

      const scannedReport = data.scanned_report 
        ? {
            id: (data.scanned_report as any)?.id || "",
            patientId: (data.scanned_report as any)?.patientId || data.patient_id,
            reportType: (data.scanned_report as any)?.reportType || data.record_type,
            date: (data.scanned_report as any)?.date || data.date,
            content: (data.scanned_report as any)?.content || notesFromDb || "",
            imageUrl: (data.scanned_report as any)?.imageUrl || "",
            analysis: (data.scanned_report as any)?.analysis
          } as ReportData
        : undefined;

      const newRecord: MedicalRecord = {
        id: data.id,
        patientId: data.patient_id,
        patientName: patientMap[data.patient_id] || "Unknown Patient",
        recordType: data.record_type,
        date: data.date,
        doctor: data.doctor || "",
        department: data.department || "",
        status: data.status || "",
        notes: notesFromDb || (data.scanned_report as any)?.content || "",
        scannedReport: scannedReport,
      };
      
      setRecords(prev => [newRecord, ...prev]);
      
      toast({
        title: "Record Added",
        description: `${formData.recordType} record has been added to medical records.`,
      });
    } catch (createError) {
      console.error("Error in handleCreateRecord:", createError);
      toast({
        title: "Failed to add record",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleEditRecord = async (record: MedicalRecord) => {
    setRecordToEdit(record);
    setCreateDialogOpen(true);
  };

  const handleUpdateRecord = async (formData: {
    patientId: string;
    recordType: string;
    date: string;
    doctor: string;
    department: string;
    status: string;
    notes?: string;
    scannedReport?: ReportData;
  }) => {
    if (!recordToEdit) return;
    
    try {
      // Create a plain object from the scanned report to ensure it's compatible with Json type
      const scannedReportJson = formData.scannedReport 
        ? {
            id: formData.scannedReport.id,
            patientId: formData.scannedReport.patientId,
            reportType: formData.scannedReport.reportType,
            date: formData.scannedReport.date,
            content: formData.scannedReport.content || formData.notes || "",
            imageUrl: formData.scannedReport.imageUrl || "",
            analysis: formData.scannedReport.analysis ? {
              summary: formData.scannedReport.analysis.summary,
              diagnosis: formData.scannedReport.analysis.diagnosis,
              recommendations: formData.scannedReport.analysis.recommendations,
              confidence: formData.scannedReport.analysis.confidence
            } : undefined
          }
        : (formData.notes ? {
            id: recordToEdit.scannedReport?.id || `REC-${Date.now().toString().slice(-6)}`,
            patientId: formData.patientId,
            reportType: formData.recordType,
            date: formData.date,
            content: formData.notes
          } : null);

      const payload = {
        patient_id: formData.patientId,
        record_type: formData.recordType,
        date: formData.date,
        doctor: formData.doctor,
        department: formData.department || "",
        status: formData.status || "",
        notes: formData.notes || "", // Store notes directly in the record
        scanned_report: scannedReportJson
      };

      const { error } = await supabase
        .from("medical_records")
        .update(payload)
        .eq("id", recordToEdit.id);

      if (error) {
        toast({
          title: "Failed to update record",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Update the local records state with the edited record
      setRecords(prevRecords => 
        prevRecords.map(rec => rec.id === recordToEdit.id ? {
          ...rec,
          recordType: formData.recordType,
          date: formData.date,
          doctor: formData.doctor,
          department: formData.department,
          status: formData.status,
          notes: formData.notes || "",
          scannedReport: formData.scannedReport || (formData.notes ? {
            id: recordToEdit.scannedReport?.id || `REC-${Date.now().toString().slice(-6)}`,
            patientId: formData.patientId,
            reportType: formData.recordType,
            date: formData.date,
            content: formData.notes,
            imageUrl: recordToEdit.scannedReport?.imageUrl,
            analysis: recordToEdit.scannedReport?.analysis
          } : undefined)
        } : rec)
      );
      
      setRecordToEdit(null);
      toast({
        title: "Record Updated",
        description: `${formData.recordType} record has been updated successfully.`,
      });
    } catch (updateError) {
      console.error("Error in handleUpdateRecord:", updateError);
      toast({
        title: "Failed to update record",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecord = async (record: MedicalRecord) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    
    try {
      const { error } = await supabase
        .from("medical_records")
        .delete()
        .eq("id", record.id);
        
      if (error) {
        toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
        return;
      }
      
      setRecords(prev => prev.filter(r => r.id !== record.id));
      toast({ title: "Record deleted" });
    } catch (deleteError) {
      console.error("Error in handleDeleteRecord:", deleteError);
      toast({
        title: "Failed to delete record",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleViewReport = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setViewReportDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setRecordToEdit(null);
    }
    setCreateDialogOpen(open);
  };

  const renderContent = () => {
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
          <Button onClick={retryFetch}>Retry</Button>
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
          <Button onClick={() => setCreateDialogOpen(true)}>Add Record</Button>
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
                  <Button variant="ghost" size="icon" onClick={() => handleEditRecord(record)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteRecord(record)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleViewReport(record)}>
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

  return (
    <div className="space-y-6">
      <RecordsHeader
        onScanReport={undefined}
        onCreateRecord={() => setCreateDialogOpen(true)}
      />
      {!isLoading && records.length > 0 && (
        <RecordsSearchFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      )}
      
      {renderContent()}

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
