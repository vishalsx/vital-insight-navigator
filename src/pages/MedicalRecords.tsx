
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

type PatientMap = { [patientId: string]: string };

export default function MedicalRecords() {
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
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

  // Fetch medical records from the backend
  const fetchMedicalRecords = async () => {
    const { data, error } = await supabase
      .from("medical_records")
      .select("*")
      .order("date", { ascending: false });
    if (error) {
      toast({ title: "Error fetching records", description: error.message, variant: "destructive" });
      setRecords([]);
      return;
    }
    const mappedRecords: MedicalRecord[] = (data || []).map((rec: any) => ({
      id: rec.id,
      patientId: rec.patient_id,
      patientName: patientMap[rec.patient_id] || "Unknown Patient",
      recordType: rec.record_type,
      date: rec.date,
      doctor: rec.doctor || "",
      department: rec.department || "",
      status: rec.status || "",
      scannedReport: rec.scanned_report ? rec.scanned_report as ReportData : undefined,
    }));
    setRecords(mappedRecords);
  };

  useEffect(() => {
    if (Object.keys(patientMap).length > 0) {
      fetchMedicalRecords();
    }
  }, [patientMap, toast]);

  // Search
  const filteredRecords = records.filter(
    (record) =>
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.recordType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add new scanned record to the backend
  const handleScanComplete = async (reportData: ReportData) => {
    let patientId = reportData.patientId;
    if (!patientMap[patientId]) {
      toast({
        title: "Unknown Patient",
        description: "No such patient exists. Please select a valid patient when scanning.",
        variant: "destructive",
      });
      return;
    }
    const { data, error } = await supabase.from("medical_records").insert({
      patient_id: patientId,
      record_type: reportData.reportType,
      date: reportData.date,
      doctor: "AI Analysis System",
      department: "Diagnostics",
      status: "Completed",
      scanned_report: reportData as any
    }).select().single();
    if (error) {
      toast({
        title: "Failed to add report",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    const newRecord: MedicalRecord = {
      id: data.id,
      patientId: data.patient_id,
      patientName: patientMap[data.patient_id] || "Unknown Patient",
      recordType: data.record_type,
      date: data.date,
      doctor: data.doctor || "",
      department: data.department || "",
      status: data.status || "",
      scannedReport: data.scanned_report as unknown as ReportData,
    };
    setRecords(prev => [newRecord, ...prev]);
    toast({
      title: "Report Added",
      description: `${reportData.reportType} report has been added to medical records.`,
    });
  };

  // Add new generic record
  const handleCreateRecord = async (formData: {
    patientId: string;
    recordType: string;
    date: string;
    doctor: string;
    department: string;
    status: string;
    notes?: string;
  }) => {
    if (!patientMap[formData.patientId]) {
      toast({
        title: "Unknown Patient",
        description: "No such patient exists. Please select a valid patient.",
        variant: "destructive",
      });
      return;
    }
    const { data, error } = await supabase.from("medical_records").insert({
      patient_id: formData.patientId,
      record_type: formData.recordType,
      date: formData.date,
      doctor: formData.doctor,
      department: formData.department || "",
      status: formData.status || "",
      scanned_report: formData.notes ? { content: formData.notes } : null,
    }).select().single();
    if (error) {
      toast({
        title: "Failed to add record",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    const newRecord: MedicalRecord = {
      id: data.id,
      patientId: data.patient_id,
      patientName: patientMap[data.patient_id] || "Unknown Patient",
      recordType: data.record_type,
      date: data.date,
      doctor: data.doctor || "",
      department: data.department || "",
      status: data.status || "",
      scannedReport: data.scanned_report || undefined,
    };
    setRecords(prev => [newRecord, ...prev]);
    toast({
      title: "Record Added",
      description: `${formData.recordType} record has been added to medical records.`,
    });
  };

  // Edit a record
  const handleEditRecord = async (record: MedicalRecord) => {
    toast({ title: "Edit not implemented yet", description: "Feature coming soon!" });
  };

  // Delete a record
  const handleDeleteRecord = async (record: MedicalRecord) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    const { error } = await supabase.from("medical_records").delete().eq("id", record.id);
    if (error) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
      return;
    }
    setRecords(prev => prev.filter(r => r.id !== record.id));
    toast({ title: "Record deleted" });
  };

  // View scanned report dialog open handler
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

  // New: Patient selection required for scanning
  const handleScanReport = () => {
    if (Object.keys(patientMap).length === 0) {
      toast({
        title: "No patients available",
        description: "Please create a patient first.",
        variant: "destructive",
      });
      return;
    }
    setScanDialogOpen(true);
  };

  // New: Patient selection for scan report (let users select patient before scanning)
  // For simplicity, assume ScanReportDialog expects correct patientId coming from the route

  return (
    <div className="space-y-6">
      <RecordsHeader
        onScanReport={handleScanReport}
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
                <td>{record.date}</td>
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

      <ScanReportDialog
        open={scanDialogOpen}
        onOpenChange={setScanDialogOpen}
        onScanComplete={handleScanComplete}
      />

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
// End of MedicalRecords.tsx
