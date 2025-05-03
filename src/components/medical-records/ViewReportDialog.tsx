
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, Share2, AlertCircle, FileText, User, Calendar, UserRound, Building, ClipboardList } from "lucide-react";
import { ReportData } from "./ScanReportDialog";
import ReportAnalysisCard from "./ReportAnalysisCard";
import { formatDate } from "@/utils/dateUtils";
import { MedicalRecord } from "@/types/medicalRecords";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ViewReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: MedicalRecord | null;
}

const ViewReportDialog = ({ open, onOpenChange, record }: ViewReportDialogProps) => {
  // If there's no record data, render an appropriate message
  if (!record) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
              Record Not Available
            </DialogTitle>
            <DialogDescription>
              The medical record you're trying to view is not available.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const hasScannedReport = Boolean(record.scannedReport);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Medical Record: {record.recordType}</DialogTitle>
          <DialogDescription>
            Patient ID: {record.patientId} | Date: {formatDate(record.date)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 gap-6 pr-4">
            {/* Basic Medical Record Info */}
            <div className="border rounded-md p-4 bg-muted/20">
              <h3 className="text-lg font-medium mb-4">Record Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Patient</p>
                    <p className="text-sm text-muted-foreground">{record.patientName}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(record.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <UserRound className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Doctor</p>
                    <p className="text-sm text-muted-foreground">{record.doctor || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Department</p>
                    <p className="text-sm text-muted-foreground">{record.department || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <ClipboardList className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">{record.status || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Record Type</p>
                    <p className="text-sm text-muted-foreground">{record.recordType}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Show these sections only if it's a scanned report */}
            {hasScannedReport && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Report Image</h3>
                  {record.scannedReport?.imageUrl ? (
                    <div className="border rounded-md overflow-hidden">
                      <img 
                        src={record.scannedReport.imageUrl} 
                        alt={`${record.scannedReport.reportType} Report`} 
                        className="w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="border rounded-md p-6 flex items-center justify-center text-muted-foreground">
                      No image available
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">AI Analysis</h3>
                  {record.scannedReport?.analysis ? (
                    <ReportAnalysisCard analysis={record.scannedReport.analysis} />
                  ) : (
                    <div className="border rounded-md p-6 flex items-center justify-center text-muted-foreground">
                      No analysis available
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes section - display for both regular records and scanned reports */}
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-2">Notes</h3>
              {record.scannedReport?.content ? (
                <p className="text-sm">{record.scannedReport.content}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {/* If there's no scanned report, check if we stored notes elsewhere */}
                  No notes available
                </p>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex flex-wrap justify-end gap-2 mt-4">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewReportDialog;
