
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Camera, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ReportData, ReportAnalysis } from "./ScanReportDialog";

export interface CreateEditRecordProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    patientId: string;
    recordType: string;
    date: string;
    doctor: string;
    department: string;
    status: string;
    notes?: string;
    scannedReport?: ReportData;
  }) => void;
  patientMap: { [id: string]: string };
}

const CreateEditRecordDialog = ({
  open,
  onOpenChange,
  onSubmit,
  patientMap,
}: CreateEditRecordProps) => {
  const [activeTab, setActiveTab] = useState<"form" | "scan">("form");
  const [patientId, setPatientId] = useState("");
  const [recordType, setRecordType] = useState("");
  const [date, setDate] = useState("");
  const [doctor, setDoctor] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  // Scan report state
  const [reportTypeScan, setReportTypeScan] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanNotes, setScanNotes] = useState<string>("");
  const [isScanLoading, setIsScanLoading] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ReportData | null>(null);

  const { toast } = useToast();

  // Reset form on close
  React.useEffect(() => {
    if (!open) {
      setPatientId("");
      setRecordType("");
      setDate("");
      setDoctor("");
      setDepartment("");
      setStatus("");
      setNotes("");
      setReportTypeScan("");
      setImageFile(null);
      setPreviewUrl(null);
      setScanNotes("");
      setIsScanLoading(false);
      setActiveTab("form");
      setScanResult(null);
    }
  }, [open]);

  // File handling for scan
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  // Mock camera capture -- no actual image capture, just a toast for demo
  const captureImage = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      toast({
        title: "Camera activated",
        description: "Use the upload input or drag-and-drop to choose a file.",
      });
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access in your browser settings.",
        variant: "destructive",
      });
    }
  };

  // Scan/Analyze report action
  const analyzeReport = async () => {
    if (!reportTypeScan) {
      toast({
        title: "Report type required",
        description: "Please enter a report type before analyzing.",
        variant: "destructive",
      });
      return;
    }
    if (!imageFile && !previewUrl) {
      toast({
        title: "No report file",
        description: "Please upload or scan an image for analysis.",
        variant: "destructive",
      });
      return;
    }
    setIsScanLoading(true);

    // Simulate AI Analysis (mock, replace as needed)
    await new Promise(res => setTimeout(res, 1800));
    const analysis: ReportAnalysis = {
      summary: "Patient shows elevated blood glucose and mild hypertension.",
      diagnosis: "Type 2 Diabetes Mellitus (E11.9), early hypertension (I10).",
      recommendations: [
        "Daily glucose monitoring",
        "Reduce carbs in diet",
        "30 min moderate exercise/day",
        "Consider Metformin 500mg if needed",
      ],
      confidence: 0.89,
    };
    const newReport: ReportData = {
      id: `REC-${Date.now().toString().slice(-6)}`,
      patientId: patientId || "unknown",
      reportType: reportTypeScan,
      date: date || new Date().toISOString().split('T')[0],
      content: scanNotes,
      imageUrl: previewUrl || undefined,
      analysis,
    };
    setScanResult(newReport);
    toast({
      title: "Report analyzed",
      description: "The report has been analyzed and will be included in the record.",
    });
    setIsScanLoading(false);
  };

  // MAIN SUBMIT: include scannedReport if filled, else just the form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !recordType || !date || !doctor) return;
    onSubmit({
      patientId,
      recordType,
      date,
      doctor,
      department,
      status,
      notes,
      scannedReport: scanResult || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Medical Record</DialogTitle>
          <DialogDescription>
            Fill out medical record details. Optionally, scan & analyze a medical report for this entry.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={t => setActiveTab(t as "form" | "scan")} className="mb-4">
          <TabsList className="grid grid-cols-2 w-1/2 mx-auto">
            <TabsTrigger value="form">Record Form</TabsTrigger>
            <TabsTrigger value="scan">Scan Report</TabsTrigger>
          </TabsList>
          <TabsContent value="form">
            <form className="grid gap-4 mt-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="patient">Patient</Label>
                <select
                  id="patient"
                  className="w-full border rounded px-2 py-1"
                  value={patientId}
                  onChange={e => setPatientId(e.target.value)}
                  required
                >
                  <option value="">Select patient...</option>
                  {Object.entries(patientMap).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name} ({id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="recordType">Record Type</Label>
                <Input id="recordType" value={recordType} onChange={e => setRecordType(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="doctor">Doctor</Label>
                <Input id="doctor" value={doctor} onChange={e => setDoctor(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={department} onChange={e => setDepartment(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Input id="status" value={status} onChange={e => setStatus(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              {/* Display scan analysis summary if scanResult exists */}
              {scanResult && (
                <div className="rounded-lg border bg-accent/30 p-3 text-sm">
                  <p className="font-medium mb-2">Attached Scanned Report: <span className="text-blue-900">{scanResult.reportType}</span></p>
                  <p>{scanResult.analysis ? <><b>AI Diagnosis:</b> {scanResult.analysis.diagnosis}</> : "No analysis"}</p>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Record
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          <TabsContent value="scan">
            <div className="grid gap-4 mt-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="scanReportType" className="text-right">
                  Report Type
                </Label>
                <Input
                  id="scanReportType"
                  placeholder="Lab Result, X-Ray, MRI, etc."
                  className="col-span-3"
                  value={reportTypeScan}
                  onChange={(e) => setReportTypeScan(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reportFile" className="text-right">Report File</Label>
                <div className="col-span-3">
                  <Input
                    id="reportFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="scanNotes" className="text-right">Notes</Label>
                <Textarea
                  id="scanNotes"
                  placeholder="Add any notes about this report"
                  className="col-span-3"
                  value={scanNotes}
                  onChange={e => setScanNotes(e.target.value)}
                  rows={3}
                />
              </div>
              {previewUrl && (
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium mb-2">Image Preview</div>
                    <div className="max-h-[240px] overflow-auto">
                      <img
                        src={previewUrl}
                        alt="Report Preview"
                        className="max-w-full rounded-md border"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={captureImage}>
                  <Camera className="h-4 w-4 mr-2" /> Activate Camera
                </Button>
                <Button type="button" onClick={analyzeReport} disabled={isScanLoading}>
                  {isScanLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Analyze Report
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
            {scanResult && (
              <Card className="mt-4 border-green-400">
                <CardContent className="p-4">
                  <div className="font-bold mb-2">AI Analysis Result:</div>
                  <div className="text-sm text-green-900 mb-1">Diagnosis: {scanResult.analysis?.diagnosis}</div>
                  <div className="text-muted-foreground text-xs mb-1">Summary: {scanResult.analysis?.summary}</div>
                  <div>
                    <strong>Recommendations:</strong>
                    <ul className="list-disc ml-6">
                      {scanResult.analysis?.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-xs text-right mt-2 opacity-70">Confidence: {(scanResult.analysis?.confidence ?? 0 * 100).toFixed(0)}%</div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEditRecordDialog;
