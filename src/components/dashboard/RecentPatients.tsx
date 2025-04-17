
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

// Mock data for recent patients
const recentPatients = [
  {
    id: "PAT-001",
    name: "Emily Johnson",
    age: 42,
    gender: "Female",
    lastVisit: "Today",
    condition: "Hypertension",
    status: "Follow-up",
    priority: "medium",
  },
  {
    id: "PAT-002",
    name: "Michael Chen",
    age: 65,
    gender: "Male",
    lastVisit: "Yesterday",
    condition: "Diabetes Type 2",
    status: "Critical",
    priority: "high",
  },
  {
    id: "PAT-003",
    name: "Sarah Williams",
    age: 28,
    gender: "Female",
    lastVisit: "3 days ago",
    condition: "Pregnancy",
    status: "Stable",
    priority: "low",
  },
  {
    id: "PAT-004",
    name: "David Rodriguez",
    age: 54,
    gender: "Male",
    lastVisit: "1 week ago",
    condition: "Post-Surgery",
    status: "Improving",
    priority: "medium",
  },
];

export function RecentPatients() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Recent Patients</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentPatients.map((patient) => (
            <Link
              key={patient.id}
              to={`/patients/${patient.id}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {patient.age} • {patient.gender} • {patient.condition}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    patient.priority === "high"
                      ? "destructive"
                      : patient.priority === "medium"
                      ? "default"
                      : "secondary"
                  }
                >
                  {patient.status}
                </Badge>
                <span className="text-sm">{patient.lastVisit}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link
            to="/patients"
            className="text-sm text-primary hover:underline"
          >
            View All Patients
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
