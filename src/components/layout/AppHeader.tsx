import { Search, Bell, Menu, ChevronDown } from "lucide-react";

import { useUser } from "../../context/UserContext";

interface AppHeaderProps {
  onMenuClick: () => void;
}

function formatRole(role: string): string {
  const roleLabels: Record<string, string> = {
    coordinator: "Coordinator",
    referring_clinician: "Referring Clinician",
    receiving_clinician: "Receiving Clinician",
    facility_administrator: "Facility Administrator",
  };

  return roleLabels[role] ?? role;
}

function getInitials(name: string): string {
  return name
    .replace(/^Dr\s+/i, "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { activeUser, demoUsers, setActiveUserById } = useUser();

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="mobile-menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        <div className="header-search">
          <Search size={18} />

          <input
            type="search"
            placeholder="Search cases, patients..."
            aria-label="Search cases and patients"
          />

          <kbd>⌘ K</kbd>
        </div>
      </div>

      <div className="header-right">
        {/* ACTIVE FACILITY */}
        <div
          className="facility-context"
          aria-label={`Active facility: ${activeUser.facility.name}`}
        >
          <span className="facility-indicator" />
          <span>{activeUser.facility.name}</span>
        </div>

        {/* NOTIFICATIONS */}
        <button className="notification-button" aria-label="Notifications">
          <Bell size={20} />
          <span className="notification-dot" />
        </button>

        <div className="header-divider" />

        {/* DEMO USER SWITCHER */}
        <div className="profile-button">
          <div className="profile-avatar">{getInitials(activeUser.name)}</div>

          <div className="profile-details">
            <span className="profile-name">{activeUser.name}</span>

            <span className="profile-role">{formatRole(activeUser.role)}</span>
          </div>

          <select
            className="profile-user-select"
            value={activeUser.id}
            onChange={(event) => setActiveUserById(event.target.value)}
            aria-label="Switch demo user"
            title="Switch demo user"
          >
            {demoUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} — {formatRole(user.role)}
              </option>
            ))}
          </select>

          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
