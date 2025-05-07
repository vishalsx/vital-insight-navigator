
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

// Type for raw data coming from Supabase JSON columns
export interface RawScannedReport {
  id?: string;
  patientId?: string;
  reportType?: string;
  date?: string;
  content?: string;
  imageUrl?: string;
  analysis?: {
    summary?: string;
    diagnosis?: string;
    recommendations?: string[] | string;
    confidence?: number;
  };
}

// New interfaces for the webhook response data
export interface WebhookRecommendationResponse {
  recommendation?: {
    output?: string;
  };
}

export interface MedicalRecommendation {
  patient_id?: string;
  patient_age?: string;
  patient_sex?: string;
  primary_diagnosis?: string;
  supporting_evidence?: Record<string, string>;
  recommendations?: {
    further_tests?: string[];
    medications?: string[];
    lifestyle_advice?: string[];
    follow_up?: string;
  };
  additional_notes?: string;
}
