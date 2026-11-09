import { useEffect, useMemo, useState } from "react";
import { Users, UserCheck, Search, Filter, AlertCircle } from "lucide-react";
import { getPatients } from "./patientsService";
import type { Patient } from "./patients.types";
import "./patients.css";
import PatientsTable from "./components/PatientsTable";
import { useNavigate } from "react-router-dom";

function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [facility, setFacility] = useState("all");
  const [sex, setSex] = useState<"all" | "Male" | "Female">("all");

  async function loadPatients() {
    try {
      setLoading(true);
      setError(null);

      const data = await getPatients();
      setPatients(data);
    } catch {
      setError("Unable to load patient records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatients();
  }, []);

  const facilities = useMemo(
    () => [...new Set(patients.map((patient) => patient.facility))],
    [patients],
  );

  const filteredPatients = useMemo(() => {
    const query = search.toLowerCase().trim();

    return patients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();

      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        patient.patientNumber.toLowerCase().includes(query);

      const matchesFacility =
        facility === "all" || patient.facility === facility;

      const matchesSex = sex === "all" || patient.sex === sex;

      return matchesSearch && matchesFacility && matchesSex;
    });
  }, [patients, search, facility, sex]);

  const activePatients = patients.filter(
    (patient) => patient.activeCases > 0,
  ).length;

  return (
    <main className="patients-page">
      <div className="patients-page-heading">
        <div>
          <span className="patients-eyebrow">PATIENT MANAGEMENT</span>
          <h1>Patients</h1>
          <p>
            View patient records and follow their care coordination journey.
          </p>
        </div>
      </div>

      <div className="patients-stats">
        <div className="patients-stat-card">
          <div className="patients-stat-icon">
            <Users size={21} />
          </div>
          <div>
            <span>Total patients</span>
            <strong>{patients.length}</strong>
          </div>
        </div>

        <div className="patients-stat-card">
          <div className="patients-stat-icon active">
            <UserCheck size={21} />
          </div>
          <div>
            <span>Patients with active cases</span>
            <strong>{activePatients}</strong>
          </div>
        </div>
      </div>

      <section className="patients-directory">
        <div className="patients-directory-heading">
          <div>
            <h2>Patient directory</h2>
            <p>Search and view patient records across your facilities.</p>
          </div>

          <span className="patients-result-count">
            {filteredPatients.length} patients
          </span>
        </div>

        <div className="patients-filters">
          <div className="patients-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search by patient name or ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="patients-filter-select">
            <Filter size={16} />
            <select
              value={facility}
              onChange={(event) => setFacility(event.target.value)}
            >
              <option value="all">All facilities</option>
              {facilities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="patients-filter-select">
            <select
              value={sex}
              onChange={(event) =>
                setSex(event.target.value as "all" | "Male" | "Female")
              }
            >
              <option value="all">All sexes</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="patients-state">
            <div className="loading-spinner" />
            <p>Loading patient records...</p>
          </div>
        ) : error ? (
          <div className="patients-state patients-error">
            <AlertCircle size={25} />
            <p>{error}</p>
            <button type="button" onClick={loadPatients}>
              Try again
            </button>
          </div>
        ) : (
          <PatientsTable
            patients={filteredPatients}
            onViewPatient={(patient) => {
              navigate(`/patients/${patient.id}`);
            }}
          />
        )}
      </section>

      <div className="patients-demo-notice">
        <strong>Demonstration data</strong>
        <p>
          These patient records are synthetic and are not connected to a
          healthcare facility.
        </p>
      </div>
    </main>
  );
}

export default PatientsPage;
