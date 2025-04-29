
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PatientEditDialog from "@/components/patients/PatientEditDialog";
import { useToast } from "@/hooks/use-toast";

// Import our new components
import PatientInfoSidebar from "@/components/patients/PatientInfoSidebar";
import OverviewTab from "@/components/patients/tabs/OverviewTab";
import MedicalHistoryTab from "@/components/patients/tabs/MedicalHistoryTab";
import MedicationsTab from "@/components/patients/tabs/MedicationsTab";
import VitalsTab from "@/components/patients/tabs/VitalsTab";

export default function PatientDetails() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const [patient, setPatient] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [patientVitals, setPatientVitals] = useState<any[]>([]);
  const [latestVitals, setLatestVitals] = useState<any>(null);
  const { toast } = useToast();

  const fetchPatient = async () => {
    if (!id) return;
    const { data, error } = await supabase.from("patients").select("*").eq("id", id).maybeSingle();
    if (error) {
      toast({ title: "Failed to fetch patient", description: error.message, variant: "destructive" });
      setPatient(null);
      return;
    }
    setPatient(data);
  };

  const fetchHistory = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from("medical_records")
      .select("*")
      .eq("patient_id", id)
      .order("date", { ascending: false });
    if (!error && Array.isArray(data)) {
      setHistoryRecords(data.map((rec: any) => ({
        date: rec.date,
        type: rec.record_type,
        diagnosis: rec.scanned_report?.diagnosis || "",
        notes: rec.scanned_report?.content || "",
        doctor: rec.doctor || "",
      })));
    }
  };

  const refreshVitals = async () => {
    if (!id) return;
    
    console.log("Fetching vitals for patient:", id);
    
    // Fetch all vital records for charts
    const { data: allVitals, error: vitalsError } = await supabase
      .from("patient_vitals")
      .select("*")
      .eq("patient_id", id)
      .order("measured_at", { ascending: true });
    
    console.log("Vitals data:", allVitals, "Error:", vitalsError);
    
    if (!vitalsError && allVitals) {
      setPatientVitals(allVitals);
      
      // If we have vitals data, set the latest record
      if (allVitals.length > 0) {
        setLatestVitals(allVitals[allVitals.length - 1]);
      }
      
      toast({
        title: "Vitals updated",
        description: "Latest measurements have been loaded.",
      });
    } else if (vitalsError) {
      console.error("Error fetching vitals:", vitalsError);
      toast({
        title: "Error loading vitals",
        description: "Could not retrieve vital measurements.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPatient();
    fetchHistory();
    refreshVitals();
    // eslint-disable-next-line
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this patient? This cannot be undone.")) return;
    const { error } = await supabase.from("patients").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Patient deleted" });
    window.location.href = "/patients";
  };

  if (!patient) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patient Details</h1>
          <p className="text-muted-foreground">
            View and manage patient information
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Patient
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <PatientInfoSidebar patient={patient} />

        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="medical-history">Medical History</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <OverviewTab patient={patient} />
            </TabsContent>
            
            <TabsContent value="medical-history">
              <MedicalHistoryTab 
                historyRecords={historyRecords} 
                patientId={id || ""} 
                onRecordAdded={fetchHistory} 
              />
            </TabsContent>
            
            <TabsContent value="medications">
              <MedicationsTab />
            </TabsContent>
            
            <TabsContent value="vitals">
              <VitalsTab 
                patientId={id || ""} 
                latestVitals={latestVitals} 
                patientVitals={patientVitals}
                onVitalsAdded={refreshVitals}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <PatientEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={fetchPatient}
        patient={patient}
      />
    </div>
  );
}
