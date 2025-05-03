
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
  notes: string;  // Changed from optional to required with default empty string
  scannedReport?: ReportData;
}
