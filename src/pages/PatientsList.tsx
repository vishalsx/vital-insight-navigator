
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus } from "lucide-react";

// Mock data
const patients = [
  {
    id: "P-1001",
    name: "Emily Johnson",
    gender: "Female",
    age: 42,
    contact: "+1 (555) 123-4567",
    condition: "Hypertension",
    lastVisit: "2023-07-15",
    status: "Active",
  },
  {
    id: "P-1002",
    name: "Michael Chen",
    gender: "Male",
    age: 65,
    contact: "+1 (555) 987-6543",
    condition: "Diabetes Type 2",
    lastVisit: "2023-07-10",
    status: "Critical",
  },
  {
    id: "P-1003",
    name: "Sarah Williams",
    gender: "Female",
    age: 28,
    contact: "+1 (555) 456-7890",
    condition: "Pregnancy",
    lastVisit: "2023-07-05",
    status: "Active",
  },
  {
    id: "P-1004",
    name: "David Rodriguez",
    gender: "Male",
    age: 54,
    contact: "+1 (555) 789-0123",
    condition: "Post-Surgery",
    lastVisit: "2023-06-30",
    status: "Recovering",
  },
  {
    id: "P-1005",
    name: "Lisa Thompson",
    gender: "Female",
    age: 35,
    contact: "+1 (555) 234-5678",
    condition: "Asthma",
    lastVisit: "2023-06-25",
    status: "Active",
  },
  {
    id: "P-1006",
    name: "Robert Kim",
    gender: "Male",
    age: 72,
    contact: "+1 (555) 345-6789",
    condition: "Arthritis",
    lastVisit: "2023-06-20",
    status: "Stable",
  },
  {
    id: "P-1007",
    name: "Jennifer Smith",
    gender: "Female",
    age: 49,
    contact: "+1 (555) 567-8901",
    condition: "Migraine",
    lastVisit: "2023-06-15",
    status: "Active",
  },
  {
    id: "P-1008",
    name: "Daniel Lee",
    gender: "Male",
    age: 61,
    contact: "+1 (555) 678-9012",
    condition: "Heart Disease",
    lastVisit: "2023-06-10",
    status: "Critical",
  },
];

export default function PatientsList() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground">
            Manage and view your patient records
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add New Patient
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="recovering">Recovering</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Age/Gender</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Primary Condition</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">
                  <Link
                    to={`/patients/${patient.id}`}
                    className="text-primary hover:underline"
                  >
                    {patient.id}
                  </Link>
                </TableCell>
                <TableCell>{patient.name}</TableCell>
                <TableCell>
                  {patient.age} / {patient.gender}
                </TableCell>
                <TableCell>{patient.contact}</TableCell>
                <TableCell>{patient.condition}</TableCell>
                <TableCell>{patient.lastVisit}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      patient.status === "Critical"
                        ? "destructive"
                        : patient.status === "Active"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {patient.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
