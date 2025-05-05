
import { ReportData } from "@/components/medical-records/ScanReportDialog";

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  recordType: string;
  date: string;
  doctor: string;
  department: string;
  status: string;
  notes: string;  // Required with default empty string
  scannedReport?: ReportData;
}
