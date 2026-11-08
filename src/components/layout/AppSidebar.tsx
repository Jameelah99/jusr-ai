
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  ArrowLeftRight,
  MessageSquare,
  ChartNoAxesCombined,
  Building2,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import logo from "../../assets/jusr-logo-cropped.png";

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onClose: () => void;
}

const navigation = [
  {
    title: "WORKSPACE",
    items: [
      { label: "Overview", path: "/", icon: LayoutDashboard },
      { label: "Worklist", path: "/worklist", icon: ClipboardList },
      { label: "Patients", path: "/patients", icon: Users },
      { label: "Referrals", path: "/referrals", icon: ArrowLeftRight },
      { label: "Consultations", path: "/consultations", icon: MessageSquare },
    ],
  },
  {
    title: "INSIGHTS & ADMIN",
    items: [
      { label: "Measures", path: "/measures", icon: ChartNoAxesCombined },
      { label: "Facilities", path: "/facilities", icon: Building2 },
      { label: "Settings", path: "/settings", icon: Settings },
    ],
  },
];

function AppSidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onClose,
}: AppSidebarProps) {
  return (
    <>
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside
        className={`app-sidebar ${
          collapsed ? "sidebar-collapsed" : ""
        } ${mobileOpen ? "sidebar-mobile-open" : ""}`}
      >
        {/* BRAND */}
        <div className="sidebar-brand">
          <NavLink to="/" className="brand-link" onClick={onClose}>
            <img src={logo} alt="Jusr AI" className="brand-logo" />
          </NavLink>

          <button
            className="sidebar-close mobile-only"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="sidebar-navigation">
          {navigation.map((section) => (
            <div className="nav-section" key={section.title}>
              {!collapsed && (
                <p className="nav-section-title">{section.title}</p>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? "nav-item-active" : ""}`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={19} strokeWidth={1.8} />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* SIDEBAR FOOTER */}
        <div className="sidebar-footer">
          <button className="nav-item help-link">
            <HelpCircle size={19} />
            {!collapsed && <span>Help & Support</span>}
          </button>

          <button
            className="collapse-button desktop-only"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
            {!collapsed && <span>Collapse sidebar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default AppSidebar;
