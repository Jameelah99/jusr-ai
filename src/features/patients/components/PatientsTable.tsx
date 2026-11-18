
import { Eye, UserRound } from "lucide-react";
import type { Patient } from "../patients.types";
import { formatDateTime } from "../../../utils/formatDateTime";

interface PatientsTableProps {
  patients: Patient[];
  onViewPatient: (patient: Patient) => void;
}

function PatientsTable({ patients, onViewPatient }: PatientsTableProps) {
  if (patients.length === 0) {
    return (
      <div className="patients-empty">
        <UserRound size={28} />
        <strong>No patients found</strong>
        <p>Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="patients-table-wrapper">
      <table className="patients-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Age / Sex</th>
            <th>Facility</th>
            <th>Active cases</th>
            <th>Latest screening</th>
            <th>Last updated</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td>
                <div className="patients-table-person">
                  <div className="patients-avatar">
                    <UserRound size={18} />
                  </div>
                  <div>
                    <strong>{patient.displayLabel}</strong>
                    <span>{patient.id}</span>
                  </div>
                </div>
              </td>

              <td>
                {patient.ageYears ?? "—"} years
                <span className="patients-muted">
                  {patient.sex === "M"
                    ? "Male"
                    : patient.sex === "F"
                      ? "Female"
                      : patient.sex}
                </span>
              </td>

              <td>{patient.facility || "Not recorded"}</td>

              <td>
                <span
                  className={`patients-case-count ${
                    patient.activeCases > 0 ? "has-cases" : "no-cases"
                  }`}
                >
                  {patient.activeCases}
                </span>
              </td>

              <td>{patient.latestScreening || "Not available"}</td>

              <td>
                {patient.lastUpdated
                  ? formatDateTime(patient.lastUpdated)
                  : "—"}
              </td>

              <td>
                <button
                  type="button"
                  className="patients-view-button"
                  onClick={() => onViewPatient(patient)}
                  aria-label={`View profile for ${patient.displayLabel}`}
                >
                  <Eye size={16} />
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PatientsTable;
