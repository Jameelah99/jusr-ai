
import "./patient-link.css";
import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  ShieldAlert,
  Clock,
  Link2Off,
  AlertCircle,
  RefreshCw,
  LockKeyhole,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import PatientPage from "./PatientPage";
import jusrLogo from "../../assets/jusr-logo-cropped.png";

type LinkStatus = "active" | "expired" | "replaced" | "invalid";

interface DemoLink {
  status: LinkStatus;
  requiresVerification: boolean;
  demoBirthYear?: string;
}

const demoLinkRegistry: Record<string, DemoLink> = {
  "active-demo-001": {
    status: "active",
    requiresVerification: true,
    demoBirthYear: "1990",
  },
  "active-no-verification-001": {
    status: "active",
    requiresVerification: false,
  },
  "expired-demo-001": {
    status: "expired",
    requiresVerification: false,
  },
  "replaced-demo-001": {
    status: "replaced",
    requiresVerification: false,
  },
};

const linkMessages = {
  expired: {
    title: "This link has expired",
    description:
      "For your security, this patient access link is no longer available.",
    icon: Clock,
  },
  replaced: {
    title: "This link is no longer active",
    description:
      "A newer patient access link has been issued. Please use the latest link you received.",
    icon: Link2Off,
  },
  invalid: {
    title: "Unable to access this page",
    description:
      "This link is invalid or cannot be recognised. Please check the link or contact your healthcare team.",
    icon: ShieldAlert,
  },
};

function PatientLinkGate() {
  const { linkToken } = useParams<{ linkToken: string }>();

  const [requestSent, setRequestSent] = useState(false);
  const [birthYear, setBirthYear] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [verified, setVerified] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const link = linkToken ? demoLinkRegistry[linkToken] : undefined;
  const status: LinkStatus = link?.status ?? "invalid";

  const isLocked = attempts >= 3;

  const handleVerification = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!link?.demoBirthYear || isLocked || verified) return;

    if (birthYear.trim() === link.demoBirthYear) {
      setVerified(true);
      setVerificationError("");
      return;
    }

    const nextAttempt = attempts + 1;
    setAttempts(nextAttempt);
    setBirthYear("");

    if (nextAttempt >= 3) {
      setVerificationError(
        "Too many unsuccessful attempts. This link has been locked and your healthcare team has been notified in this demonstration."
      );
    } else {
      setVerificationError(
        `The birth year does not match. ${3 - nextAttempt} attempt(s) remaining.`
      );
    }
  };

  if (
    status === "active" &&
    link &&
    (!link.requiresVerification || verified)
  ) {
    return <PatientPage />;
  }

  const MessageIcon =
    status === "expired"
      ? linkMessages.expired.icon
      : status === "replaced"
        ? linkMessages.replaced.icon
        : linkMessages.invalid.icon;

  const message =
    status === "expired"
      ? linkMessages.expired
      : status === "replaced"
        ? linkMessages.replaced
        : linkMessages.invalid;

  return (
    <main className="patient-link-page" lang="en" dir="ltr">
      <header className="patient-link-header">
        <img src={jusrLogo} alt="Jusr AI" />

        <span>
          <ShieldAlert size={15} />
          Secure patient access
        </span>
      </header>

      <div className="patient-link-content">
        <div className="patient-link-card">

          {status === "active" && link?.requiresVerification ? (
            <>
              <div className="patient-link-icon">
                {isLocked ? (
                  <LockKeyhole size={30} />
                ) : (
                  <ShieldAlert size={30} />
                )}
              </div>

              <span className="patient-link-eyebrow">
                JUSR AI PATIENT ACCESS
              </span>

              <h1>
                {isLocked
                  ? "Access temporarily locked"
                  : "Verify your identity"}
              </h1>

              <p>
                {isLocked
                  ? "For your security, access has been temporarily locked after three unsuccessful attempts. Please contact your healthcare team for assistance."
                  : "To protect your personal health information, please confirm your year of birth before continuing."}
              </p>

              {!isLocked && (
                <form
                  className="patient-verification-form"
                  onSubmit={handleVerification}
                >
                  <label htmlFor="birth-year">
                    <CalendarDays size={17} />
                    Year of birth
                  </label>

                  <input
                    id="birth-year"
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 1990"
                    min="1900"
                    max="2026"
                    value={birthYear}
                    onChange={(event) => setBirthYear(event.target.value)}
                    required
                  />

                  {verificationError && (
                    <p className="patient-verification-error" role="alert">
                      <AlertCircle size={16} />
                      {verificationError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="patient-link-button"
                    disabled={!birthYear.trim()}
                  >
                    Verify and continue
                  </button>

                  <p className="patient-verification-hint">
                    This is an identity check to help protect your health information.
                  </p>
                </form>
              )}

              {isLocked && (
                <div className="patient-link-confirmation" role="alert">
                  <AlertCircle size={18} />
                  <p>
                    A coordinator follow-up task is simulated for this demonstration.
                    No actual notification has been sent.
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="patient-link-icon">
                <MessageIcon size={30} />
              </div>

              <span className="patient-link-eyebrow">
                JUSR AI PATIENT ACCESS
              </span>

              <h1>{message.title}</h1>
              <p>{message.description}</p>

              {!requestSent ? (
                <button
                  type="button"
                  className="patient-link-button"
                  onClick={() => setRequestSent(true)}
                >
                  <RefreshCw size={17} />
                  Request a new link
                </button>
              ) : (
                <div className="patient-link-confirmation" role="status">
                  <CheckCircle2 size={18} />
                  <p>
                    Your request has been recorded in this demonstration.
                    Please contact your healthcare team to obtain a new link.
                    No actual link has been generated or sent.
                  </p>
                </div>
              )}

              <p className="patient-link-help">
                If you need assistance, please contact your healthcare team.
              </p>
            </>
          )}
        </div>
      </div>

      <footer className="patient-link-footer">
        Jusr AI · Helping you stay informed about your care.
      </footer>
    </main>
  );
}

export default PatientLinkGate;
