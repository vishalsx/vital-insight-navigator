
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

// Mock data for patient trends
const data = [
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

export function PatientTrends() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Patient Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
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
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
