
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";

// Mock data for top diagnoses
const diagnosisData = [
  { name: "Hypertension", value: 145 },
  { name: "Diabetes", value: 98 },
  { name: "Asthma", value: 76 },
  { name: "Heart Disease", value: 62 },
  { name: "Arthritis", value: 54 },
  { name: "Obesity", value: 43 },
  { name: "Depression", value: 39 },
  { name: "COPD", value: 32 },
];

// Mock data for patient demographics
const demographicsData = [
  { name: "0-18", male: 24, female: 21 },
  { name: "19-35", male: 45, female: 58 },
  { name: "36-50", male: 68, female: 73 },
  { name: "51-65", male: 82, female: 87 },
  { name: "66+", male: 63, female: 71 },
];

// Mock data for patient outcomes
const outcomesData = [
  { name: "Jan", improved: 53, stable: 28, worsened: 19 },
  { name: "Feb", improved: 48, stable: 32, worsened: 20 },
  { name: "Mar", improved: 61, stable: 25, worsened: 14 },
  { name: "Apr", improved: 56, stable: 27, worsened: 17 },
  { name: "May", improved: 64, stable: 22, worsened: 14 },
  { name: "Jun", improved: 70, stable: 19, worsened: 11 },
];

// Mock data for department activity
const departmentData = [
  { name: "Cardiology", value: 246 },
  { name: "Pediatrics", value: 187 },
  { name: "Orthopedics", value: 165 },
  { name: "Neurology", value: 134 },
  { name: "Oncology", value: 117 },
];

// Colors for the pie chart
const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088FE",
  "#00C49F",
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Clinical data insights and trends
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="quarter">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="month">Past Month</SelectItem>
                <SelectItem value="quarter">Past Quarter</SelectItem>
                <SelectItem value="year">Past Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patient Analytics</TabsTrigger>
          <TabsTrigger value="clinical">Clinical Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-2">
                  <p className="text-muted-foreground">Total Patients</p>
                  <p className="text-3xl font-bold">3,271</p>
                </div>
                <div className="text-xs text-center text-success">
                  ↑ 12% increase from last quarter
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-2">
                  <p className="text-muted-foreground">Avg. Visits Per Day</p>
                  <p className="text-3xl font-bold">42</p>
                </div>
                <div className="text-xs text-center text-success">
                  ↑ 8% increase from last quarter
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-2">
                  <p className="text-muted-foreground">Avg. Treatment Time</p>
                  <p className="text-3xl font-bold">27 min</p>
                </div>
                <div className="text-xs text-center text-destructive">
                  ↑ 5% increase from last quarter
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-2">
                  <p className="text-muted-foreground">Patient Satisfaction</p>
                  <p className="text-3xl font-bold">92%</p>
                </div>
                <div className="text-xs text-center text-success">
                  ↑ 3% increase from last quarter
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Top Diagnoses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={diagnosisData}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 80,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis
                        dataKey="name"
                        type="category"
                        scale="band"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="hsl(var(--primary))"
                        name="Patients"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Department Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                        labelLine={false}
                      >
                        {departmentData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Patient Outcomes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={outcomesData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="improved"
                      stackId="a"
                      fill="hsl(var(--success, 142 76% 36%))"
                      name="Improved"
                    />
                    <Bar
                      dataKey="stable"
                      stackId="a"
                      fill="hsl(var(--primary))"
                      name="Stable"
                    />
                    <Bar
                      dataKey="worsened"
                      stackId="a"
                      fill="hsl(var(--destructive))"
                      name="Worsened"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="patients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Patient Demographics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={demographicsData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="male"
                      fill="hsl(var(--primary))"
                      name="Male"
                    />
                    <Bar
                      dataKey="female"
                      fill="hsl(var(--accent))"
                      name="Female"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Additional patient analytics sections would go here */}
          <div className="text-center text-muted-foreground p-20">
            Additional patient analytics will be available soon.
          </div>
        </TabsContent>
        
        <TabsContent value="clinical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Clinical Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { month: "Jan", recovered: 65, admitted: 28 },
                      { month: "Feb", recovered: 59, admitted: 48 },
                      { month: "Mar", recovered: 80, admitted: 40 },
                      { month: "Apr", recovered: 81, admitted: 49 },
                      { month: "May", recovered: 56, admitted: 38 },
                      { month: "Jun", recovered: 55, admitted: 43 },
                    ]}
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
                      dataKey="recovered"
                      stroke="hsl(var(--success, 142 76% 36%))"
                      activeDot={{ r: 8 }}
                      name="Recovered Patients"
                    />
                    <Line
                      type="monotone"
                      dataKey="admitted"
                      stroke="hsl(var(--primary))"
                      name="Admitted Patients"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Additional clinical analytics sections would go here */}
          <div className="text-center text-muted-foreground p-20">
            Additional clinical analytics will be available soon.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
