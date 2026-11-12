
import { useEffect, useState } from "react";
import {
  Settings,
  Clock,
  Bell,
  ShieldCheck,
  Info,
  Save,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import "./settings.css";

const DEFAULT_SETTINGS = {
  timezone: "Africa/Lagos",
  acknowledgementLimit: 24,
  referralLimit: 4,
  followupLimit: 24,
};

type SettingsValues = typeof DEFAULT_SETTINGS;

const SETTINGS_STORAGE_KEY = "jusr-demo-settings";

const settingsNavigation = [
  { id: "general", label: "General", icon: Settings },
  { id: "workflow", label: "Workflow time limits", icon: Clock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "access", label: "Access & permissions", icon: ShieldCheck },
  { id: "system", label: "System information", icon: Info },
];

function getInitialSettings(): SettingsValues {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // Use defaults if saved demo settings cannot be read.
  }

  return { ...DEFAULT_SETTINGS };
}

function SettingsPage() {
  const [settings, setSettings] = useState<SettingsValues>(
    getInitialSettings
  );

  const [savedSettings, setSavedSettings] = useState<SettingsValues>(
    getInitialSettings
  );

  const [activeSection, setActiveSection] = useState("general");
  const [feedback, setFeedback] = useState("");

  const hasChanges =
    JSON.stringify(settings) !== JSON.stringify(savedSettings);

  useEffect(() => {
    const sections = settingsNavigation
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );

        if (visibleSections.length > 0) {
          setActiveSection(visibleSections[0].target.id);
        }
      },
      {
        rootMargin: "-120px 0px -65% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const updateSetting = <K extends keyof SettingsValues>(
    key: K,
    value: SettingsValues[K]
  ) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
    setFeedback("");
  };

  const handleSave = () => {
    try {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(settings)
      );

      setSavedSettings({ ...settings });
      setFeedback("Your demonstration settings have been saved locally.");
    } catch {
      setFeedback("Unable to save settings in this browser.");
    }
  };

  const handleReset = () => {
    try {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(DEFAULT_SETTINGS)
      );

      setSettings({ ...DEFAULT_SETTINGS });
      setSavedSettings({ ...DEFAULT_SETTINGS });
      setFeedback("Settings have been restored to their original defaults.");
    } catch {
      setFeedback("Unable to reset settings in this browser.");
    }
  };

  const handleNavigation = (sectionId: string) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <main className="page-container settings-page">
      <div className="page-heading">
        <div>
          <span className="settings-eyebrow">CONFIGURATION</span>
          <h1>Settings</h1>
          <p>
            Manage platform preferences, workflow time limits and
            configuration options.
          </p>
        </div>
      </div>

      <div className="settings-notice">
        <Info size={18} />
        <p>
          These are demonstration settings. Changes are saved locally
          in this browser and will not affect live platform workflows
          until backend configuration is connected.
        </p>
      </div>

      <div className="settings-layout">
        <aside className="settings-navigation">
          <h3>SETTINGS MENU</h3>

          {settingsNavigation.map((item) => {
            const ItemIcon = item.icon;

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`settings-nav-item ${
                  activeSection === item.id ? "active" : ""
                }`}
                onClick={(event) => {
                  event.preventDefault();
                  handleNavigation(item.id);
                }}
              >
                <ItemIcon size={17} />
                {item.label}
              </a>
            );
          })}
        </aside>

        <div className="settings-content">
          <section id="general" className="settings-section">
            <div className="settings-section-heading">
              <Settings size={19} />
              <div>
                <h2>General settings</h2>
                <p>Basic platform and facility preferences.</p>
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="platform-name">Platform name</label>
              <input
                id="platform-name"
                type="text"
                value="Jusr AI"
                readOnly
              />
              <small>Platform identity is managed centrally.</small>
            </div>

            <div className="settings-field">
              <label htmlFor="timezone">Time zone</label>
              <select
                id="timezone"
                value={settings.timezone}
                onChange={(event) =>
                  updateSetting("timezone", event.target.value)
                }
              >
                <option value="Africa/Lagos">
                  Africa/Lagos (WAT)
                </option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </section>

          <section id="workflow" className="settings-section">
            <div className="settings-section-heading">
              <Clock size={19} />
              <div>
                <h2>Workflow time limits</h2>
                <p>
                  Review the time limits used for workflow follow-up.
                </p>
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="acknowledgement-limit">
                Patient acknowledgement limit
              </label>
              <div className="settings-input-suffix">
                <input
                  id="acknowledgement-limit"
                  type="number"
                  min="1"
                  value={settings.acknowledgementLimit}
                  onChange={(event) =>
                    updateSetting(
                      "acknowledgementLimit",
                      Number(event.target.value)
                    )
                  }
                />
                <span>Hours</span>
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="referral-limit">
                Referral acceptance limit
              </label>
              <div className="settings-input-suffix">
                <input
                  id="referral-limit"
                  type="number"
                  min="1"
                  value={settings.referralLimit}
                  onChange={(event) =>
                    updateSetting(
                      "referralLimit",
                      Number(event.target.value)
                    )
                  }
                />
                <span>Hours</span>
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="followup-limit">
                Follow-up reminder interval
              </label>
              <div className="settings-input-suffix">
                <input
                  id="followup-limit"
                  type="number"
                  min="1"
                  value={settings.followupLimit}
                  onChange={(event) =>
                    updateSetting(
                      "followupLimit",
                      Number(event.target.value)
                    )
                  }
                />
                <span>Hours</span>
              </div>
            </div>

            <p className="settings-helper">
              Demonstration values only. Confirm operational time limits
              with the responsible workflow administrators before use.
            </p>
          </section>

          <section id="notifications" className="settings-section">
            <div className="settings-section-heading">
              <Bell size={19} />
              <div>
                <h2>Notifications</h2>
                <p>
                  Review the notification preferences available in the demo.
                </p>
              </div>
            </div>

            <div className="settings-empty-state">
              Notification preferences are not yet connected to a
              notification service.
            </div>
          </section>

          <section id="access" className="settings-section">
            <div className="settings-section-heading">
              <ShieldCheck size={19} />
              <div>
                <h2>Access & permissions</h2>
                <p>Overview of the platform's defined staff roles.</p>
              </div>
            </div>

            <div className="settings-role-list">
              {[
                "Patient",
                "Coordinator",
                "Referring Clinician",
                "Receiving Clinician",
                "Facility Administrator",
              ].map((role) => (
                <div className="settings-role-item" key={role}>
                  <span>{role}</span>
                  <span className="settings-readonly">Read only</span>
                </div>
              ))}
            </div>

            <p className="settings-helper">
              Actual permissions are controlled by the platform's
              access-control system, not by this demonstration screen.
            </p>
          </section>

          <section id="system" className="settings-section">
            <div className="settings-section-heading">
              <Info size={19} />
              <div>
                <h2>System information</h2>
                <p>Basic information about this workspace.</p>
              </div>
            </div>

            <div className="settings-system-row">
              <span>Application</span>
              <strong>Jusr AI</strong>
            </div>

            <div className="settings-system-row">
              <span>Environment</span>
              <strong>Demonstration</strong>
            </div>

            <div className="settings-system-row">
              <span>Configuration status</span>
              <strong>Demo configuration</strong>
            </div>
          </section>

          <div className="settings-actions">
            <button
              type="button"
              className="settings-reset-button"
              onClick={handleReset}
            >
              <RotateCcw size={16} />
              Reset
            </button>

            <button
              type="button"
              className="settings-save-button"
              onClick={handleSave}
              disabled={!hasChanges}
            >
              <Save size={16} />
              Save changes
            </button>
          </div>

          {feedback && (
            <div className="settings-feedback" role="status">
              <CheckCircle2 size={17} />
              {feedback}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default SettingsPage;
