
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentPatients } from "@/components/dashboard/RecentPatients";
import { PatientTrends } from "@/components/dashboard/PatientTrends";
import { CriticalAlerts } from "@/components/dashboard/CriticalAlerts";
import { Users, Activity, CalendarCheck, Clock, FileText } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, Dr. Thompson. Here's your clinical overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value="3,271"
          icon={<Users size={20} />}
          trend="this month"
          trendValue="12%"
          trendUp={true}
        />
        <StatCard
          title="Appointments Today"
          value="27"
          icon={<CalendarCheck size={20} />}
          trend="vs yesterday"
          trendValue="5%"
          trendUp={true}
        />
        <StatCard
          title="Average Wait Time"
          value="14 min"
          icon={<Clock size={20} />}
          trend="vs last week"
          trendValue="8%"
          trendUp={false}
        />
        <StatCard
          title="Medical Records"
          value="1,024"
          icon={<FileText size={20} />}
          trend="this month"
          trendValue="22%"
          trendUp={true}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PatientTrends />
        <CriticalAlerts />
      </div>
      
      <RecentPatients />
    </div>
  );
}
