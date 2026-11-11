import WorklistPage from "./features/worklist/WorklistPage";
import { Routes, Route } from "react-router-dom";
import PatientLinkGate from "./features/patient/PatientLinkGate";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./features/dashboard/DashboardPage";
import AssistedPatientResponsePage from "./features/patient/AssistedPatientResponsePage";
import PatientsPage from "./features/patients/PatientsPage";
import PatientProfilePage from "./features/patients/PatientProfilePage";
import ReferralsPage from "./features/referrals/ReferralsPage";
import { UserProvider } from "./context/UserContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ConsultationsPage from "./features/consultations/ConsultationsPage";
import UrgentInboxPage from "./features/worklist/UrgentInboxPage";

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
    <UserProvider>
      <Routes>
        {/* Patient-facing and assisted response routes */}
        <Route
          path="assisted-response"
          element={<AssistedPatientResponsePage />}
        />

        <Route path="p/:linkToken" element={<PatientLinkGate />} />

        {/* Staff application */}
        <Route element={<AppLayout />}>
          {/* Dashboard */}
          <Route element={<ProtectedRoute permission="dashboard" />}>
            <Route index element={<DashboardPage />} />
          </Route>

          {/* Worklist */}
          <Route element={<ProtectedRoute permission="worklist" />}>
            <Route path="worklist" element={<WorklistPage />} />
          </Route>

          {/* Incoming Urgent Cases */}
          <Route element={<ProtectedRoute permission="urgent_inbox" />}>
            <Route path="urgent-inbox" element={<UrgentInboxPage />} />
          </Route>

          {/* Patients */}
          <Route element={<ProtectedRoute permission="patients" />}>
            <Route path="patients" element={<PatientsPage />} />

            <Route
              path="patients/:patientId"
              element={<PatientProfilePage />}
            />
          </Route>

          {/* Referrals */}
          <Route element={<ProtectedRoute permission="referrals" />}>
            <Route path="referrals" element={<ReferralsPage />} />
          </Route>

          {/* Consultations */}
          {/* Consultations */}
          <Route element={<ProtectedRoute permission="consultations" />}>
            <Route path="consultations" element={<ConsultationsPage />} />
          </Route>

          {/* Measures */}
          <Route element={<ProtectedRoute permission="measures" />}>
            <Route
              path="measures"
              element={<PlaceholderPage title="Measures" />}
            />
          </Route>

          {/* Facilities */}
          <Route element={<ProtectedRoute permission="facilities" />}>
            <Route
              path="facilities"
              element={<PlaceholderPage title="Facilities" />}
            />
          </Route>

          {/* Settings */}
          <Route element={<ProtectedRoute permission="settings" />}>
            <Route
              path="settings"
              element={<PlaceholderPage title="Settings" />}
            />
          </Route>
        </Route>
      </Routes>
    </UserProvider>
  );
}

export default App;
