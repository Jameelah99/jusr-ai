import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, ClipboardList, UserRound } from "lucide-react";
import AssistedResponseForm, {
  type AssistedResponse,
} from "./components/AssistedResponseForm";
import PrintableResponseSummary from "./components/PrintableResponseSummary";
import "./assisted-response.css";

function AssistedPatientResponsePage() {
  const [response, setResponse] = useState<AssistedResponse | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const patientLabel = searchParams.get("patient") || "Demo Patient";
  const caseId = searchParams.get("caseId") || "DEMO-CASE";

  const handleResponseSubmit = (submittedResponse: AssistedResponse) => {
    setResponse(submittedResponse);
  };

  return (
    <main className="assisted-page">
      <header className="assisted-page-header">
        <div>
          <span className="assisted-eyebrow">JUSR AI · CARE COORDINATION</span>
          <h1>Assisted patient response</h1>
          <p>
            Record patient feedback when a patient cannot use the digital
            patient access page.
          </p>
        </div>
      </header>

      <div className="assisted-page-content">
        <button
          type="button"
          className="assisted-back-button"
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <section className="assisted-patient-context">
          <div className="assisted-patient-avatar">
            <UserRound size={22} />
          </div>

          <div className="assisted-patient-details">
            <span>Patient reference</span>
            <h2>{patientLabel}</h2>
            <p>
              <ClipboardList size={14} />
              {caseId}
            </p>
          </div>

          <span className="assisted-demo-badge">Synthetic demo record</span>
        </section>

        {!response ? (
          <AssistedResponseForm onSubmit={handleResponseSubmit} />
        ) : (
          <>
            <div className="assisted-page-success" role="status">
              <strong>Response recorded</strong>
              <p>
                The patient's responses have been recorded by the demonstration
                coordinator.
              </p>
            </div>

            <PrintableResponseSummary
              response={response}
              patientLabel={patientLabel}
              caseId={caseId}
            />

            <button
              type="button"
              className="assisted-back-button"
              onClick={() =>
                navigate("/worklist", {
                  state: {
                    assistedResponseRecorded: true,
                    caseId,
                    recordedAt: response.recordedAt,
                    recordedBy: response.recordedBy,
                    staffRole: response.staffRole,
                  },
                })
              }
            >
              <ArrowLeft size={17} />
              Return to worklist
            </button>
          </>
        )}

        <div className="assisted-page-disclaimer">
          <strong>Demonstration only</strong>
          <p>
            This page uses synthetic patient and staff information. Responses
            are held in the current browser session and are not sent to a
            healthcare facility.
          </p>
        </div>
      </div>
    </main>
  );
}

export default AssistedPatientResponsePage;
