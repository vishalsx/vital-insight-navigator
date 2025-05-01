
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

type PatientMap = { [patientId: string]: string };

export default function MedicalRecords() {
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewReportDialogOpen, setViewReportDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [patientMap, setPatientMap] = useState<PatientMap>({});
  const { toast } = useToast();
  const [recordToEdit, setRecordToEdit] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    const getPatientMap = async () => {
      const map = await fetchPatientMap();
      setPatientMap(map);
    };
    getPatientMap();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("medical_records")
        .select("*")
        .order("date", { ascending: false });
      
      if (error) {
        toast({ title: "Error fetching records", description: error.message, variant: "destructive" });
        setRecords([]);
        return;
      }
      
      // Type-safe conversion of scanned_report
      const mappedRecords: MedicalRecord[] = (data || []).map((rec) => ({
        id: rec.id,
        patientId: rec.patient_id,
        patientName: patientMap[rec.patient_id] || "Unknown Patient",
        recordType: rec.record_type,
        date: rec.date,
        doctor: rec.doctor || "",
        department: rec.department || "",
        status: rec.status || "",
        scannedReport: rec.scanned_report ? (rec.scanned_report as unknown as ReportData) : undefined,
      }));
      
      setRecords(mappedRecords);
      console.log("Fetched records:", mappedRecords);
    } catch (fetchError) {
      console.error("Error in fetchMedicalRecords:", fetchError);
      toast({ 
        title: "Failed to fetch records", 
        description: "An unexpected error occurred", 
        variant: "destructive" 
      });
      setRecords([]);
    }
  };

  useEffect(() => {
    if (Object.keys(patientMap).length > 0) {
      fetchMedicalRecords();
    }
  }, [patientMap]);

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
            content: formData.scannedReport.content,
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

      const scannedReport = data.scanned_report 
        ? (data.scanned_report as unknown as ReportData) 
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
    toast({ title: "Edit not implemented yet", description: "Feature coming soon!" });
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
    if (record.scannedReport) {
      setSelectedReport(record.scannedReport as ReportData);
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
      <RecordsHeader
        onScanReport={undefined}
        onCreateRecord={() => setCreateDialogOpen(true)}
      />
      <RecordsSearchFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
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

      <CreateEditRecordDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateRecord}
        patientMap={patientMap}
      />

      <ViewReportDialog
        open={viewReportDialogOpen}
        onOpenChange={setViewReportDialogOpen}
        report={selectedReport}
      />
    </div>
  );
}
