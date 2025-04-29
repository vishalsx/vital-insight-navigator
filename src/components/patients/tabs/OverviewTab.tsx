
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare } from "lucide-react";

interface OverviewTabProps {
  patient: any;
}

export default function OverviewTab({ patient }: OverviewTabProps) {
  if (!patient) return null;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Address</p>
              <p>{patient.address}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Phone</p>
              <p>{patient.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p>{patient.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Emergency Contact</p>
              <p>{patient.emergency_contact}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Insurance</p>
              <p>{patient.insurance}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Physical Info</p>
              <p>Height: {patient.height} • Weight: {patient.weight}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentVitalsCard />
        <UpcomingAppointmentsCard />
      </div>
    </div>
  );
}

function RecentVitalsCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Recent Vitals</h3>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Blood Pressure</span>
            <span className="font-medium">128/83 mmHg</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Heart Rate</span>
            <span className="font-medium">73 bpm</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Temperature</span>
            <span className="font-medium">98.6°F</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Respiratory Rate</span>
            <span className="font-medium">16 breaths/min</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Oxygen Saturation</span>
            <span className="font-medium">98%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingAppointmentsCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Upcoming Appointments</h3>
          <Button variant="ghost" size="sm">
            Schedule New
          </Button>
        </div>
        <div className="space-y-4">
          <div className="p-3 rounded-lg border bg-secondary/40">
            <p className="font-medium">Annual Check-up</p>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              July 28, 2023 • 10:00 AM
            </div>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MessageSquare className="h-3 w-3 mr-1" />
              Dr. Sarah Chen
            </div>
          </div>
          <div className="p-3 rounded-lg border">
            <p className="font-medium">Blood Work</p>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              August 5, 2023 • 8:30 AM
            </div>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MessageSquare className="h-3 w-3 mr-1" />
              Lab Department
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
