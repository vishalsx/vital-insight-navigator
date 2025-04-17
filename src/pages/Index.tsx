
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "./Dashboard";
import { Route, Routes } from "react-router-dom";
import PatientsList from "./PatientsList";
import PatientDetails from "./PatientDetails";
import MedicalRecords from "./MedicalRecords";
import Analytics from "./Analytics";
import NotFound from "./NotFound";
import Appointments from "./Appointments";
import Resources from "./Resources";
import Settings from "./Settings";

const Index = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="patients" element={<PatientsList />} />
        <Route path="patients/:id" element={<PatientDetails />} />
        <Route path="records" element={<MedicalRecords />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="resources" element={<Resources />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default Index;
