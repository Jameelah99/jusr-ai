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
import MeasuresPage from "./features/measures/MeasuresPage";
import FacilitiesPage from "./features/facilities/FacilitiesPage";
import HelpSupportPage from "./features/help-support/HelpSupportPage";
import UserGuidePage from "./features/help-support/UserGuidePage";
import ContactSupportPage from "./features/help-support/ContactSupportPage";
import PrivacySecurityPage from "./features/help-support/PrivacySecurityPage";
import SettingsPage from "./features/settings/SettingsPage";


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
          <Route element={<ProtectedRoute permission="consultations" />}>
            <Route path="consultations" element={<ConsultationsPage />} />
          </Route>

          {/* Measures */}
          <Route element={<ProtectedRoute permission="measures" />}>
            <Route path="measures" element={<MeasuresPage />} />
          </Route>

          {/* Facilities */}
          <Route element={<ProtectedRoute permission="facilities" />}>
            <Route path="facilities" element={<FacilitiesPage />} />
          </Route>

          {/* Settings */}
          <Route element={<ProtectedRoute permission="settings" />}>
            <Route element={<ProtectedRoute permission="settings" />}>
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="help-support" element={<HelpSupportPage />} />
          <Route path="help-support/user-guide" element={<UserGuidePage />} />
          <Route path="help-support/contact" element={<ContactSupportPage />} />
          <Route
            path="help-support/privacy-security"
            element={<PrivacySecurityPage />}
          />
        </Route>
      </Routes>
    </UserProvider>
  );
}

export default App;
