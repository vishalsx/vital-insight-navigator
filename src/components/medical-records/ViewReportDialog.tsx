
import React, { useRef, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, Share2, AlertCircle, FileText, User, Calendar, UserRound, Building, ClipboardList, FileInput } from "lucide-react";
import { ReportData } from "./ScanReportDialog";
import ReportAnalysisCard from "./ReportAnalysisCard";
import { formatDate } from "@/utils/dateUtils";
import { MedicalRecord, MedicalRecommendation, WebhookRecommendationResponse } from "@/types/medicalRecords";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import RecommendationsCard from "./RecommendationsCard";

interface ViewReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: MedicalRecord | null;
}

const ViewReportDialog = ({ open, onOpenChange, record }: ViewReportDialogProps) => {
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  const [recommendation, setRecommendation] = useState<MedicalRecommendation | null>(null);
  
  useEffect(() => {
    if (record && open) {
      // Try to parse recommendation data if it exists
      try {
        // Check for webhook data first (try to parse it from notes or other fields)
        const notesContent = record.notes || '';
        if (notesContent.includes('"recommendation"') || notesContent.includes('"output"')) {
          try {
            // Try to parse the entire notes as a webhook response
            const webhookData: WebhookRecommendationResponse = JSON.parse(notesContent);
            if (webhookData.recommendation?.output) {
              // Find the JSON object within the output string
              const jsonMatch = webhookData.recommendation.output.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const recommendationData: MedicalRecommendation = JSON.parse(jsonMatch[0]);
                setRecommendation(recommendationData);
                return;
              }
            }
          } catch (err) {
            console.error("Failed to parse webhook data from notes:", err);
          }
        }
        
        // Next check if the record might have scannedReport with analysis
        if (record.scannedReport?.analysis) {
          // Map the analysis data to the recommendation format if possible
          const analysis = record.scannedReport.analysis;
          
          // Check if recommendations is just a string
          let formattedRecommendations: string[] = [];
          if (typeof analysis.recommendations === 'string') {
            formattedRecommendations = [analysis.recommendations];
          } else if (Array.isArray(analysis.recommendations)) {
            formattedRecommendations = analysis.recommendations;
          }

          // Create a simple recommendation object from the analysis
          const recommendationFromAnalysis: MedicalRecommendation = {
            primary_diagnosis: analysis.diagnosis,
            additional_notes: analysis.summary,
            recommendations: {
              further_tests: formattedRecommendations,
              follow_up: "Please consult with your healthcare provider"
            }
          };
          
          setRecommendation(recommendationFromAnalysis);
        } else {
          setRecommendation(null);
        }
      } catch (error) {
        console.error("Error processing recommendation data:", error);
        setRecommendation(null);
      }
    }
  }, [record, open]);
  
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
  
  // Get notes from the appropriate location - prefer notes field, fall back to scannedReport content
  const notes = record.notes || (hasScannedReport ? record.scannedReport?.content : "");

  // Handle print functionality
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Blocked Popup",
        description: "Please allow popups for this site to print records.",
        variant: "destructive"
      });
      return;
    }
    
    // Create printable content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Medical Record: ${record.recordType}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
          h1 { font-size: 20px; margin-bottom: 10px; }
          h2 { font-size: 16px; margin-top: 20px; margin-bottom: 10px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
          .info-item { margin-bottom: 10px; }
          .label { font-weight: bold; margin-bottom: 3px; }
          img { max-width: 100%; height: auto; }
          @media print {
            button { display: none; }
            .page-break { page-break-before: always; }
          }
        </style>
      </head>
      <body>
        <button onclick="window.print()" style="padding: 8px 16px; margin-bottom: 20px; background: #0f766e; color: white; border: none; border-radius: 4px; cursor: pointer;">Print</button>
        
        <h1>Medical Record: ${record.recordType}</h1>
        <p>Patient ID: ${record.patientId} | Date: ${formatDate(record.date)}</p>
        
        <h2>Record Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="label">Patient:</div>
            <div>${record.patientName}</div>
          </div>
          <div class="info-item">
            <div class="label">Date:</div>
            <div>${formatDate(record.date)}</div>
          </div>
          <div class="info-item">
            <div class="label">Doctor:</div>
            <div>${record.doctor || "Not specified"}</div>
          </div>
          <div class="info-item">
            <div class="label">Department:</div>
            <div>${record.department || "Not specified"}</div>
          </div>
          <div class="info-item">
            <div class="label">Status:</div>
            <div>${record.status || "Not specified"}</div>
          </div>
          <div class="info-item">
            <div class="label">Record Type:</div>
            <div>${record.recordType}</div>
          </div>
        </div>
        
        <h2>Notes</h2>
        <p>${notes || "No notes available"}</p>
        
        ${hasScannedReport && record.scannedReport?.imageUrl ? `
          <div class="page-break"></div>
          <h2>Report Image</h2>
          <img src="${record.scannedReport.imageUrl}" alt="${record.recordType} Report" style="max-width: 100%;" />
        ` : ''}
        
        ${hasScannedReport && record.scannedReport?.analysis ? `
          <div class="page-break"></div>
          <h2>Analysis</h2>
          <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
            ${record.scannedReport.analysis.summary ? `
              <div style="margin-bottom: 15px;">
                <div class="label">Summary:</div>
                <div>${record.scannedReport.analysis.summary}</div>
              </div>
            ` : ''}
            
            ${record.scannedReport.analysis.diagnosis ? `
              <div style="margin-bottom: 15px;">
                <div class="label">Diagnosis:</div>
                <div>${record.scannedReport.analysis.diagnosis}</div>
              </div>
            ` : ''}
            
            ${record.scannedReport.analysis.recommendations ? `
              <div style="margin-bottom: 15px;">
                <div class="label">Recommendations:</div>
                <div>${record.scannedReport.analysis.recommendations}</div>
              </div>
            ` : ''}
            
            ${record.scannedReport.analysis.confidence !== undefined ? `
              <div>
                <div class="label">AI Confidence:</div>
                <div>${record.scannedReport.analysis.confidence}%</div>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    toast({
      title: "Print Ready",
      description: "Print dialog should open automatically.",
    });
  };
  
  // Handle download functionality
  const handleDownload = () => {
    // Create a JSON representation of the record
    const recordData = {
      id: record.id,
      patient: {
        id: record.patientId,
        name: record.patientName
      },
      recordType: record.recordType,
      date: record.date,
      doctor: record.doctor,
      department: record.department,
      status: record.status,
      notes: notes,
      scannedReport: record.scannedReport ? {
        reportType: record.scannedReport.reportType,
        imageUrl: record.scannedReport.imageUrl,
        content: record.scannedReport.content,
        analysis: record.scannedReport.analysis
      } : null
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(recordData, null, 2);
    
    // Create a blob
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `medical-record-${record.id}.json`;
    
    // Append to body, click and remove
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    toast({
      title: "Record Downloaded",
      description: `Medical record has been downloaded as JSON.`,
    });
  };
  
  // Handle share functionality
  const handleShare = async () => {
    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Medical Record: ${record.recordType}`,
          text: `Medical record for patient ${record.patientName} from ${formatDate(record.date)}`,
          // URL must be absolute, we're using the current URL as an example
          url: window.location.href,
        });
        
        toast({
          title: "Shared Successfully",
          description: "Record was shared successfully.",
        });
      } catch (error) {
        // User canceled or share failed
        console.error('Sharing failed:', error);
        
        if ((error as Error).name !== 'AbortError') {
          toast({
            title: "Share Failed",
            description: "Could not share the record.",
            variant: "destructive"
          });
        }
      }
    } else {
      // Fallback for browsers that don't support sharing
      try {
        await navigator.clipboard.writeText(
          `Medical Record: ${record.recordType}\n` +
          `Patient: ${record.patientName}\n` +
          `Date: ${formatDate(record.date)}\n` +
          `Notes: ${notes || 'None'}`
        );
        
        toast({
          title: "Record Info Copied",
          description: "Record details copied to clipboard. You can paste and share it.",
        });
      } catch (err) {
        toast({
          title: "Copy Failed",
          description: "Could not copy record information to clipboard.",
          variant: "destructive"
        });
      }
    }
  };

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
          <div className="grid grid-cols-1 gap-6 pr-4" ref={contentRef}>
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

            {/* Medical Recommendations Section */}
            {recommendation && (
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-4">Medical Recommendations</h3>
                <RecommendationsCard recommendation={recommendation} />
              </div>
            )}

            {/* Notes section - display notes from either source */}
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <FileInput className="h-5 w-5 mr-2 text-primary" />
                Notes
              </h3>
              {notes ? (
                <p className="text-sm">{notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No notes available
                </p>
              )}
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
          </div>
        </ScrollArea>

        <DialogFooter className="flex flex-wrap justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
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
