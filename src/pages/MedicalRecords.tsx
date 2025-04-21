
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import RecordsHeader from "@/components/medical-records/RecordsHeader";
import RecordsSearchFilters from "@/components/medical-records/RecordsSearchFilters";
import RecordsTable from "@/components/medical-records/RecordsTable";
import ScanReportDialog, { ReportData } from "@/components/medical-records/ScanReportDialog";
import ViewReportDialog from "@/components/medical-records/ViewReportDialog";
import { MedicalRecord } from "@/types/medicalRecords";
import { supabase } from "@/integrations/supabase/client";
import { fetchPatientMap } from "@/supabasePatients";

// Types for patient mapping
type PatientMap = { [patientId: string]: string };

export default function MedicalRecords() {
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [viewReportDialogOpen, setViewReportDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [patientMap, setPatientMap] = useState<PatientMap>({});
  const { toast } = useToast();

  // Fetch patients for ID-name mapping
  useEffect(() => {
    const getPatientMap = async () => {
      const map = await fetchPatientMap();
      setPatientMap(map);
    };
    getPatientMap();
  }, []);

  // Fetch medical records from the backend
  useEffect(() => {
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

      // Map data to MedicalRecord type with patient name lookup
      const mappedRecords: MedicalRecord[] = (data || []).map((rec: any) => ({
        id: rec.id,
        patientId: rec.patient_id,
        patientName: patientMap[rec.patient_id] || "Unknown Patient",
        recordType: rec.record_type,
        date: rec.date,
        doctor: rec.doctor || "",
        department: rec.department || "",
        status: rec.status || "",
        scannedReport: rec.scanned_report || undefined,
      }));
      setRecords(mappedRecords);
    };

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
    let patientName = patientMap[reportData.patientId] || "Unknown Patient";

    // Insert new record to the database
    const { data, error } = await supabase.from("medical_records").insert([
      {
        patient_id: reportData.patientId,
        record_type: reportData.reportType,
        date: reportData.date,
        doctor: "AI Analysis System",
        department: "Diagnostics",
        status: "Completed",
        scanned_report: reportData,
      }
    ]).select().single();

    if (error) {
      toast({
        title: "Failed to add report",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Add new record in UI, refetch for data consistency
    setRecords(prev => [
      {
        id: data.id,
        patientId: data.patient_id,
        patientName,
        recordType: data.record_type,
        date: data.date,
        doctor: data.doctor || "",
        department: data.department || "",
        status: data.status || "",
        scannedReport: data.scanned_report || undefined,
      },
      ...prev,
    ]);

    toast({
      title: "Report Added",
      description: `${reportData.reportType} report has been added to medical records.`,
    });
  };

  // View scanned report dialog open handler
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
