
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [date, setDate] = useState("");
  // Form state
  const [recordType, setRecordType] = useState("");
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
      setDate("");
      setRecordType("");
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

  // Simulate camera (optional)
  const captureImage = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      toast({
        title: "Camera activated",
        description: "Use upload or drag-and-drop to choose a file.",
      });
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access in your browser settings.",
        variant: "destructive",
      });
    }
  };

  // AI analysis mock
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
        description: "Please upload or scan an image.",
        variant: "destructive",
      });
      return;
    }
    setIsScanLoading(true);
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
      date: date || new Date().toISOString().split("T")[0],
      content: scanNotes,
      imageUrl: previewUrl || undefined,
      analysis,
    };
    setScanResult(newReport);
    toast({
      title: "Report analyzed",
      description: "The report has been analyzed and added.",
    });
    setIsScanLoading(false);
  };

  // Unified submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !date ||
      (activeTab === "form" && (!recordType || !doctor))
    ) {
      toast({
        title: "Missing required fields",
        description: "Patient and Date are required on all tabs. Record Type and Doctor are required in Record Form.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      if (activeTab === "form") {
        await onSubmit({
          patientId, recordType, date, doctor, department, status, notes,
        });
      } else if (activeTab === "scan") {
        if (!scanResult) {
          toast({
            title: "No scanned report analyzed",
            description: "Please complete analysis before creating record.",
            variant: "destructive",
          });
          setSubmitting(false);
          return;
        }
        await onSubmit({
          patientId,
          recordType: scanResult.reportType,
          date,
          doctor: doctor || "N/A",
          department,
          status,
          notes: scanNotes,
          scannedReport: scanResult,
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error creating record",
        description: "There was a problem creating the medical record.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Common: Patient and Date selectors (always required)
  const patientAndDateSelectors = (
    <div className="grid grid-cols-2 gap-4">
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
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 flex flex-col h-[80vh]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Create New Medical Record</DialogTitle>
          <DialogDescription>
            Use tabs below to either fill out the record form or scan a report.
            Patient and Date are required for both options.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6">
          <Tabs
            value={activeTab}
            onValueChange={t => setActiveTab(t as "form" | "scan")}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-72 mx-auto mb-4">
              <TabsTrigger value="form">Record Form</TabsTrigger>
              <TabsTrigger value="scan">Scan Report</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1 px-6 overflow-auto">
          <div className="pb-4">
            {/* Patient & Date selection always on top */}
            {patientAndDateSelectors}
            {/* Record Form Tab Content */}
            {activeTab === "form" && (
              <form id="recordForm" onSubmit={handleFormSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="recordType">Record Type</Label>
                  <Input id="recordType" value={recordType} onChange={e => setRecordType(e.target.value)} required />
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
              </form>
            )}

            {/* Scan Report Tab Content */}
            {activeTab === "scan" && (
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="scanReportType">Report Type</Label>
                  <Input
                    id="scanReportType"
                    placeholder="Lab Result, X-Ray, MRI, etc."
                    value={reportTypeScan}
                    onChange={(e) => setReportTypeScan(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="reportFile">Report File</Label>
                  <Input
                    id="reportFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <div>
                  <Label htmlFor="scanNotes">Notes</Label>
                  <Textarea
                    id="scanNotes"
                    placeholder="Add any notes about this report"
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
                  <Button type="button" onClick={analyzeReport} disabled={isScanLoading || !patientId || !date}>
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
                {/* Analysis Result Card */}
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
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Footer with action buttons (always visible) */}
        <DialogFooter className="p-6 border-t bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={activeTab === "form" ? "recordForm" : undefined}
            disabled={submitting}
            onClick={activeTab === "scan" ? handleFormSubmit : undefined}
          >
            {submitting ? "Creating..." : "Create Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEditRecordDialog;
