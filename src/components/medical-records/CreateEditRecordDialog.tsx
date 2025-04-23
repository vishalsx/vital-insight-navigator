
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
import { ScrollArea } from "@/components/ui/scroll-area";
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

  const [submitting, setSubmitting] = useState(false);
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
      setSubmitting(false);
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
    setActiveTab("form");
  };

  // Insert new medical record to supabase (backend functionality for "Create Record")
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !recordType || !date || !doctor) {
      toast({
        title: "Missing required fields",
        description: "Fill in all required fields (patient, type, date, doctor).",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);

    // Prepare payload
    const payload: any = {
      patient_id: patientId,
      record_type: recordType,
      date,
      doctor,
      department,
      status,
      scanned_report: scanResult
        ? scanResult
        : notes
        ? {
            id: `REC-${Date.now().toString().slice(-6)}`,
            patientId,
            reportType: recordType,
            date,
            content: notes,
          }
        : null,
    };

    // Save to Supabase
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase.from("medical_records")
      .insert(payload)
      .select()
      .single();

    setSubmitting(false);

    if (error) {
      toast({
        title: "Failed to add record",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Medical record added",
      description: "The new medical record has been added successfully.",
    });

    // Pass the new record details for frontend list updates
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

  // Form body with scrollable area and sticky footer
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl flex flex-col p-0">
        {/* Main header */}
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Create New Medical Record</DialogTitle>
          <DialogDescription>
            Fill out the medical record details. Optionally, scan & analyze a medical report for this entry.
          </DialogDescription>
        </DialogHeader>
        {/* Tabs for switching "Form" and "Scan" */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={t => setActiveTab(t as "form" | "scan")} className="w-full flex-1 flex flex-col min-h-0">
            <TabsList className="grid grid-cols-2 w-72 mx-auto mt-4 mb-2">
              <TabsTrigger value="form">Record Form</TabsTrigger>
              <TabsTrigger value="scan">Scan Report</TabsTrigger>
            </TabsList>
            <div className="px-6 flex-1 min-h-0 relative">
              {/* Make scrollable area for form/scan content */}
              <div className="h-[52vh] overflow-y-auto pb-8">
                {/* FORM TAB */}
                <TabsContent value="form" forceMount>
                  <form className="grid gap-4 mt-2" id="recordForm" onSubmit={handleSubmit}>
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
                      <div className="rounded-lg border bg-accent/30 p-3 text-sm mt-2">
                        <p className="font-medium mb-2">Attached Scanned Report: <span className="text-blue-900">{scanResult.reportType}</span></p>
                        <p>{scanResult.analysis ? <><b>AI Diagnosis:</b> {scanResult.analysis.diagnosis}</> : "No analysis"}</p>
                      </div>
                    )}
                  </form>
                </TabsContent>
                {/* SCAN TAB */}
                <TabsContent value="scan" forceMount>
                  <div className="grid gap-4 mt-3">
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
                          <div className="max-h-[200px] overflow-auto">
                            <img
                              src={previewUrl}
                              alt="Report Preview"
                              className="max-w-full rounded-md border"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    <div className="flex justify-end gap-2 mt-2">
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
                    </div>
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
              </div>
            </div>
          </Tabs>
        </div>
        {/* Footer: always visible & sticky */}
        <DialogFooter className="px-6 py-4 border-t shrink-0 bg-white z-20 sticky bottom-0 left-0">
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="recordForm" disabled={submitting}>
            {submitting ? "Creating..." : "Create Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEditRecordDialog;
