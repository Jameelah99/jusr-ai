import WorklistPage from "./features/worklist/WorklistPage";
import { Routes, Route } from "react-router-dom";
import PatientLinkGate from "./features/patient/PatientLinkGate";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./features/dashboard/DashboardPage";
import AssistedPatientResponsePage from "./features/patient/AssistedPatientResponsePage";
import PatientsPage from "./features/patients/PatientsPage";
import PatientProfilePage from "./features/patients/PatientProfilePage";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <h1>{title}</h1>
          <p>Manage and monitor your {title.toLowerCase()}.</p>
        </div>
      </div>

      <div className="dashboard-placeholder">
        <h2>{title}</h2>
        <p>This module is under development.</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="assisted-response"
        element={<AssistedPatientResponsePage />}
      />
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />

        <Route path="worklist" element={<WorklistPage />} />

        <Route path="patients" element={<PatientsPage />} />

        <Route path="patients/:patientId" element={<PatientProfilePage />} />

        <Route
          path="referrals"
          element={<PlaceholderPage title="Referrals" />}
        />

        <Route
          path="consultations"
          element={<PlaceholderPage title="Consultations" />}
        />

        <Route path="measures" element={<PlaceholderPage title="Measures" />} />

        <Route
          path="facilities"
          element={<PlaceholderPage title="Facilities" />}
        />

        <Route path="settings" element={<PlaceholderPage title="Settings" />} />
      </Route>
      <Route path="p/:linkToken" element={<PatientLinkGate />} />
    </Routes>
  );
}

export default App;
