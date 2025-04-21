
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Trash2, 
  Plus, 
  FileText, 
  Pill, 
  BarChart2, 
  MessageSquare, 
  AlertCircle, 
  Clock, 
  Calendar, 
  Activity 
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import PatientEditDialog from "@/components/patients/PatientEditDialog";
import { useToast } from "@/hooks/use-toast";

const patient = {
  id: "P-1001",
  name: "Emily Johnson",
  dob: "1980-05-12",
  age: 42,
  gender: "Female",
  blood: "A+",
  height: "5'6\"",
  weight: "145 lbs",
  address: "1234 Maple Street, Springfield, IL 62704",
  phone: "+1 (555) 123-4567",
  email: "emily.johnson@example.com",
  emergencyContact: "Robert Johnson (Spouse): +1 (555) 987-6543",
  insurance: "Blue Cross Blue Shield, Policy #BC123456789",
  condition: "Hypertension, Mild Asthma",
  allergies: "Penicillin, Peanuts",
  status: "Active",
};

const vitalsData = [
  {
    date: "Jan",
    systolic: 138,
    diastolic: 88,
    heartRate: 78,
  },
  {
    date: "Feb",
    systolic: 142,
    diastolic: 92,
    heartRate: 82,
  },
  {
    date: "Mar",
    systolic: 135,
    diastolic: 87,
    heartRate: 75,
  },
  {
    date: "Apr",
    systolic: 130,
    diastolic: 85,
    heartRate: 72,
  },
  {
    date: "May",
    systolic: 128,
    diastolic: 82,
    heartRate: 70,
  },
  {
    date: "Jun",
    systolic: 129,
    diastolic: 83,
    heartRate: 73,
  },
];

const medicalHistory = [
  {
    date: "2023-07-15",
    type: "Check-up",
    diagnosis: "Hypertension - Controlled",
    notes: "Blood pressure improved. Continue current medication regimen.",
    doctor: "Dr. Sarah Chen",
  },
  {
    date: "2023-04-02",
    type: "Emergency",
    diagnosis: "Acute Asthma Attack",
    notes: "Patient presented with wheezing and shortness of breath. Administered albuterol nebulizer treatment.",
    doctor: "Dr. Michael Rodriguez",
  },
  {
    date: "2022-11-10",
    type: "Check-up",
    diagnosis: "Hypertension - Poorly Controlled",
    notes: "Blood pressure elevated. Adjusted medication dosage.",
    doctor: "Dr. Sarah Chen",
  },
  {
    date: "2022-06-23",
    type: "Specialist Consult",
    diagnosis: "Allergy Assessment",
    notes: "Confirmed allergies to penicillin and peanuts. Provided EpiPen prescription and education.",
    doctor: "Dr. Lisa Johnson, Allergist",
  },
];

const medications = [
  {
    name: "Lisinopril",
    dose: "10mg",
    frequency: "Once daily",
    startDate: "2022-11-10",
    endDate: null,
    prescribedBy: "Dr. Sarah Chen",
    status: "Active",
  },
  {
    name: "Albuterol Inhaler",
    dose: "2 puffs",
    frequency: "As needed for wheezing",
    startDate: "2023-04-02",
    endDate: null,
    prescribedBy: "Dr. Michael Rodriguez",
    status: "Active",
  },
  {
    name: "Atorvastatin",
    dose: "20mg",
    frequency: "Once daily",
    startDate: "2022-06-23",
    endDate: "2023-01-15",
    prescribedBy: "Dr. Sarah Chen",
    status: "Discontinued",
  },
];

export default function PatientDetails() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const [patient, setPatient] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
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

  useEffect(() => {
    fetchPatient();
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
        <Card className="w-full md:w-80 flex-shrink-0">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  EJ
                </AvatarFallback>
              </Avatar>

              <h2 className="text-xl font-bold">{patient.name}</h2>
              <p className="text-muted-foreground">
                {patient.age} • {patient.gender} • {patient.blood}
              </p>
              <Badge className="mt-2">{patient.status}</Badge>

              <div className="w-full mt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Date of Birth</p>
                    <p className="text-muted-foreground">{patient.dob}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Patient ID</p>
                    <p className="text-muted-foreground">{patient.id}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Medical Condition</p>
                    <p className="text-muted-foreground">{patient.condition}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium">Allergies</p>
                    <p className="text-muted-foreground">{patient.allergies}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="medical-history">Medical History</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Address</p>
                      <p>{patient.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Phone</p>
                      <p>{patient.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Email</p>
                      <p>{patient.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Emergency Contact</p>
                      <p>{patient.emergencyContact}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Insurance</p>
                      <p>{patient.insurance}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Physical Info</p>
                      <p>Height: {patient.height} • Weight: {patient.weight}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Recent Vitals</h3>
                      <Button variant="ghost" size="sm">
                        View All
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Blood Pressure</span>
                        <span className="font-medium">128/83 mmHg</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Heart Rate</span>
                        <span className="font-medium">73 bpm</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Temperature</span>
                        <span className="font-medium">98.6°F</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Respiratory Rate</span>
                        <span className="font-medium">16 breaths/min</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Oxygen Saturation</span>
                        <span className="font-medium">98%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Upcoming Appointments</h3>
                      <Button variant="ghost" size="sm">
                        Schedule New
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg border bg-secondary/40">
                        <p className="font-medium">Annual Check-up</p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          July 28, 2023 • 10:00 AM
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Dr. Sarah Chen
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <p className="font-medium">Blood Work</p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          August 5, 2023 • 8:30 AM
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Lab Department
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="medical-history">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium">Medical Record History</h3>
                    <Button>
                      <FileText className="mr-2 h-4 w-4" /> Add Record
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {medicalHistory.map((record, index) => (
                      <div key={index} className="border-b pb-6 last:border-0 last:pb-0">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <Badge variant={record.type === "Emergency" ? "destructive" : "outline"}>
                            {record.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {record.date}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {record.doctor}
                          </span>
                        </div>
                        <h4 className="font-medium mb-1">
                          {record.diagnosis}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {record.notes}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="medications">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium">Medications</h3>
                    <Button>
                      <Pill className="mr-2 h-4 w-4" /> Add Medication
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {medications.map((med, index) => (
                      <div 
                        key={index} 
                        className="p-4 rounded-lg border bg-card flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{med.name}</h4>
                            <Badge variant={med.status === "Active" ? "default" : "secondary"}>
                              {med.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {med.dose} • {med.frequency}
                          </p>
                        </div>
                        
                        <div className="text-sm">
                          <p>
                            <span className="text-muted-foreground mr-1">Start Date:</span>
                            {med.startDate}
                          </p>
                          {med.endDate && (
                            <p>
                              <span className="text-muted-foreground mr-1">End Date:</span>
                              {med.endDate}
                            </p>
                          )}
                          <p>
                            <span className="text-muted-foreground mr-1">Prescribed by:</span>
                            {med.prescribedBy}
                          </p>
                        </div>
                        
                        <div className="flex gap-2 md:flex-col">
                          <Button size="sm" variant="outline">Renew</Button>
                          <Button size="sm" variant="ghost">Edit</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="vitals">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium">Vitals Trends</h3>
                    <Button>
                      <BarChart2 className="mr-2 h-4 w-4" /> Add Measurement
                    </Button>
                  </div>
                  
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={vitalsData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="systolic"
                          stroke="hsl(var(--destructive))"
                          name="Systolic"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="diastolic"
                          stroke="hsl(var(--primary))"
                          name="Diastolic"
                        />
                        <Line
                          type="monotone"
                          dataKey="heartRate"
                          stroke="hsl(var(--accent))"
                          name="Heart Rate"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Latest Blood Pressure</p>
                        <p className="text-xl font-bold mt-1">128/83 mmHg</p>
                        <p className="text-xs text-success mt-1">▼ 2 points since last reading</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Heart Rate</p>
                        <p className="text-xl font-bold mt-1">73 bpm</p>
                        <p className="text-xs text-success mt-1">▼ 3 bpm since last reading</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">BMI</p>
                        <p className="text-xl font-bold mt-1">24.5</p>
                        <p className="text-xs text-muted-foreground mt-1">Normal range</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Blood Glucose</p>
                        <p className="text-xl font-bold mt-1">98 mg/dL</p>
                        <p className="text-xs text-muted-foreground mt-1">Fasting</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
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
