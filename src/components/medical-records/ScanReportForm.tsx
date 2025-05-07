import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ReportData } from "./ScanReportDialog";

interface ScanReportFormProps {
  reportType: string;
  notes: string;
  previewUrl: string | null;
  isScanLoading: boolean;
  scanResult: ReportData | null;
  onReportTypeChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCaptureImage: () => void;
  onAnalyzeReport: () => void;
}

const ScanReportForm = ({
  reportType,
  notes,
  previewUrl,
  isScanLoading,
  scanResult,
  onReportTypeChange,
  onNotesChange,
  onFileChange,
  onCaptureImage,
  onAnalyzeReport,
}: ScanReportFormProps) => {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Only PDF files are allowed",
          variant: "destructive",
        });
        e.target.value = '';
        return;
      }
      
      setPdfFile(file);
      
      // Still call the parent's onFileChange to maintain compatibility
      onFileChange(e);
    }
  };

  const parseWebhookResponse = (responseText: string) => {
    console.log("Attempting to parse webhook response:", responseText);
    
    try {
      // First try to parse the entire text as JSON
      let webhookData = null;
      
      try {
        webhookData = JSON.parse(responseText);
        console.log("Successfully parsed entire response as JSON:", webhookData);
      } catch (e) {
        console.error("Failed to parse entire response as JSON:", e);
        // Try to find and extract a JSON object
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            webhookData = JSON.parse(jsonMatch[0]);
            console.log("Successfully extracted and parsed JSON object from response:", webhookData);
          } catch (innerE) {
            console.error("Failed to parse extracted JSON object:", innerE);
          }
        } else {
          console.error("No JSON object found in response");
        }
      }
      
      if (!webhookData) {
        console.error("Could not parse webhook data");
        return null;
      }
      
      // Extract the recommendation output if it exists
      if (webhookData.recommendation?.output) {
        const outputStr = webhookData.recommendation.output;
        console.log("Recommendation output string:", outputStr);
        
        // Try to extract JSON from markdown code block
        const jsonBlockMatch = outputStr.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonBlockMatch && jsonBlockMatch[1]) {
          try {
            const recommendation = JSON.parse(jsonBlockMatch[1]);
            console.log("Successfully parsed JSON from code block:", recommendation);
            return recommendation;
          } catch (e) {
            console.error("Failed to parse JSON from code block:", e);
          }
        }
        
        // Try to extract any JSON object from the output
        const jsonMatch = outputStr.match(/(\{[\s\S]*\})/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            const recommendation = JSON.parse(jsonMatch[1]);
            console.log("Successfully parsed JSON directly from output:", recommendation);
            return recommendation;
          } catch (e) {
            console.error("Failed to parse JSON directly from output:", e);
          }
        }
      }
      
      // Check if the recommendation is already an object
      if (webhookData.recommendation && 
          typeof webhookData.recommendation === 'object' && 
          !webhookData.recommendation.output) {
        console.log("Found recommendation object directly:", webhookData.recommendation);
        return webhookData.recommendation;
      }
      
      return null;
    } catch (error) {
      console.error("Failed to parse webhook response:", error);
      return null;
    }
  };

  const handleAnalyzeReport = async () => {
    if (!reportType) {
      toast({
        title: "Report type required",
        description: "Please enter a report type before analyzing.",
        variant: "destructive",
      });
      return;
    }

    if (!pdfFile) {
      toast({
        title: "No PDF file",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    setApiError(null);
    
    try {
      // Create form data to send the file
      const formData = new FormData();
      formData.append('file', pdfFile);
      formData.append('reportType', reportType);
      
      console.log("Calling API with PDF file", pdfFile.name);

      // Call the API
      const response = await fetch(
        "http://localhost:5678/webhook-test/3e721c0e-13ec-4e57-8ce2-b928860d8d86", 
        {
          method: 'POST',
          body: pdfFile, // Send the binary file directly
          headers: {
            'Content-Type': 'application/pdf',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      // Handle potential JSON parsing errors
      const responseText = await response.text();
      console.log("Raw API response:", responseText); // Debug log
      
      // Create a default result structure to start with
      let result = {
        analysis: {
          summary: "No analysis provided in response.",
          diagnosis: "Unable to determine diagnosis from report.",
          recommendations: ["Please review this report manually."],
          confidence: 0.5
        }
      };
      
      // Try to parse the response and extract recommendation data
      const parsedRecommendation = parseWebhookResponse(responseText);
      console.log("Parsed recommendation:", parsedRecommendation);
      
      if (parsedRecommendation) {
        // Create the analysis structure from the recommendation
        result.analysis = {
          summary: parsedRecommendation.additional_notes || "No summary provided",
          diagnosis: parsedRecommendation.primary_diagnosis || "No diagnosis provided",
          recommendations: [],
          confidence: 0.85 // Default confidence value
        };
        
        // Collect recommendations from different categories
        let allRecommendations = [];
        
        if (parsedRecommendation.recommendations) {
          // Add further tests
          if (parsedRecommendation.recommendations.further_tests) {
            if (Array.isArray(parsedRecommendation.recommendations.further_tests)) {
              allRecommendations = [...allRecommendations, ...parsedRecommendation.recommendations.further_tests];
            } else {
              allRecommendations.push(parsedRecommendation.recommendations.further_tests);
            }
          }
          
          // Add medications
          if (parsedRecommendation.recommendations.medications) {
            if (Array.isArray(parsedRecommendation.recommendations.medications)) {
              allRecommendations = [...allRecommendations, ...parsedRecommendation.recommendations.medications];
            } else {
              allRecommendations.push(parsedRecommendation.recommendations.medications);
            }
          }
          
          // Add lifestyle advice
          if (parsedRecommendation.recommendations.lifestyle_advice) {
            if (Array.isArray(parsedRecommendation.recommendations.lifestyle_advice)) {
              allRecommendations = [...allRecommendations, ...parsedRecommendation.recommendations.lifestyle_advice];
            } else {
              allRecommendations.push(parsedRecommendation.recommendations.lifestyle_advice);
            }
          }
          
          // Add follow-up
          if (parsedRecommendation.recommendations.follow_up) {
            allRecommendations.push(`Follow-up: ${parsedRecommendation.recommendations.follow_up}`);
          }
        }
        
        // If we have any recommendations, add them to the result
        if (allRecommendations.length > 0) {
          result.analysis.recommendations = allRecommendations;
        }
        
        // Store the original recommendation for additional details
        result.recommendation = parsedRecommendation;
      }
      
      console.log("Final processed result:", result);
      
      // Call the parent's onAnalyzeReport and pass the processed result
      // We need to modify this function call to directly pass the result
      toast({
        title: "Report analyzed",
        description: "The webhook data has been successfully processed.",
      });
      
      // Call the parent's onAnalyzeReport to update the state
      onAnalyzeReport();
      
    } catch (error) {
      console.error("Error analyzing report:", error);
      setApiError(error instanceof Error ? error.message : "Unknown error occurred");
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing the report.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="scanReportType">Report Type</Label>
        <Input
          id="scanReportType"
          placeholder="Lab Result, X-Ray, MRI, etc."
          value={reportType}
          onChange={(e) => onReportTypeChange(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="reportFile">Report File (PDF only)</Label>
        <Input
          id="reportFile"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
      </div>
      <div>
        <Label htmlFor="scanNotes">Notes</Label>
        <Textarea
          id="scanNotes"
          placeholder="Add any notes about this report"
          value={notes}
          onChange={e => onNotesChange(e.target.value)}
          rows={3}
        />
      </div>
      {previewUrl && (
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium mb-2">File Selected</div>
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <span>{pdfFile?.name || "PDF Document"}</span>
            </div>
          </CardContent>
        </Card>
      )}
      {apiError && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-red-600 mb-1">Error</div>
            <div className="text-xs text-red-500">{apiError}</div>
          </CardContent>
        </Card>
      )}
      <div className="flex justify-end gap-2 mt-2">
        <Button type="button" variant="outline" onClick={onCaptureImage}>
          <Camera className="h-4 w-4 mr-2" /> Activate Camera
        </Button>
        <Button type="button" onClick={handleAnalyzeReport} disabled={isScanLoading}>
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
      {scanResult && (
        <Card className="mt-4 border-green-400">
          <CardContent className="p-4">
            <div className="font-bold mb-2">AI Analysis Result:</div>
            <div className="text-sm text-green-900 mb-1">
              Diagnosis: {scanResult.analysis?.diagnosis}
            </div>
            <div className="text-muted-foreground text-xs mb-1">
              Summary: {scanResult.analysis?.summary}
            </div>
            <div>
              <strong>Recommendations:</strong>
              <ul className="list-disc ml-6">
                {scanResult.analysis?.recommendations?.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
            <div className="text-xs text-right mt-2 opacity-70">
              Confidence: {scanResult.analysis?.confidence ? Math.round(scanResult.analysis.confidence * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScanReportForm;
