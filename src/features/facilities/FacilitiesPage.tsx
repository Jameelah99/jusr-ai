import { useState } from "react";
import {
  Building2,
  Plus,
  Search,
  Users,
  Wifi,
  WifiOff,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import "./facilities.css";

type FacilityStatus = "Connected" | "Disconnected" | "Pending";

interface Facility {
  id: string;
  name: string;
  type: string;
  connector: string;
  status: FacilityStatus;
  rejectedItems: number;
  lastSynced: string;
}

type StaffRole =
  | "Coordinator"
  | "Referring Clinician"
  | "Receiving Clinician"
  | "Facility Administrator";

interface StaffProfile {
  id: string;
  name: string;
  role: StaffRole;
  specialty: string;
  facility: string;
  authorisedToClose: "Yes" | "No" | "Not configured";
  active: boolean;
}

const demoStaffProfiles: StaffProfile[] = [
  {
    id: "STF-001",
    name: "Jane Doe",
    role: "Coordinator",
    specialty: "—",
    facility: "Demo Facility",
    authorisedToClose: "Not configured",
    active: true,
  },
  {
    id: "STF-002",
    name: "Dr. Williams",
    role: "Referring Clinician",
    specialty: "—",
    facility: "Demo Facility",
    authorisedToClose: "Not configured",
    active: true,
  },
  {
    id: "STF-003",
    name: "Mary Johnson",
    role: "Coordinator",
    specialty: "—",
    facility: "Central Specialist Hospital",
    authorisedToClose: "Not configured",
    active: true,
  },
  {
    id: "STF-004",
    name: "Dr. Okafor",
    role: "Receiving Clinician",
    specialty: "—",
    facility: "Central Specialist Hospital",
    authorisedToClose: "Not configured",
    active: true,
  },
];

const demoFacilities: Facility[] = [
  {
    id: "FAC-001",
    name: "Demo Facility",
    type: "Primary care clinic",
    connector: "Simulated feed",
    status: "Connected",
    rejectedItems: 2,
    lastSynced: "Today, 10:42 AM",
  },
  {
    id: "FAC-002",
    name: "Central Specialist Hospital",
    type: "Specialist centre",
    connector: "Not connected",
    status: "Disconnected",
    rejectedItems: 0,
    lastSynced: "Not available",
  },
  {
    id: "FAC-003",
    name: "Community Screening Centre",
    type: "Screening programme",
    connector: "Simulated feed",
    status: "Connected",
    rejectedItems: 1,
    lastSynced: "Today, 9:15 AM",
  },
];

function FacilitiesPage() {
  const [search, setSearch] = useState("");
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null,
  );
  const [showAddFacility, setShowAddFacility] = useState(false);

  const [staffSearch, setStaffSearch] = useState("");

  const filteredStaff = demoStaffProfiles.filter((staff) =>
    `${staff.name} ${staff.role} ${staff.facility}`
      .toLowerCase()
      .includes(staffSearch.toLowerCase()),
  );

  const filteredFacilities = demoFacilities.filter((facility) =>
    `${facility.name} ${facility.type}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const connectedCount = demoFacilities.filter(
    (facility) => facility.status === "Connected",
  ).length;

  const rejectedCount = demoFacilities.reduce(
    (total, facility) => total + facility.rejectedItems,
    0,
  );

  return (
    <div className="page-container facilities-page">
      <div className="page-heading facilities-heading">
        <div>
          <span className="facilities-eyebrow">FACILITY ADMINISTRATION</span>
          <h1>Facilities</h1>
          <p>Manage facility profiles, staff access and connection status.</p>
        </div>

        <button
          className="add-facility-button"
          onClick={() => setShowAddFacility(true)}
        >
          <Plus size={17} />
          Add facility
        </button>
      </div>

      <div className="facilities-notice">
        <AlertCircle size={18} />
        <div>
          <strong>Simulated data only</strong>
          <p>
            Facility information and connection indicators shown here are
            demonstration records, not live hospital connections.
          </p>
        </div>
      </div>

      <section className="facility-summary-grid">
        <div className="facility-summary-card">
          <span className="facility-summary-icon">
            <Building2 size={19} />
          </span>
          <div>
            <p>Total facilities</p>
            <h2>{demoFacilities.length}</h2>
          </div>
        </div>

        <div className="facility-summary-card">
          <span className="facility-summary-icon connected-icon">
            <Wifi size={19} />
          </span>
          <div>
            <p>Connected facilities</p>
            <h2>{connectedCount}</h2>
          </div>
        </div>

        <div className="facility-summary-card">
          <span className="facility-summary-icon rejected-icon">
            <AlertCircle size={19} />
          </span>
          <div>
            <p>Rejected items</p>
            <h2>{rejectedCount}</h2>
          </div>
        </div>

        <div className="facility-summary-card">
          <span className="facility-summary-icon staff-icon">
            <Users size={19} />
          </span>
          <div>
            <p>Staff profiles</p>
            <h2>{demoStaffProfiles.length}</h2>
          </div>
        </div>
      </section>

      <section className="facilities-content">
        <div className="facilities-content-heading">
          <div>
            <h2>Registered facilities</h2>
            <p>Facility connection and integration overview.</p>
          </div>

          <div className="facility-search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search facilities..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="facility-list">
          {filteredFacilities.map((facility) => (
            <button
              type="button"
              className={`facility-row ${
                selectedFacility?.id === facility.id
                  ? "facility-row-selected"
                  : ""
              }`}
              key={facility.id}
              onClick={() =>
                setSelectedFacility(
                  selectedFacility?.id === facility.id ? null : facility,
                )
              }
            >
              <span className="facility-row-icon">
                <Building2 size={20} />
              </span>

              <span className="facility-row-main">
                <strong>{facility.name}</strong>
                <small>
                  {facility.type} · {facility.id}
                </small>
              </span>

              <span
                className={`facility-status status-${facility.status.toLowerCase()}`}
              >
                {facility.status === "Connected" ? (
                  <Wifi size={14} />
                ) : (
                  <WifiOff size={14} />
                )}
                {facility.status}
              </span>

              <span className="facility-rejected-count">
                {facility.rejectedItems} rejected
              </span>

              <ChevronRight size={18} className="facility-row-chevron" />
            </button>
          ))}

          {filteredFacilities.length === 0 && (
            <div className="facility-empty-state">
              <Building2 size={25} />
              <strong>No facilities found</strong>
              <p>Try a different search term.</p>
            </div>
          )}
        </div>
      </section>

      <section className="facilities-content staff-content">
        <div className="facilities-content-heading">
          <div>
            <h2>Staff profiles</h2>
            <p>Manage staff profiles and facility assignments.</p>
          </div>

          <div className="facility-search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search staff..."
              value={staffSearch}
              onChange={(event) => setStaffSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="facility-list">
          {filteredStaff.map((staff) => (
            <div className="facility-row" key={staff.id}>
              <span className="facility-row-icon">
                <Users size={20} />
              </span>

              <span className="facility-row-main">
                <strong>{staff.name}</strong>
                <small>
                  {staff.role} · {staff.id}
                </small>
              </span>

              <span className="facility-rejected-count">{staff.facility}</span>

              <span
                className={`facility-status ${
                  staff.active ? "status-connected" : "status-disconnected"
                }`}
              >
                {staff.active ? "Active" : "Inactive"}
              </span>
            </div>
          ))}

          {filteredStaff.length === 0 && (
            <div className="facility-empty-state">
              <Users size={25} />
              <strong>No staff profiles found</strong>
              <p>Try a different search term.</p>
            </div>
          )}
        </div>
      </section>

      <section className="facilities-content access-settings-content">
  <div className="facilities-content-heading">
    <div>
      <h2>Access settings</h2>
      <p>
        Overview of staff roles and their access boundaries.
      </p>
    </div>
  </div>

  <div className="access-settings-grid">
    <div className="access-role-card">
      <h3>Coordinator</h3>
      <p>Coordinates patient follow-up and case tracking.</p>
      <span>Facility-scoped access</span>
    </div>

    <div className="access-role-card">
      <h3>Referring Clinician</h3>
      <p>Reviews cases and makes clinical decisions.</p>
      <span>Facility-scoped clinical access</span>
    </div>

    <div className="access-role-card">
      <h3>Receiving Clinician</h3>
      <p>Manages incoming referrals and consultation outcomes.</p>
      <span>Facility-scoped clinical access</span>
    </div>

    <div className="access-role-card">
      <h3>Facility Administrator</h3>
      <p>Manages facility connections, staff profiles and access.</p>
      <span>No clinical case content</span>
    </div>
  </div>

  <div className="facilities-notice access-settings-notice">
    <AlertCircle size={18} />
    <div>
      <strong>Access control information</strong>
      <p>
        These are role-level access descriptions. Actual permissions
        are enforced by the backend and cannot be changed from this
        demonstration screen.
      </p>
    </div>
  </div>
</section>

      {selectedFacility && (
        <section className="facility-detail-panel">
          <div className="facilities-content-heading">
            <div>
              <span className="facilities-eyebrow">FACILITY DETAILS</span>
              <h2>{selectedFacility.name}</h2>
            </div>
            <button
              className="facility-close-button"
              onClick={() => setSelectedFacility(null)}
            >
              Close
            </button>
          </div>

          <div className="facility-detail-grid">
            <div>
              <span>Facility ID</span>
              <strong>{selectedFacility.id}</strong>
            </div>
            <div>
              <span>Facility type</span>
              <strong>{selectedFacility.type}</strong>
            </div>
            <div>
              <span>Connector type</span>
              <strong>{selectedFacility.connector}</strong>
            </div>
            <div>
              <span>Connection status</span>
              <strong>{selectedFacility.status}</strong>
            </div>
            <div>
              <span>Last synchronised</span>
              <strong>{selectedFacility.lastSynced}</strong>
            </div>
            <div>
              <span>Rejected items</span>
              <strong>{selectedFacility.rejectedItems}</strong>
            </div>
          </div>
        </section>
      )}

      {showAddFacility && (
        <div className="facility-modal-backdrop">
          <div className="facility-modal">
            <div className="facility-modal-heading">
              <div>
                <span className="facilities-eyebrow">NEW FACILITY</span>
                <h2>Add a facility</h2>
              </div>
              <button
                className="facility-close-button"
                onClick={() => setShowAddFacility(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p>
              The facility registration form will be connected to the confirmed
              backend workflow in a later step.
            </p>

            <button
              className="facility-modal-secondary"
              onClick={() => setShowAddFacility(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacilitiesPage;
