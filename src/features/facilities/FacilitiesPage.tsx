import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  Pencil,
  Plus,
  Search,
  Upload,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import Alert from "../../components/ui/Alert";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/StateViews";
import { useUser } from "../../context/UserContext";
import {
  createFacility,
  createStaff,
  importStaffCsv,
  listFacilities,
  listStaff,
  updateStaff,
  type StaffMember,
} from "../../services/api/adminApi";
import {
  getRejectedEvents,
  importEventsCsv,
  type RejectedEvent,
  type RejectedResult,
} from "../../services/api/eventsApi";
import type { FacilityRecord } from "../../services/api/v6.types";
import { formatDateTime, humanize } from "../../utils/format";
import "./facilities.css";

const STAFF_ROLES = [
  { value: "COORDINATOR", label: "Coordinator" },
  { value: "REFERRING_CLINICIAN", label: "Referring clinician" },
  { value: "RECEIVING_CLINICIAN", label: "Receiving clinician" },
  { value: "FACILITY_ADMIN", label: "Facility administrator" },
];

const WORKING_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const TIME_ZONES = ["Africa/Lagos", "Africa/Nairobi", "Africa/Johannesburg", "Europe/London", "UTC"];

type Tab = "facilities" | "staff" | "feed";

function statusClass(status: string | null | undefined) {
  if (status === "CONNECTED") return "status-connected";
  if (status === "MISSING") return "status-pending";
  return "status-disconnected";
}

function AddFacilityModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (facility: FacilityRecord) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [timeZone, setTimeZone] = useState(TIME_ZONES[0]);
  const [days, setDays] = useState<string[]>(["MON", "TUE", "WED", "THU", "FRI"]);
  const [connectorType, setConnectorType] = useState<"FEED_SIMULATOR" | "CSV">("FEED_SIMULATOR");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function toggleDay(day: string) {
    setDays((current) =>
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day]
    );
  }

  async function save() {
    if (!name.trim()) {
      setError("Give the facility a name.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const facility = await createFacility({
        name: name.trim(),
        type: type.trim() || undefined,
        timeZone,
        workingDays: days,
        connectorType,
      });
      onSaved(facility);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add this facility.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      title="Add a facility"
      subtitle="A new facility appears in filters and routing immediately."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={() => void save()} disabled={busy}>
            {busy ? "Saving…" : "Add facility"}
          </button>
        </>
      }
    >
      {error && <Alert tone="danger">{error}</Alert>}
      <div className="ui-field">
        <label>Name *</label>
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <div className="ui-field">
        <label>Type</label>
        <input
          value={type}
          placeholder="e.g. Specialist centre"
          onChange={(event) => setType(event.target.value)}
        />
      </div>
      <div className="ui-field">
        <label>Time zone</label>
        <select value={timeZone} onChange={(event) => setTimeZone(event.target.value)}>
          {TIME_ZONES.map((zone) => (
            <option key={zone} value={zone}>{zone}</option>
          ))}
        </select>
      </div>
      <div className="ui-field">
        <label>Working days</label>
        <div className="facility-day-row">
          {WORKING_DAYS.map((day) => (
            <label key={day} className="facility-day">
              <input
                type="checkbox"
                checked={days.includes(day)}
                onChange={() => toggleDay(day)}
              />
              {day}
            </label>
          ))}
        </div>
      </div>
      <div className="ui-field">
        <label>Connector</label>
        <select
          value={connectorType}
          onChange={(event) => setConnectorType(event.target.value as "FEED_SIMULATOR" | "CSV")}
        >
          <option value="FEED_SIMULATOR">Simulated feed</option>
          <option value="CSV">CSV upload</option>
        </select>
      </div>
    </Modal>
  );
}

function StaffEditorModal({
  member,
  facilities,
  fixedFacilityId,
  onClose,
  onSaved,
}: {
  member: StaffMember | null;
  facilities: FacilityRecord[];
  fixedFacilityId?: string;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const editing = member !== null;
  const [email, setEmail] = useState(member?.email ?? "");
  const [displayName, setDisplayName] = useState(member?.displayName ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(member?.role ?? "COORDINATOR");
  const [facilityId, setFacilityId] = useState(member?.facilityId ?? fixedFacilityId ?? "");
  const [specialty, setSpecialty] = useState(member?.specialty ?? "");
  const [authorisedToClose, setAuthorisedToClose] = useState(member?.authorisedToClose ?? false);
  const [isActive, setIsActive] = useState(member?.isActive ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setBusy(true);
    setError("");
    try {
      if (editing && member) {
        await updateStaff(member.id, {
          displayName: displayName.trim(),
          role,
          specialty: specialty.trim() || null,
          authorisedToClose,
          isActive,
        });
        onSaved(`Staff profile updated: ${displayName.trim()}.`);
      } else {
        if (!email.trim() || !displayName.trim() || password.length < 8) {
          setError("Email, name and a password of at least 8 characters are required.");
          setBusy(false);
          return;
        }
        if (!facilityId) {
          setError("Choose the facility this staff member belongs to.");
          setBusy(false);
          return;
        }
        await createStaff({
          email: email.trim(),
          displayName: displayName.trim(),
          password,
          role,
          facilityId,
          specialty: specialty.trim() || undefined,
          authorisedToClose,
        });
        onSaved(`Staff profile created: ${displayName.trim()}.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save this staff profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      title={editing ? "Edit staff profile" : "Add a staff profile"}
      subtitle="Staff profiles control access. Clinical content stays within the facility."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={() => void save()} disabled={busy}>
            {busy ? "Saving…" : editing ? "Save changes" : "Create profile"}
          </button>
        </>
      }
    >
      {error && <Alert tone="danger">{error}</Alert>}
      {!editing && (
        <>
          <div className="ui-field">
            <label>Email *</label>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="ui-field">
            <label>Temporary password *</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <span className="ui-hint">At least 8 characters. The person should change it after signing in.</span>
          </div>
        </>
      )}
      <div className="ui-field">
        <label>Display name *</label>
        <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
      </div>
      <div className="ui-field">
        <label>Role</label>
        <select value={role} onChange={(event) => setRole(event.target.value)}>
          {STAFF_ROLES.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      {!editing && !fixedFacilityId && (
        <div className="ui-field">
          <label>Facility *</label>
          <select value={facilityId} onChange={(event) => setFacilityId(event.target.value)}>
            <option value="">Choose a facility</option>
            {facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>{facility.name}</option>
            ))}
          </select>
        </div>
      )}
      <div className="ui-field">
        <label>Specialty</label>
        <input
          value={specialty}
          placeholder="e.g. Gynaecology"
          onChange={(event) => setSpecialty(event.target.value)}
        />
      </div>
      <label className="ui-checkbox">
        <input
          type="checkbox"
          checked={authorisedToClose}
          onChange={(event) => setAuthorisedToClose(event.target.checked)}
        />
        Authorised to sign off closures
      </label>
      {editing && (
        <label className="ui-checkbox">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
          />
          Active (can sign in)
        </label>
      )}
    </Modal>
  );
}

export default function FacilitiesPage() {
  const { activeUser } = useUser();
  const isNational = activeUser?.role === "national_admin";
  const canAdmin = isNational || activeUser?.role === "facility_administrator";

  const [tab, setTab] = useState<Tab>("facilities");
  const [facilities, setFacilities] = useState<FacilityRecord[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const [staffRoleFilter, setStaffRoleFilter] = useState("");
  const [staffFacilityFilter, setStaffFacilityFilter] = useState("");
  const [addingFacility, setAddingFacility] = useState(false);
  const [staffEditor, setStaffEditor] = useState<StaffMember | "new" | null>(null);
  const [rejected, setRejected] = useState<RejectedResult | null>(null);
  const [rejectedPage, setRejectedPage] = useState(1);
  const [rejectedError, setRejectedError] = useState("");
  const [feedFacilityFilter, setFeedFacilityFilter] = useState("");
  const [csvText, setCsvText] = useState("");
  const [csvBusy, setCsvBusy] = useState(false);
  const [csvSummary, setCsvSummary] = useState<string>("");
  const [staffCsvOpen, setStaffCsvOpen] = useState(false);
  const [staffCsvText, setStaffCsvText] = useState("");
  const [staffCsvBusy, setStaffCsvBusy] = useState(false);
  const [staffCsvSummary, setStaffCsvSummary] = useState("");
  const [staffCsvRejected, setStaffCsvRejected] = useState<
    Array<{ row: number; email: string | null; message: string }>
  >([]);

  const loadDirectory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [facilityRows, staffRows] = await Promise.all([
        listFacilities(),
        listStaff({
          facilityId: staffFacilityFilter || undefined,
          role: staffRoleFilter || undefined,
        }),
      ]);
      setFacilities(facilityRows);
      setStaff(staffRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load facilities.");
    } finally {
      setLoading(false);
    }
  }, [staffFacilityFilter, staffRoleFilter]);

  useEffect(() => {
    void loadDirectory();
  }, [loadDirectory]);

  const loadRejected = useCallback(async () => {
    setRejectedError("");
    try {
      const result = await getRejectedEvents({
        facilityId: (isNational ? feedFacilityFilter : undefined) || undefined,
        page: rejectedPage,
        pageSize: 20,
      });
      setRejected(result);
    } catch (err) {
      setRejectedError(
        err instanceof Error ? err.message : "Unable to load rejected items."
      );
    }
  }, [isNational, feedFacilityFilter, rejectedPage]);

  useEffect(() => {
    void loadRejected();
  }, [loadRejected]);

  const filteredFacilities = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return facilities;
    return facilities.filter((facility) =>
      `${facility.name} ${facility.code} ${facility.type ?? ""}`.toLowerCase().includes(term)
    );
  }, [facilities, search]);

  const filteredStaff = useMemo(() => {
    const term = staffSearch.trim().toLowerCase();
    if (!term) return staff;
    return staff.filter((member) =>
      `${member.displayName} ${member.email} ${member.specialty ?? ""}`.toLowerCase().includes(term)
    );
  }, [staff, staffSearch]);

  const facilityName = (id: string | null) =>
    facilities.find((facility) => facility.id === id)?.name ?? "—";

  const connectedCount = facilities.filter((f) => f.connectionStatus === "CONNECTED").length;

  async function handleCsvFile(file: File | null) {
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
  }

  async function importCsv() {
    if (!csvText.trim()) return;
    setCsvBusy(true);
    setError("");
    setCsvSummary("");
    try {
      const result = await importEventsCsv(csvText);
      setCsvSummary(
        Object.entries(result.counts)
          .map(([status, count]) => `${humanize(status)}: ${count}`)
          .join(" · ")
      );
      setNotice("CSV events processed.");
      await loadRejected();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to import this CSV.");
    } finally {
      setCsvBusy(false);
    }
  }

  async function importStaff() {
    if (!staffCsvText.trim()) return;
    setStaffCsvBusy(true);
    setError("");
    setStaffCsvSummary("");
    setStaffCsvRejected([]);
    try {
      const result = await importStaffCsv(staffCsvText);
      setStaffCsvSummary(
        `${result.counts.created} created, ${result.counts.rejected} rejected.`
      );
      setStaffCsvRejected(result.rejected);
      if (result.counts.created > 0) {
        setNotice(`${result.counts.created} staff profile(s) imported.`);
        await loadDirectory();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to import this CSV.");
    } finally {
      setStaffCsvBusy(false);
    }
  }

  return (
    <div className="page-container facilities-page">
      <div className="page-heading facilities-heading">
        <div>
          <span className="facilities-eyebrow">FACILITY ADMINISTRATION</span>
          <h1>Facilities</h1>
          <p>Manage facility profiles, staff access and connection status.</p>
        </div>

        {canAdmin && tab === "facilities" && (
          <button className="add-facility-button" onClick={() => setAddingFacility(true)}>
            <Plus size={17} />
            Add facility
          </button>
        )}
        {canAdmin && tab === "staff" && (
          <div className="facility-heading-actions">
            <button className="add-facility-button" onClick={() => setStaffEditor("new")}>
              <Plus size={17} />
              Add staff
            </button>
            <button
              className="ui-btn ui-btn-secondary"
              onClick={() => {
                setStaffCsvOpen(true);
                setStaffCsvSummary("");
                setStaffCsvRejected([]);
              }}
            >
              <Upload size={15} /> Import CSV
            </button>
          </div>
        )}
      </div>

      <div className="wl-tabs" role="tablist" style={{ background: "transparent", padding: 0, border: 0 }}>
        {[
          { id: "facilities" as Tab, label: "Facilities" },
          { id: "staff" as Tab, label: "Staff profiles" },
          { id: "feed" as Tab, label: "Data feed" },
        ].map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={tab === option.id}
            className={`wl-tab${tab === option.id ? " is-active" : ""}`}
            onClick={() => setTab(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {notice && <Alert tone="success">{notice}</Alert>}
      {error && <Alert tone="danger">{error}</Alert>}

      {loading ? (
        <LoadingState message="Loading facility administration…" />
      ) : !facilities.length && error ? (
        <ErrorState message={error} onRetry={() => void loadDirectory()} />
      ) : tab === "facilities" ? (
        <>
          <section className="facility-summary-grid">
            <div className="facility-summary-card">
              <span className="facility-summary-icon"><Building2 size={19} /></span>
              <div><p>Total facilities</p><h2>{facilities.length}</h2></div>
            </div>
            <div className="facility-summary-card">
              <span className="facility-summary-icon connected-icon"><Wifi size={19} /></span>
              <div><p>Connected</p><h2>{connectedCount}</h2></div>
            </div>
            <div className="facility-summary-card">
              <span className="facility-summary-icon staff-icon"><Users size={19} /></span>
              <div><p>Staff profiles</p><h2>{staff.length}</h2></div>
            </div>
            <div className="facility-summary-card">
              <span className="facility-summary-icon rejected-icon"><AlertCircle size={19} /></span>
              <div><p>Rejected items</p><h2>{rejected?.total ?? "—"}</h2></div>
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
                <div className="facility-row" key={facility.id}>
                  <span className="facility-row-icon"><Building2 size={20} /></span>
                  <span className="facility-row-main">
                    <strong>{facility.name}</strong>
                    <small>
                      {facility.type ?? "Facility"} · {facility.code} · {facility.connectorType ?? "—"}
                    </small>
                  </span>
                  <span className="facility-rejected-count">
                    {facility.workingDays?.length
                      ? `${facility.workingDays.length} working days`
                      : "No working days set"}
                  </span>
                  <span className={`facility-status ${statusClass(facility.connectionStatus)}`}>
                    {facility.connectionStatus === "CONNECTED" ? <Wifi size={14} /> : <WifiOff size={14} />}
                    {humanize(facility.connectionStatus)}
                  </span>
                  <span className="facility-rejected-count">
                    {facility.lastEventAt ? formatDateTime(facility.lastEventAt) : "No events yet"}
                  </span>
                </div>
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

          <section className="facilities-content access-settings-content">
            <div className="facilities-content-heading">
              <div>
                <h2>Access settings</h2>
                <p>Role-level access boundaries. Permissions are enforced by the backend.</p>
              </div>
            </div>

            <div className="access-settings-grid">
              <div className="access-role-card">
                <h3>Coordinator</h3>
                <p>Coordinates patient follow-up and case tracking.</p>
                <span>Facility-scoped access</span>
              </div>
              <div className="access-role-card">
                <h3>Referring clinician</h3>
                <p>Reviews cases and makes clinical decisions.</p>
                <span>Facility-scoped clinical access</span>
              </div>
              <div className="access-role-card">
                <h3>Receiving clinician</h3>
                <p>Manages incoming referrals and consultation outcomes.</p>
                <span>Facility-scoped clinical access</span>
              </div>
              <div className="access-role-card">
                <h3>Facility administrator</h3>
                <p>Manages facility connections, staff profiles and access.</p>
                <span>No clinical case content</span>
              </div>
            </div>
          </section>
        </>
      ) : tab === "staff" ? (
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

          <div className="facility-filter-row">
            {isNational && (
              <label>
                <span>Facility</span>
                <select
                  value={staffFacilityFilter}
                  onChange={(event) => setStaffFacilityFilter(event.target.value)}
                >
                  <option value="">All facilities</option>
                  {facilities.map((facility) => (
                    <option key={facility.id} value={facility.id}>{facility.name}</option>
                  ))}
                </select>
              </label>
            )}
            <label>
              <span>Role</span>
              <select
                value={staffRoleFilter}
                onChange={(event) => setStaffRoleFilter(event.target.value)}
              >
                <option value="">All roles</option>
                {STAFF_ROLES.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="facility-list">
            {filteredStaff.map((member) => (
              <div className="facility-row" key={member.id}>
                <span className="facility-row-icon"><Users size={20} /></span>
                <span className="facility-row-main">
                  <strong>{member.displayName}</strong>
                  <small>
                    {member.email} · {humanize(member.role)}
                    {member.specialty ? ` · ${member.specialty}` : ""}
                  </small>
                </span>
                <span className="facility-rejected-count">{facilityName(member.facilityId)}</span>
                <span className="facility-rejected-count">
                  {member.authorisedToClose ? "Closure sign-off" : "No closure sign-off"}
                </span>
                <span className={`facility-status ${member.isActive ? "status-connected" : "status-disconnected"}`}>
                  {member.isActive ? "Active" : "Inactive"}
                </span>
                {canAdmin && (
                  <button
                    type="button"
                    className="ui-btn ui-btn-secondary ui-btn-sm"
                    onClick={() => setStaffEditor(member)}
                  >
                    <Pencil size={13} /> Edit
                  </button>
                )}
              </div>
            ))}
            {filteredStaff.length === 0 && (
              <div className="facility-empty-state">
                <Users size={25} />
                <strong>No staff profiles found</strong>
                <p>Try a different search term or filter.</p>
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          <section className="facilities-content">
            <div className="facilities-content-heading">
              <div>
                <h2>Rejected items</h2>
                <p>
                  Events that failed validation are listed here with their error
                  code. Nothing is silently dropped.
                </p>
              </div>
              {isNational && (
                <label className="facility-inline-filter">
                  <span>Facility</span>
                  <select
                    value={feedFacilityFilter}
                    onChange={(event) => {
                      setFeedFacilityFilter(event.target.value);
                      setRejectedPage(1);
                    }}
                  >
                    <option value="">All facilities</option>
                    {facilities.map((facility) => (
                      <option key={facility.id} value={facility.id}>{facility.name}</option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            {rejectedError && <Alert tone="danger">{rejectedError}</Alert>}

            {rejected?.byErrorCode ? (
              <div className="settings-rows">
                {Object.entries(rejected.byErrorCode).map(([code, count]) => (
                  <div className="settings-row" key={code}>
                    <div className="settings-row-main">
                      <strong>{humanize(code)}</strong>
                      <span className="settings-row-key">{code}</span>
                    </div>
                    <div className="settings-row-value">
                      <strong>{count}</strong>
                      <span>items</span>
                    </div>
                  </div>
                ))}
                {Object.keys(rejected.byErrorCode).length === 0 && (
                  <EmptyState title="No rejected items" message="Every recent event was accepted." />
                )}
              </div>
            ) : (rejected?.items.length ?? 0) === 0 ? (
              <EmptyState title="No rejected items" message="Every recent event was accepted." />
            ) : (
              <>
                <div className="settings-table-wrap">
                  <table className="ui-table">
                    <thead>
                      <tr>
                        <th>Received</th>
                        <th>Event</th>
                        <th>Facility</th>
                        <th>Error</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rejected?.items.map((item: RejectedEvent) => (
                        <tr key={item.id}>
                          <td>{formatDateTime(item.receivedAt)}</td>
                          <td>
                            <strong>{item.type}</strong>
                            <div className="settings-row-key">{item.eventId}</div>
                          </td>
                          <td>{item.facilityId ?? "—"}</td>
                          <td>{humanize(item.errorCode)}</td>
                          <td>{item.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  page={rejectedPage}
                  pageSize={20}
                  total={rejected?.total ?? 0}
                  onChange={setRejectedPage}
                />
              </>
            )}
          </section>

          {isNational && (
            <section className="facilities-content">
              <div className="facilities-content-heading">
                <div>
                  <h2>Import events by CSV</h2>
                  <p>
                    Upload a CSV of inbound events. Each row is processed on its
                    own; one refusal does not stop the rest.
                  </p>
                </div>
              </div>

              <div className="csv-import">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(event) => void handleCsvFile(event.target.files?.[0] ?? null)}
                />
                <textarea
                  value={csvText}
                  placeholder="eventId,type,facilityId,payload..."
                  onChange={(event) => setCsvText(event.target.value)}
                  rows={6}
                />
                <div className="csv-import-actions">
                  <button
                    type="button"
                    className="ui-btn ui-btn-primary"
                    onClick={() => void importCsv()}
                    disabled={csvBusy || !csvText.trim()}
                  >
                    <Upload size={15} />
                    {csvBusy ? "Importing…" : "Import CSV"}
                  </button>
                  {csvSummary && <span className="settings-helper">{csvSummary}</span>}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {addingFacility && (
        <AddFacilityModal
          onClose={() => setAddingFacility(false)}
          onSaved={(facility) => {
            setAddingFacility(false);
            setNotice(`Facility added: ${facility.name}.`);
            void loadDirectory();
          }}
        />
      )}

      {staffCsvOpen && (
        <Modal
          open
          title="Import staff profiles by CSV"
          subtitle="Columns: email, displayName, password, role, facilityId (optional), specialty (optional), authorisedToClose (optional)"
          onClose={() => setStaffCsvOpen(false)}
          footer={
            <>
              <button
                type="button"
                className="ui-btn ui-btn-secondary"
                onClick={() => setStaffCsvOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="ui-btn ui-btn-primary"
                onClick={() => void importStaff()}
                disabled={staffCsvBusy || !staffCsvText.trim()}
              >
                {staffCsvBusy ? "Importing…" : "Import CSV"}
              </button>
            </>
          }
        >
          {error && <Alert tone="danger">{error}</Alert>}
          <div className="csv-import">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (file) setStaffCsvText(await file.text());
              }}
            />
            <textarea
              rows={8}
              value={staffCsvText}
              onChange={(event) => setStaffCsvText(event.target.value)}
              placeholder="email,displayName,password,role,specialty,authorisedToClose"
            />
            {staffCsvSummary && <p className="settings-helper">{staffCsvSummary}</p>}
            {staffCsvRejected.length > 0 && (
              <ul className="csv-rejected">
                {staffCsvRejected.map((row) => (
                  <li key={row.row}>
                    Row {row.row}
                    {row.email ? ` (${row.email})` : ""}: {row.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Modal>
      )}

      {staffEditor && (
        <StaffEditorModal
          member={staffEditor === "new" ? null : staffEditor}
          facilities={facilities}
          fixedFacilityId={
            activeUser?.role === "facility_administrator"
              ? activeUser.facility?.id || undefined
              : undefined
          }
          onClose={() => setStaffEditor(null)}
          onSaved={(message) => {
            setStaffEditor(null);
            setNotice(message);
            void loadDirectory();
          }}
        />
      )}
    </div>
  );
}
