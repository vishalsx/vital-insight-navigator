
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardList, 
  FileText, 
  CalendarCheck, 
  UserPlus, 
  ListChecks, 
  Pill,
  BookOpen 
} from "lucide-react";
import { MedicalRecommendation } from "@/types/medicalRecords";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface RecommendationsCardProps {
  recommendation: MedicalRecommendation;
  showPatientInfo?: boolean;
}

const RecommendationsCard = ({ recommendation, showPatientInfo = true }: RecommendationsCardProps) => {
  // Helper to check if a section has data
  const hasData = (section: any): boolean => {
    if (!section) return false;
    if (Array.isArray(section)) return section.length > 0;
    if (typeof section === 'string') return section.trim().length > 0;
    if (typeof section === 'object') return Object.keys(section).length > 0;
    return false;
  };

  const hasSupportingEvidence = hasData(recommendation.supporting_evidence);
  const hasRecommendations = hasData(recommendation.recommendations);
  const hasTests = recommendation.recommendations?.further_tests && recommendation.recommendations.further_tests.length > 0;
  const hasMedications = recommendation.recommendations?.medications && recommendation.recommendations.medications.length > 0;
  const hasLifestyleAdvice = recommendation.recommendations?.lifestyle_advice && recommendation.recommendations.lifestyle_advice.length > 0;
  const hasFollowUp = recommendation.recommendations?.follow_up;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <ClipboardList className="h-5 w-5 mr-2 text-primary" />
            Medical Recommendations
          </CardTitle>
          {recommendation.primary_diagnosis && (
            <Badge variant="outline" className="font-normal">
              {recommendation.primary_diagnosis}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showPatientInfo && (
          <div className="flex flex-wrap gap-4 text-sm">
            {recommendation.patient_id && (
              <div className="flex items-center">
                <UserPlus className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="font-medium mr-1">Patient ID:</span>
                {recommendation.patient_id}
              </div>
            )}
            {recommendation.patient_age && (
              <div className="flex items-center">
                <span className="font-medium mr-1">Age:</span>
                {recommendation.patient_age}
              </div>
            )}
            {recommendation.patient_sex && (
              <div className="flex items-center">
                <span className="font-medium mr-1">Sex:</span>
                {recommendation.patient_sex}
              </div>
            )}
          </div>
        )}

        <Accordion type="single" collapsible className="w-full border rounded-md">
          {hasSupportingEvidence && (
            <AccordionItem value="evidence">
              <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center text-sm font-medium">
                  <BookOpen className="h-4 w-4 mr-2 text-primary" />
                  Supporting Evidence
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(recommendation.supporting_evidence || {}).map(([key, value]) => (
                    <div 
                      key={key} 
                      className="p-3 border rounded-md bg-muted/40 hover:bg-muted/70 transition-colors"
                    >
                      <div className="font-medium capitalize text-sm">{key.replace(/_/g, ' ')}</div>
                      <div className="text-sm mt-1">{value}</div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {hasRecommendations && (
            <AccordionItem value="recommendations">
              <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center text-sm font-medium">
                  <ListChecks className="h-4 w-4 mr-2 text-muted-foreground" />
                  Recommendations
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-0 divide-y">
                {hasTests && (
                  <div className="py-4">
                    <h4 className="text-sm font-medium mb-2">Further Tests</h4>
                    <ul className="space-y-1 text-sm list-disc pl-5">
                      {recommendation.recommendations?.further_tests?.map((test, idx) => (
                        <li key={idx}>{test}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {hasMedications && (
                  <div className="py-4">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Pill className="h-4 w-4 mr-1 text-muted-foreground" />
                      Medications
                    </h4>
                    <ul className="space-y-1 text-sm list-disc pl-5">
                      {recommendation.recommendations?.medications?.map((medication, idx) => (
                        <li key={idx}>{medication}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {hasLifestyleAdvice && (
                  <div className="py-4">
                    <h4 className="text-sm font-medium mb-2">Lifestyle Advice</h4>
                    <ul className="space-y-1 text-sm list-disc pl-5">
                      {recommendation.recommendations?.lifestyle_advice?.map((advice, idx) => (
                        <li key={idx}>{advice}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {hasFollowUp && (
                  <div className="py-4">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <CalendarCheck className="h-4 w-4 mr-1 text-muted-foreground" />
                      Follow-Up
                    </h4>
                    <p className="text-sm">{recommendation.recommendations?.follow_up}</p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )}

          {recommendation.additional_notes && (
            <AccordionItem value="notes">
              <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center text-sm font-medium">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  Additional Notes
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4">
                <p className="text-sm">{recommendation.additional_notes}</p>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        {!hasSupportingEvidence && !hasRecommendations && !recommendation.additional_notes && (
          <div className="text-center text-muted-foreground py-4">
            No recommendation details available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationsCard;
