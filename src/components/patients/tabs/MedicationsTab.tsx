
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";

export default function MedicationsTab() {
  const medications = [
    {
      name: "Lisinopril",
      dose: "10mg",
      frequency: "Once daily",
      startDate: "2022-11-10",
      endDate: null,
      prescribedBy: "Dr. Sarah Chen",
      status: "Active",
    },
    {
      name: "Albuterol Inhaler",
      dose: "2 puffs",
      frequency: "As needed for wheezing",
      startDate: "2023-04-02",
      endDate: null,
      prescribedBy: "Dr. Michael Rodriguez",
      status: "Active",
    },
    {
      name: "Atorvastatin",
      dose: "20mg",
      frequency: "Once daily",
      startDate: "2022-06-23",
      endDate: "2023-01-15",
      prescribedBy: "Dr. Sarah Chen",
      status: "Discontinued",
    },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">Medications</h3>
          <Button>
            <Pill className="mr-2 h-4 w-4" /> Add Medication
          </Button>
        </div>
        
        <div className="space-y-4">
          {medications.map((med, index) => (
            <div 
              key={index} 
              className="p-4 rounded-lg border bg-card flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{med.name}</h4>
                  <Badge variant={med.status === "Active" ? "default" : "secondary"}>
                    {med.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {med.dose} • {med.frequency}
                </p>
              </div>
              
              <div className="text-sm">
                <p>
                  <span className="text-muted-foreground mr-1">Start Date:</span>
                  {formatDate(med.startDate)}
                </p>
                {med.endDate && (
                  <p>
                    <span className="text-muted-foreground mr-1">End Date:</span>
                    {formatDate(med.endDate)}
                  </p>
                )}
                <p>
                  <span className="text-muted-foreground mr-1">Prescribed by:</span>
                  {med.prescribedBy}
                </p>
              </div>
              
              <div className="flex gap-2 md:flex-col">
                <Button size="sm" variant="outline">Renew</Button>
                <Button size="sm" variant="ghost">Edit</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
