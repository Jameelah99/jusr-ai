import "./patients.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Alert from "../../components/ui/Alert";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/ui/StateViews";
import { useUser } from "../../context/UserContext";
import { createPatient, listPatients, type PatientListItem } from "../../services/api/patientsApi";
import { formatDateOnly, initialsOf } from "../../utils/format";

const PAGE_SIZE = 25;

export default function PatientsPage() {
  const navigate = useNavigate();
  const { activeUser } = useUser();
  const [items, setItems] = useState<PatientListItem[]>([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sex, setSex] = useState<"all" | "F" | "M" | "OTHER">("all");
  const [registerOpen, setRegisterOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listPatients({ skip, limit: PAGE_SIZE });
      setItems(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load patients.");
    } finally {
      setLoading(false);
    }
  }, [skip]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((patient) => {
      if (sex !== "all" && patient.sex !== sex) return false;
      if (!term) return true;
      return [patient.displayLabel, patient.facility, patient.latestScreening]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [items, search, sex]);

  const withCases = items.filter((patient) => patient.activeCases > 0).length;
  const canRegister =
    activeUser &&
    ["coordinator", "referring_clinician", "receiving_clinician", "national_admin"].includes(
      activeUser.role
    );

  return (
    <div className="patients-page">
      <header className="patients-page-heading">
        <div>
          <span className="patients-eyebrow">PATIENTS</span>
          <h1>Patients</h1>
          <p>People with a record at your facility, and their cases.</p>
        </div>
        {canRegister && (
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => setRegisterOpen(true)}
          >
            <Plus size={15} /> Register patient
          </button>
        )}
      </header>

      <section className="patients-stats">
        <article className="patients-stat-card">
          <span className="patients-stat-icon">
            <Users size={20} />
          </span>
          <div>
            <span>On this page</span>
            <strong>{items.length}</strong>
          </div>
        </article>
        <article className="patients-stat-card">
          <span className="patients-stat-icon active">
            <UserCheck size={20} />
          </span>
          <div>
            <span>With an active case</span>
            <strong>{withCases}</strong>
          </div>
        </article>
      </section>

      <section className="patients-directory">
        <div className="patients-directory-heading">
          <div>
            <h2>Patient directory</h2>
            <p>Select a patient to see their details, cases and messages.</p>
          </div>
          <span className="patients-result-count">{visible.length} shown</span>
        </div>

        <div className="patients-filters">
          <label className="patients-search">
            <Search size={15} />
            <input
              type="search"
              placeholder="Search this page by name, facility or screening"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label className="patients-filter-select">
            <select
              value={sex}
              onChange={(event) =>
                setSex(event.target.value as "all" | "F" | "M" | "OTHER")
              }
              aria-label="Filter by sex"
            >
              <option value="all">All sexes</option>
              <option value="F">Female</option>
              <option value="M">Male</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={() => void load()} />
        ) : loading ? (
          <LoadingState message="Loading patients…" />
        ) : visible.length === 0 ? (
          <EmptyState
            title="No patients found"
            message="Register a patient or adjust the search."
          />
        ) : (
          <>
            <div className="patients-table-wrapper">
              <table className="patients-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Facility</th>
                    <th>Latest screening</th>
                    <th>Active cases</th>
                    <th>Last updated</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((patient) => (
                    <tr key={patient.id}>
                      <td>
                        <div className="patients-table-person">
                          <span className="patients-avatar">
                            {initialsOf(patient.displayLabel)}
                          </span>
                          <div>
                            <strong>{patient.displayLabel}</strong>
                            <span>
                              {patient.ageYears ? `${patient.ageYears}y` : "Age unknown"}
                              {patient.sex ? ` · ${patient.sex}` : ""}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>{patient.facility}</td>
                      <td>{patient.latestScreening}</td>
                      <td>
                        <span
                          className={`patients-case-count ${
                            patient.activeCases > 0 ? "has-cases" : "no-cases"
                          }`}
                        >
                          {patient.activeCases}
                        </span>
                      </td>
                      <td>{formatDateOnly(patient.lastUpdated)}</td>
                      <td>
                        <button
                          type="button"
                          className="patients-view-button"
                          onClick={() => navigate(`/patients/${patient.id}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="ui-pagination">
              <span>
                Showing {skip + 1}–{skip + items.length}
              </span>
              <div className="ui-pagination-controls">
                <button
                  type="button"
                  className="ui-btn ui-btn-secondary ui-btn-sm"
                  disabled={skip === 0}
                  onClick={() => setSkip(Math.max(0, skip - PAGE_SIZE))}
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  type="button"
                  className="ui-btn ui-btn-secondary ui-btn-sm"
                  disabled={items.length < PAGE_SIZE}
                  onClick={() => setSkip(skip + PAGE_SIZE)}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {registerOpen && (
        <RegisterPatientDialog
          onClose={() => setRegisterOpen(false)}
          onCreated={(patientId) => {
            setRegisterOpen(false);
            navigate(`/patients/${patientId}`);
          }}
        />
      )}
    </div>
  );
}

function RegisterPatientDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (patientId: string) => void;
}) {
  const [displayLabel, setDisplayLabel] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("F");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const created = await createPatient({
        displayLabel: displayLabel.trim(),
        ageYears: age ? Number(age) : null,
        sex: sex || null,
      });
      onCreated(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register the patient.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ui-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ui-modal" role="dialog" aria-modal="true" aria-label="Register patient">
        <div className="ui-modal-header">
          <h3>Register a patient</h3>
          <button type="button" className="ui-btn ui-btn-ghost ui-btn-sm" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="ui-modal-body">
          {error && <Alert tone="danger">{error}</Alert>}
          <div className="ui-field">
            <label>Patient name or label</label>
            <input
              value={displayLabel}
              onChange={(event) => setDisplayLabel(event.target.value)}
              placeholder="Use a synthetic label, never real identifiable data"
            />
          </div>
          <div className="ui-field">
            <label>Age (years)</label>
            <input
              type="number"
              min={0}
              max={130}
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div className="ui-field">
            <label>Sex</label>
            <select value={sex} onChange={(event) => setSex(event.target.value)}>
              <option value="F">Female</option>
              <option value="M">Male</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="ui-field">
            <span className="ui-hint">
              This demo stores synthetic patients only. Manual entry creates the
              patient record; add a case next so the pathway can start (T1).
            </span>
          </div>
        </div>
        <div className="ui-modal-footer">
          <button type="button" className="ui-btn ui-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            disabled={busy || !displayLabel.trim()}
            onClick={() => void submit()}
          >
            Register patient
          </button>
        </div>
      </div>
    </div>
  );
}
