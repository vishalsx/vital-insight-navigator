
import { ReportData, ReportAnalysis } from "@/components/medical-records/ScanReportDialog";

// Medical Record type definition
export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  recordType: string;
  date: string;
  doctor: string;
  department: string;
  status: string;
  scannedReport?: ReportData;
}

// Initial mock data
export const initialRecords: MedicalRecord[] = [
  {
    id: "REC-2023-001",
    patientId: "P-1001",
    patientName: "Emily Johnson",
    recordType: "Consultation",
    date: "2023-07-15",
    doctor: "Dr. Sarah Chen",
    department: "Cardiology",
    status: "Completed",
  },
  {
    id: "REC-2023-002",
    patientId: "P-1002",
    patientName: "Michael Chen",
    recordType: "Emergency",
    date: "2023-07-14",
    doctor: "Dr. Robert Williams",
    department: "Emergency Medicine",
    status: "Critical",
  },
  {
    id: "REC-2023-003",
    patientId: "P-1003",
    patientName: "Sarah Williams",
    recordType: "Lab Test",
    date: "2023-07-13",
    doctor: "Dr. Emily Rodriguez",
    department: "Pathology",
    status: "Pending",
  },
  {
    id: "REC-2023-004",
    patientId: "P-1004",
    patientName: "David Rodriguez",
    recordType: "Surgery",
    date: "2023-07-12",
    doctor: "Dr. Lisa Thompson",
    department: "Orthopedics",
    status: "Completed",
  },
  {
    id: "REC-2023-005",
    patientId: "P-1005",
    patientName: "Lisa Thompson",
    recordType: "Consultation",
    date: "2023-07-11",
    doctor: "Dr. Michael Brown",
    department: "Pulmonology",
    status: "Completed",
  },
  {
    id: "REC-2023-006",
    patientId: "P-1001",
    patientName: "Emily Johnson",
    recordType: "Lab Test",
    date: "2023-07-10",
    doctor: "Dr. Sarah Chen",
    department: "Cardiology",
    status: "Completed",
  },
  {
    id: "REC-2023-007",
    patientId: "P-1006",
    patientName: "Robert Kim",
    recordType: "Consultation",
    date: "2023-07-09",
    doctor: "Dr. David Garcia",
    department: "Rheumatology",
    status: "Completed",
  },
  {
    id: "REC-2023-008",
    patientId: "P-1007",
    patientName: "Jennifer Smith",
    recordType: "Imaging",
    date: "2023-07-08",
    doctor: "Dr. John Davis",
    department: "Radiology",
    status: "Pending",
  },
];
