
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
} from "lucide-react";

interface AppHeaderProps {
  onMenuClick: () => void;
}

function AppHeader({ onMenuClick }: AppHeaderProps) {
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

        <div className="facility-context">
          <span className="facility-indicator" />
          <span>Demo Facility</span>
          <ChevronDown size={15} />
        </div>

        <button
          className="notification-button"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="notification-dot" />
        </button>

        <div className="header-divider" />

        <button className="profile-button">
          <div className="profile-avatar">JD</div>

          <div className="profile-details">
            <span className="profile-name">Jane Doe</span>
            <span className="profile-role">Coordinator</span>
          </div>

          <ChevronDown size={16} />
        </button>

      </div>
    </header>
  );
}

export default AppHeader;
