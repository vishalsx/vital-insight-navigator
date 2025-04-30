
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, Share2 } from "lucide-react";
import { ReportData } from "./ScanReportDialog";
import ReportAnalysisCard from "./ReportAnalysisCard";
import { formatDate } from "@/utils/dateUtils";

interface ViewReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ReportData | null;
}

const ViewReportDialog = ({ open, onOpenChange, report }: ViewReportDialogProps) => {
  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Medical Report: {report.reportType}</DialogTitle>
          <DialogDescription>
            Patient ID: {report.patientId} | Date: {formatDate(report.date)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Report Image</h3>
            {report.imageUrl ? (
              <div className="border rounded-md overflow-hidden">
                <img 
                  src={report.imageUrl} 
                  alt={`${report.reportType} Report`} 
                  className="w-full object-contain"
                />
              </div>
            ) : (
              <div className="border rounded-md p-6 flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
            
            {report.content && (
              <div>
                <h4 className="text-sm font-medium mb-2">Notes</h4>
                <p className="text-sm">{report.content}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">AI Analysis</h3>
            {report.analysis ? (
              <ReportAnalysisCard analysis={report.analysis} />
            ) : (
              <div className="border rounded-md p-6 flex items-center justify-center text-muted-foreground">
                No analysis available
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-wrap justify-end gap-2 mt-6">
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
