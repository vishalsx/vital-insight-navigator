
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { MedicalRecord, RawScannedReport } from "@/types/medicalRecords";
import { supabase } from "@/integrations/supabase/client";
import { fetchPatientMap } from "@/supabasePatients";
import { ReportData } from "@/components/medical-records/ScanReportDialog";

type PatientMap = { [patientId: string]: string };

export function useMedicalRecords() {
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

  // Helper function to validate and normalize scanned report data
  const normalizeScannedReport = (rawData: any): ReportData | undefined => {
    if (!rawData) return undefined;
    
    try {
      console.log("Processing scanned report data:", JSON.stringify(rawData));
      
      // Safely access potentially non-object data
      if (typeof rawData !== 'object' || rawData === null) {
        console.error("Invalid scanned report format, expected object but got:", typeof rawData);
        return undefined;
      }
      
      // Create a normalized report object with default values for missing fields
      const normalizedReport: ReportData = {
        id: rawData?.id || `default-id-${Date.now()}`,
        patientId: rawData?.patientId || "",
        reportType: rawData?.reportType || "",
        date: rawData?.date || new Date().toISOString().split('T')[0],
        content: rawData?.content || "",
        imageUrl: rawData?.imageUrl || "",
        analysis: undefined  // Default to undefined, will normalize below if exists
      };
      
      // Handle analysis object if it exists
      if (rawData?.analysis && typeof rawData.analysis === 'object') {
        normalizedReport.analysis = {
          summary: rawData.analysis?.summary || "",
          diagnosis: rawData.analysis?.diagnosis || "",
          // Ensure recommendations is always an array
          recommendations: Array.isArray(rawData.analysis?.recommendations)
            ? rawData.analysis.recommendations
            : rawData.analysis?.recommendations
              ? [String(rawData.analysis.recommendations)]
              : [],
          // Ensure confidence is a number between 0-1
          confidence: typeof rawData.analysis?.confidence === 'number'
            ? rawData.analysis.confidence
            : 0
        };
      }
      
      return normalizedReport;
    } catch (parseError) {
      console.error("Error normalizing scanned report:", parseError);
      return undefined;
    }
  };

  const fetchMedicalRecords = async () => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      console.log("Fetching medical records...");
      const { data, error } = await supabase
        .from("medical_records")
        .select("*")
        .order("date", { ascending: false });
      
      if (error) {
        console.error("Supabase error:", error);
        toast({ 
          title: "Error fetching records", 
          description: error.message, 
          variant: "destructive" 
        });
        setRecords([]);
        setHasError(true);
        return;
      }
      
      console.log(`Fetched ${data?.length || 0} medical records`);
      
      // Safely convert data from Supabase with proper type checking
      const mappedRecords: MedicalRecord[] = (data || []).map((rec) => {
        try {
          // Initialize default empty values
          const recordNotes = rec.notes || "";
          
          // Safely handle scanned_report data with the normalizer
          let scannedReport: ReportData | undefined = undefined;
          
          if (rec.scanned_report) {
            try {
              // Safely handle the scanned_report JSON by creating a plain object that matches our type
              // instead of trying to directly cast the JSON to our type
              const rawReport: Record<string, any> = {}; 
              
              // Only extract properties if scanned_report is an object
              if (typeof rec.scanned_report === 'object' && rec.scanned_report !== null) {
                const sr = rec.scanned_report as Record<string, any>; // Type assertion for accessing properties
                
                // Extract properties one by one
                if ('id' in sr) rawReport.id = sr.id;
                if ('patientId' in sr) rawReport.patientId = sr.patientId;
                if ('reportType' in sr) rawReport.reportType = sr.reportType;
                if ('date' in sr) rawReport.date = sr.date;
                if ('content' in sr) rawReport.content = sr.content;
                if ('imageUrl' in sr) rawReport.imageUrl = sr.imageUrl;
                
                // Handle analysis object separately
                if ('analysis' in sr && typeof sr.analysis === 'object' && sr.analysis !== null) {
                  rawReport.analysis = {};
                  const analysis = sr.analysis as Record<string, any>;
                  
                  if ('summary' in analysis) rawReport.analysis.summary = analysis.summary;
                  if ('diagnosis' in analysis) rawReport.analysis.diagnosis = analysis.diagnosis;
                  if ('recommendations' in analysis) rawReport.analysis.recommendations = analysis.recommendations;
                  if ('confidence' in analysis) rawReport.analysis.confidence = analysis.confidence;
                }
              }
              
              // Get patient ID and record type from the main record as fallbacks
              const reportData = {
                id: rawReport.id || `default-id-${Date.now()}`,
                patientId: rawReport.patientId || rec.patient_id,
                reportType: rawReport.reportType || rec.record_type,
                date: rawReport.date || rec.date,
                content: rawReport.content || recordNotes,
                imageUrl: rawReport.imageUrl,
                analysis: rawReport.analysis
              };
              
              scannedReport = normalizeScannedReport(reportData);
            } catch (reportError) {
              console.error("Error processing scanned_report for record:", rec.id, reportError);
              // Continue with undefined scannedReport
            }
          }
          
          return {
            id: rec.id,
            patientId: rec.patient_id,
            patientName: patientMap[rec.patient_id] || "Unknown Patient",
            recordType: rec.record_type,
            date: rec.date,
            doctor: rec.doctor || "",
            department: rec.department || "",
            status: rec.status || "",
            notes: recordNotes,
            scannedReport: scannedReport,
          };
        } catch (recordError) {
          console.error("Error processing record:", rec.id, recordError);
          
          // Return a simplified record when there's an error processing the data
          return {
            id: rec.id,
            patientId: rec.patient_id,
            patientName: patientMap[rec.patient_id] || "Unknown Patient",
            recordType: rec.record_type || "Unknown Type",
            date: rec.date,
            doctor: rec.doctor || "",
            department: rec.department || "",
            status: "Error", // Mark records with processing errors
            notes: "Error processing record data",
            // No scanned report for error cases
          };
        }
      });
      
      setRecords(mappedRecords);
      console.log("Processed records successfully:", mappedRecords.length);
    } catch (fetchError) {
      console.error("Error in fetchMedicalRecords:", fetchError);
      toast({ 
        title: "Failed to fetch records", 
        description: `Unexpected error: ${fetchError instanceof Error ? fetchError.message : "Unknown error"}`, 
        variant: "destructive" 
      });
      setRecords([]);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    // Only fetch records when we have patient data available
    if (Object.keys(patientMap).length > 0) {
      fetchMedicalRecords();
    }
  }, [patientMap]);

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

  const retryFetch = () => {
    fetchMedicalRecords();
  };

  // Get filtered records based on search term
  const filteredRecords = records.filter(
    (record) =>
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.recordType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    records,
    filteredRecords,
    searchTerm,
    setSearchTerm,
    isLoading,
    hasError,
    patientMap,
    createDialogOpen,
    setCreateDialogOpen,
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
  };
}
