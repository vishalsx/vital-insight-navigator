
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PatientTrendsProps {
  patientId?: string;
}

// Default mock data for patient trends when no data is available
const defaultData = [
  {
    month: "Jan",
    newPatients: 65,
    readmissions: 28,
    avgStay: 4.2,
  },
  {
    month: "Feb",
    newPatients: 59,
    readmissions: 24,
    avgStay: 4.8,
  },
  {
    month: "Mar",
    newPatients: 80,
    readmissions: 29,
    avgStay: 3.9,
  },
  {
    month: "Apr",
    newPatients: 81,
    readmissions: 35,
    avgStay: 4.5,
  },
  {
    month: "May",
    newPatients: 56,
    readmissions: 18,
    avgStay: 3.8,
  },
  {
    month: "Jun",
    newPatients: 55,
    readmissions: 20,
    avgStay: 4.0,
  },
  {
    month: "Jul",
    newPatients: 67,
    readmissions: 25,
    avgStay: 4.3,
  },
];

export function PatientTrends({ patientId }: PatientTrendsProps) {
  const [vitalsData, setVitalsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientVitals = async () => {
      if (!patientId) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("patient_vitals")
          .select("*")
          .eq("patient_id", patientId)
          .order("measured_at", { ascending: true });
        
        if (error) {
          console.error("Error fetching patient vitals:", error);
          return;
        }
        
        if (data && data.length > 0) {
          // Transform the data for the chart
          const formattedData = data.map((record) => ({
            date: new Date(record.measured_at).toLocaleDateString(),
            systolic: record.systolic_pressure,
            diastolic: record.diastolic_pressure,
            heartRate: record.pulse_rate
          }));
          
          setVitalsData(formattedData);
        }
      } catch (error) {
        console.error("Error in fetchPatientVitals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientVitals();
  }, [patientId]);

  // Determine which data to use - real patient data or default data
  const chartData = vitalsData.length > 0 ? vitalsData : defaultData;
  const showPatientData = vitalsData.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {showPatientData ? "Patient Vitals Trends" : "Patient Trends"} 
          {loading && " (Loading...)"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={showPatientData ? "date" : "month"} />
              <YAxis />
              <Tooltip />
              <Legend />
              
              {showPatientData ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    name="Systolic BP"
                    stroke="hsl(var(--destructive))"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    name="Diastolic BP"
                    stroke="hsl(var(--primary))"
                  />
                  <Line
                    type="monotone"
                    dataKey="heartRate"
                    name="Heart Rate"
                    stroke="hsl(var(--accent))"
                  />
                </>
              ) : (
                <>
                  <Line
                    type="monotone"
                    dataKey="newPatients"
                    stroke="hsl(var(--primary))"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="readmissions"
                    stroke="hsl(var(--accent))"
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
