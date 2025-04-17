
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Clock, Plus, User, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Mock appointment data
const appointments = [
  {
    id: 1,
    patientName: "John Doe",
    patientId: "P-1001",
    date: new Date("2025-04-18T09:30:00"),
    duration: 30,
    status: "confirmed",
    type: "check-up",
    notes: "Regular blood pressure check"
  },
  {
    id: 2,
    patientName: "Jane Smith",
    patientId: "P-1002",
    date: new Date("2025-04-18T11:00:00"),
    duration: 45,
    status: "pending",
    type: "consultation",
    notes: "Follow-up on medication effects"
  },
  {
    id: 3,
    patientName: "Robert Johnson",
    patientId: "P-1003",
    date: new Date("2025-04-19T14:15:00"),
    duration: 60,
    status: "confirmed",
    type: "procedure",
    notes: "X-ray for shoulder pain"
  },
  {
    id: 4,
    patientName: "Emily Wilson",
    patientId: "P-1004",
    date: new Date("2025-04-20T10:00:00"),
    duration: 30,
    status: "cancelled",
    type: "check-up",
    notes: "Annual checkup"
  }
];

const Appointments = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredAppointments = appointments.filter(
    app => app.date.toDateString() === (date?.toDateString() || '')
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setDialogOpen(false);
    toast({
      title: "Appointment Scheduled",
      description: "The appointment has been successfully scheduled.",
    });
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAppointment} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input id="patientName" placeholder="Enter patient name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient ID</Label>
                  <Input id="patientId" placeholder="Enter patient ID" required />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      className="pl-10"
                      required
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="time"
                      type="time"
                      className="pl-10"
                      required
                      defaultValue="09:00"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Appointment Type</Label>
                <select
                  id="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="">Select type</option>
                  <option value="check-up">Check-up</option>
                  <option value="consultation">Consultation</option>
                  <option value="procedure">Procedure</option>
                  <option value="follow-up">Follow-up</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Add notes about the appointment" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Schedule</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>{date?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4 space-y-4">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <div 
                      key={appointment.id} 
                      className="flex flex-col gap-2 rounded-lg border p-4 transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-medium">{appointment.patientName}</span>
                          <span className="text-xs text-muted-foreground">({appointment.patientId})</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatTime(appointment.date)} · {appointment.duration} mins</span>
                        </div>
                        <p className="mt-1 text-sm">{appointment.notes}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(appointment.status)}
                        >
                          {appointment.status}
                        </Badge>
                        <Badge variant="outline">{appointment.type}</Badge>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8"
                          onClick={() => {
                            toast({
                              title: "Appointment Cancelled",
                              description: `Appointment for ${appointment.patientName} has been cancelled.`,
                            });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CalendarIcon className="mb-2 h-12 w-12 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium">No appointments scheduled</h3>
                    <p className="text-sm text-muted-foreground">
                      There are no appointments scheduled for this date.
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="upcoming" className="mt-4">
                {/* Upcoming appointments content */}
                <div className="py-8 text-center text-muted-foreground">
                  Switch to different dates to view upcoming appointments
                </div>
              </TabsContent>
              <TabsContent value="past" className="mt-4">
                {/* Past appointments content */}
                <div className="py-8 text-center text-muted-foreground">
                  Switch to previous dates to view past appointments
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Appointments;
