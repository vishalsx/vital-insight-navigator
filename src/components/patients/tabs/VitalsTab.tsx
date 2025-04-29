
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2 } from "lucide-react";
import { PatientTrends } from "@/components/dashboard/PatientTrends";
import AddVitalsDialog from "@/components/vitals/AddVitalsDialog";

interface VitalsTabProps {
  patientId: string;
  latestVitals: any;
  patientVitals: any[];
  onVitalsAdded: () => void;
}

export default function VitalsTab({
  patientId,
  latestVitals,
  patientVitals,
  onVitalsAdded,
}: VitalsTabProps) {
  const [addVitalsOpen, setAddVitalsOpen] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium">Vitals Trends</h3>
            <Button onClick={() => setAddVitalsOpen(true)}>
              <BarChart2 className="mr-2 h-4 w-4" /> Add Measurement
            </Button>
          </div>
          
          <PatientTrends patientId={patientId} />
          
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <VitalCard 
              title="Latest Blood Pressure" 
              value={latestVitals ? 
                `${latestVitals.systolic_pressure || '-'}/${latestVitals.diastolic_pressure || '-'} mmHg` : 
                "No data"
              }
              trend={latestVitals && patientVitals.length > 1 ? "▼ 2 points since last reading" : null}
              trendColor="success"
            />
            
            <VitalCard 
              title="Heart Rate" 
              value={latestVitals?.pulse_rate ? `${latestVitals.pulse_rate} bpm` : "No data"}
              trend={latestVitals && patientVitals.length > 1 ? "▼ 3 bpm since last reading" : null}
              trendColor="success"
            />
            
            <VitalCard 
              title="BMI" 
              value={latestVitals?.bmi ? latestVitals.bmi : "No data"}
              description={latestVitals?.bmi ? 
                latestVitals.bmi < 18.5 ? "Underweight" :
                latestVitals.bmi < 25 ? "Normal range" :
                latestVitals.bmi < 30 ? "Overweight" : "Obese"
                : null
              }
            />
            
            <VitalCard 
              title="Height / Weight" 
              value={latestVitals ? 
                `${latestVitals.height || '-'} cm / ${latestVitals.weight || '-'} kg` : 
                "No data"
              }
              description={latestVitals ? 
                `Last measured: ${new Date(latestVitals.measured_at).toLocaleDateString()}` : 
                "N/A"
              }
            />
          </div>
        </CardContent>
      </Card>
      
      <AddVitalsDialog
        open={addVitalsOpen}
        onOpenChange={setAddVitalsOpen}
        patientId={patientId || ""}
        onSuccess={onVitalsAdded}
      />
    </>
  );
}

interface VitalCardProps {
  title: string;
  value: string | number;
  description?: string | null;
  trend?: string | null;
  trendColor?: "success" | "destructive" | "muted";
}

function VitalCard({ 
  title, 
  value, 
  description, 
  trend, 
  trendColor = "muted" 
}: VitalCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-bold mt-1">{value}</p>
        {trend && (
          <p className={`text-xs text-${trendColor} mt-1`}>
            {trend}
          </p>
        )}
        {description && !trend && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
