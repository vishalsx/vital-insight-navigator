
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Calendar, Activity, AlertCircle } from "lucide-react";

interface PatientInfoSidebarProps {
  patient: any;
}

export default function PatientInfoSidebar({ patient }: PatientInfoSidebarProps) {
  if (!patient) return null;

  const getInitials = (name: string) => {
    return name.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="w-full md:w-80 flex-shrink-0">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {getInitials(patient.name || 'Patient')}
            </AvatarFallback>
          </Avatar>

          <h2 className="text-xl font-bold">{patient.name}</h2>
          <p className="text-muted-foreground">
            {patient.age} • {patient.gender} • {patient.blood_type}
          </p>
          <Badge className="mt-2">{patient.status}</Badge>

          <div className="w-full mt-6 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Date of Birth</p>
                <p className="text-muted-foreground">{patient.dob}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Patient ID</p>
                <p className="text-muted-foreground">{patient.id}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Medical Condition</p>
                <p className="text-muted-foreground">{patient.condition}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <div>
                <p className="font-medium">Allergies</p>
                <p className="text-muted-foreground">{patient.allergies}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
