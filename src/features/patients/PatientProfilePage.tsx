
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  ClipboardList,
  Building2,
  AlertCircle,
  CalendarDays,
  MessageSquare,
  Link2,
  ArrowUpRight,
} from "lucide-react";
import { getPatientProfile } from "./patientProfileService";
import type { PatientProfileData } from "./patient-profile.types";
import "./patient-profile.css";
import { formatDateTime } from "../../utils/formatDateTime";
import { useUser } from "../../context/UserContext";

function PatientProfilePage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { activeUser } = useUser();

  const [profile, setProfile] = useState<PatientProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setProfile(null);
      setError(null);

      if (!activeUser) {
        setLoading(false);
        return;
      }

      if (!patientId) {
        setLoading(false);
        navigate("/patients", { replace: true });
        return;
      }

      try {
        const data = await getPatientProfile(patientId);

        if (cancelled) return;

        if (!data) {
          setProfile(null);
          navigate("/patients", { replace: true });
          return;
        }

        setProfile(data);
      } catch {
        if (!cancelled) {
          setError("Unable to load patient profile.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [patientId, activeUser, navigate]);

  if (loading) {
    return (
      <div className="patients-state">
        <div className="loading-spinner" />
        <p>Loading patient profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="patients-state patients-error">
        <AlertCircle size={25} />
        <h2>Patient profile unavailable</h2>
        <p>{error ?? "The requested patient record could not be found."}</p>
        <button type="button" onClick={() => navigate("/patients")}>
          Return to patients
        </button>
      </div>
    );
  }

  const { patient, cases, screenings, communications, patientLink } = profile;

  const activeCases = cases.filter(
    (caseItem) =>
      !["RESOLVED", "CLOSED"].includes(caseItem.status.toUpperCase()),
  ).length;

  const latestScreening = screenings[0]?.screeningType ?? "Not recorded";

  return (
    <main className="patient-profile-page">
      <button
        type="button"
        className="patient-profile-back"
        onClick={() => navigate("/patients")}
      >
        <ArrowLeft size={17} />
        Back to patients
      </button>

      <div className="patient-profile-heading">
        <div className="patient-profile-avatar">
          <UserRound size={28} />
        </div>

        <div>
          <span className="patients-eyebrow">PATIENT RECORD</span>
          <h1>{patient.displayLabel}</h1>
          <p>{patient.id}</p>
        </div>
      </div>

      <section className="patient-profile-overview">
        <div className="patient-profile-section-heading">
          <UserRound size={18} />
          <h2>Patient information</h2>
        </div>

        <div className="patient-profile-grid">
          <div>
            <span>Age</span>
            <strong>
              {patient.ageYears !== null
                ? `${patient.ageYears} years`
                : "Not recorded"}
            </strong>
          </div>

          <div>
            <span>Sex</span>
            <strong>{patient.sex}</strong>
          </div>

          <div>
            <span>Record type</span>
            <strong>{patient.isSynthetic ? "Simulated record" : "Not specified"}</strong>
          </div>
        </div>
      </section>

      <section className="patient-profile-overview">
        <div className="patient-profile-section-heading">
          <Building2 size={18} />
          <h2>Care coordination</h2>
        </div>

        <div className="patient-profile-grid">
          <div>
            <span>Total cases</span>
            <strong>{cases.length}</strong>
          </div>

          <div>
            <span>Active cases</span>
            <strong>{activeCases}</strong>
          </div>

          <div>
            <span>Latest screening</span>
            <strong>{latestScreening}</strong>
          </div>
        </div>
      </section>

      <section className="patient-profile-overview">
        <div className="patient-profile-section-heading">
          <ClipboardList size={18} />
          <h2>Patient cases</h2>
        </div>

        {cases.length === 0 ? (
          <p>No cases recorded for this patient.</p>
        ) : (
          <div className="patient-profile-cases">
            {cases.map((caseItem) => (
              <button
                type="button"
                className="patient-profile-case patient-profile-case-button"
                key={caseItem.id}
                onClick={() =>
                  navigate(
                    `/worklist?caseId=${encodeURIComponent(caseItem.id)}`,
                    {
                      state: {
                        returnTo: `/patients/${patient.id}`,
                      },
                    },
                  )
                }
              >
                <div>
                  <strong>{caseItem.caseNumber}</strong>
                  <span>{caseItem.screeningType}</span>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{caseItem.status}</strong>
                </div>

                <div>
                  <span>Priority</span>
                  <strong>{caseItem.priority}</strong>
                </div>

                <div>
                  <span>Case owner</span>
                  <strong>{caseItem.assignedTo ?? "Unassigned"}</strong>
                </div>

                <div className="patient-profile-case-action">
                  <ArrowUpRight size={15} />
                  <span>View case details</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="patient-profile-overview">
        <div className="patient-profile-section-heading">
          <CalendarDays size={18} />
          <h2>Screening history</h2>
        </div>

        {screenings.length === 0 ? (
          <p>No screening history available.</p>
        ) : (
          <div className="patient-profile-history">
            {screenings.map((screening) => (
              <div className="patient-profile-history-item" key={screening.id}>
                <div className="patient-profile-history-main">
                  <strong>{screening.screeningType}</strong>
                  <span>{screening.id}</span>
                </div>

                <div>
                  <span>Result</span>
                  <strong>{screening.result}</strong>
                </div>

                <div>
                  <span>Date</span>
                  <strong>
                    {screening.date
                      ? formatDateTime(screening.date)
                      : "Not recorded"}
                  </strong>
                </div>

                <div>
                  <span>Facility</span>
                  <strong>{screening.facility}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="patient-profile-overview">
        <div className="patient-profile-section-heading">
          <MessageSquare size={18} />
          <h2>Communication history</h2>
        </div>

        {communications.length === 0 ? (
          <p>No communication records available.</p>
        ) : (
          <div className="patient-profile-history">
            {communications.map((communication) => (
              <div
                className="patient-profile-history-item"
                key={`${communication.channel}-${communication.id}`}
              >
                <div className="patient-profile-history-main">
                  <strong>{communication.channel}</strong>
                  <span>{communication.id}</span>
                </div>

                <div>
                  <span>Interaction</span>
                  <strong>{communication.description}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong
                    className={`patient-profile-status status-${communication.status.toLowerCase()}`}
                  >
                    {communication.status}
                  </strong>
                </div>

                <div>
                  <span>Date</span>
                  <strong>{formatDateTime(communication.date)}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="patient-profile-overview">
        <div className="patient-profile-section-heading">
          <Link2 size={18} />
          <h2>Patient link</h2>
        </div>

        <div className="patient-profile-link-card">
          <div>
            <span>Link status</span>
            <strong
              className={`patient-profile-status status-${patientLink.status.toLowerCase().replace(" ", "-")}`}
            >
              {patientLink.status}
            </strong>
          </div>

          <div>
            <span>Expiry date</span>
            <strong>
              {patientLink.expiresAt
                ? formatDateTime(patientLink.expiresAt)
                : "Not applicable"}
            </strong>
          </div>

          <p>
            Patient links provide access to the patient's individual care
            coordination page. Only link status and expiry information are
            displayed here.
          </p>
        </div>
      </section>
    </main>
  );
}

export default PatientProfilePage;
