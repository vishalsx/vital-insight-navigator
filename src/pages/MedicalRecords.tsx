
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
import { 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  Download, 
  ScanLine,
  Upload 
} from "lucide-react";
import ScanReportDialog, { ReportData } from "@/components/medical-records/ScanReportDialog";
import ViewReportDialog from "@/components/medical-records/ViewReportDialog";
import { useToast } from "@/hooks/use-toast";

// Mock data
const initialRecords = [
  {
    id: "REC-2023-001",
    patientId: "P-1001",
    patientName: "Emily Johnson",
    recordType: "Consultation",
    date: "2023-07-15",
    doctor: "Dr. Sarah Chen",
    department: "Cardiology",
    status: "Completed",
  },
  {
    id: "REC-2023-002",
    patientId: "P-1002",
    patientName: "Michael Chen",
    recordType: "Emergency",
    date: "2023-07-14",
    doctor: "Dr. Robert Williams",
    department: "Emergency Medicine",
    status: "Critical",
  },
  {
    id: "REC-2023-003",
    patientId: "P-1003",
    patientName: "Sarah Williams",
    recordType: "Lab Test",
    date: "2023-07-13",
    doctor: "Dr. Emily Rodriguez",
    department: "Pathology",
    status: "Pending",
  },
  {
    id: "REC-2023-004",
    patientId: "P-1004",
    patientName: "David Rodriguez",
    recordType: "Surgery",
    date: "2023-07-12",
    doctor: "Dr. Lisa Thompson",
    department: "Orthopedics",
    status: "Completed",
  },
  {
    id: "REC-2023-005",
    patientId: "P-1005",
    patientName: "Lisa Thompson",
    recordType: "Consultation",
    date: "2023-07-11",
    doctor: "Dr. Michael Brown",
    department: "Pulmonology",
    status: "Completed",
  },
  {
    id: "REC-2023-006",
    patientId: "P-1001",
    patientName: "Emily Johnson",
    recordType: "Lab Test",
    date: "2023-07-10",
    doctor: "Dr. Sarah Chen",
    department: "Cardiology",
    status: "Completed",
  },
  {
    id: "REC-2023-007",
    patientId: "P-1006",
    patientName: "Robert Kim",
    recordType: "Consultation",
    date: "2023-07-09",
    doctor: "Dr. David Garcia",
    department: "Rheumatology",
    status: "Completed",
  },
  {
    id: "REC-2023-008",
    patientId: "P-1007",
    patientName: "Jennifer Smith",
    recordType: "Imaging",
    date: "2023-07-08",
    doctor: "Dr. John Davis",
    department: "Radiology",
    status: "Pending",
  },
];

// Extended type for medical records
interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  recordType: string;
  date: string;
  doctor: string;
  department: string;
  status: string;
  scannedReport?: ReportData;
}

export default function MedicalRecords() {
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState<MedicalRecord[]>(initialRecords);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [viewReportDialogOpen, setViewReportDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const { toast } = useToast();
  
  const filteredRecords = records.filter(
    (record) =>
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.recordType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleScanComplete = (reportData: ReportData) => {
    // Find a matching patient for this report
    const matchingPatient = records.find(record => record.patientId === reportData.patientId);
    
    // Create a new medical record entry
    const newRecord: MedicalRecord = {
      id: reportData.id,
      patientId: reportData.patientId,
      patientName: matchingPatient?.patientName || "Unknown Patient",
      recordType: reportData.reportType,
      date: reportData.date,
      doctor: "AI Analysis System",
      department: "Diagnostics",
      status: "Completed",
      scannedReport: reportData,
    };
    
    // Add the new record to our records list
    setRecords([newRecord, ...records]);
    
    toast({
      title: "Report Added",
      description: `${reportData.reportType} report has been added to medical records.`,
    });
  };

  const handleViewReport = (record: MedicalRecord) => {
    if (record.scannedReport) {
      setSelectedReport(record.scannedReport);
      setViewReportDialogOpen(true);
    } else {
      toast({
        title: "No scanned report",
        description: "This record doesn't have a scanned report to view.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medical Records</h1>
          <p className="text-muted-foreground">
            View and manage medical records
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setScanDialogOpen(true)}>
            <ScanLine className="mr-2 h-4 w-4" /> Scan Report
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create New Record
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by patient name, ID or record type..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Record Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="lab-test">Lab Test</SelectItem>
                <SelectItem value="surgery">Surgery</SelectItem>
                <SelectItem value="imaging">Imaging</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
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
              <TableHead>Record ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">
                  <Link
                    to={`/records/${record.id}`}
                    className="text-primary hover:underline flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    {record.id}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    to={`/patients/${record.patientId}`}
                    className="hover:underline"
                  >
                    {record.patientName}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({record.patientId})
                    </span>
                  </Link>
                </TableCell>
                <TableCell>{record.recordType}</TableCell>
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.doctor}</TableCell>
                <TableCell>{record.department}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      record.status === "Critical"
                        ? "destructive"
                        : record.status === "Pending"
                        ? "outline"
                        : "default"
                    }
                  >
                    {record.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {record.scannedReport ? (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleViewReport(record)}
                      title="View scanned report"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Scan Report Dialog */}
      <ScanReportDialog
        open={scanDialogOpen}
        onOpenChange={setScanDialogOpen}
        onScanComplete={handleScanComplete}
      />

      {/* View Report Dialog */}
      <ViewReportDialog
        open={viewReportDialogOpen}
        onOpenChange={setViewReportDialogOpen}
        report={selectedReport}
      />
    </div>
  );
}
