import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Circle,
  CalendarDays,
  Phone,
  Info,
} from "lucide-react";
import "./patient.css";
import jusrLogo from "../../assets/jusr-logo-cropped.png";

type Language = "en" | "ar";

const translations = {
  en: {
    secureAccess: "Secure patient access",
    simulated: "SIMULATED DATA — This is a demonstration experience.",
    eyebrow: "YOUR PERSONAL CARE PAGE",
    hello: "Hello, Patient A",
    welcome:
      "Your screening result has been reviewed. Here is an update on your care and what happens next.",
    screeningUpdate: "YOUR SCREENING UPDATE",
    resultReviewed: "Your result has been reviewed",
    resultDescription:
      "A member of your healthcare team has reviewed your screening result. Please follow the next step below and contact your care team if you need an explanation.",
    nextStep: "Next step",
    confirmatoryTesting: "Confirmatory testing",
    journey: "YOUR JOURNEY",
    careProgress: "Your care progress",
    completed: "Completed",
    upcoming: "Upcoming",
    nextAppointment: "Next appointment",
    screeningCompleted: "Screening completed",
    resultReviewedStep: "Result reviewed",
    careFollowUp: "Care and follow-up",
    whatHappensNext: "What happens next?",
    nextDescription:
      "Your care team will guide you through the next step. Please contact them if you need assistance.",
    yourResponse: "YOUR RESPONSE",
    hearFromYou: "We want to hear from you",
    feedbackIntro:
      "Your feedback helps your care team understand how best to support you.",
    receivedQuestion: "Have you received this information?",
    acknowledged: "Information acknowledged",
    received: "I have received this information",
    understandingQuestion:
      "Do you understand what this result means and what happens next?",
    yes: "Yes",
    partly: "Partly",
    no: "No",
    confidenceQuestion: "How confident are you about what happens next?",
    confidenceHint: "1 means not confident; 5 means very confident.",
    notExplained: "Nobody explained this to me",
    callbackQuestion: "Would you like someone to call you?",
    callbackDescription:
      "Your care team can contact you to explain your result or answer questions.",
    callbackRequested: "Call-back requested",
    requestCallback: "Request a call-back",
    callbackRecorded:
      "Your request has been recorded in this demonstration. No actual call-back has been scheduled.",
    submit: "Submit responses",
    submitted: "Responses submitted",
    submitHint:
      "Please acknowledge receipt, select your understanding and provide a confidence rating before submitting.",
    thankYou: "Thank you for your response.",
    submittedNotice:
      "Your responses have been recorded in this demonstration. They have not been sent to your healthcare team.",
    submittedResponses: "Your submitted responses",
    informationReceived: "Information received",
    understanding: "Understanding",
    confidenceRating: "Confidence rating",
    callBackSummary: "Call-back requested",
    needHelp: "Need help or have questions?",
    helpDescription:
      "Your care team is available to explain your result and guide you through the next steps.",
    contactDetails: "Contact details will appear here.",
    footer: "Jusr AI · Helping you stay informed about your care.",
  },

  ar: {
    secureAccess: "وصول آمن للمريض",
    simulated: "بيانات تجريبية — هذه تجربة توضيحية.",
    eyebrow: "صفحة الرعاية الشخصية الخاصة بك",
    hello: "مرحباً، المريض أ",
    welcome:
      "تمت مراجعة نتيجة الفحص الخاصة بك. إليك تحديثاً عن رعايتك والخطوة التالية.",
    screeningUpdate: "تحديث الفحص الخاص بك",
    resultReviewed: "تمت مراجعة نتيجتك",
    resultDescription:
      "قام أحد أعضاء فريق الرعاية الصحية بمراجعة نتيجة الفحص الخاصة بك. يرجى اتباع الخطوة التالية والتواصل مع فريق الرعاية إذا كنت بحاجة إلى توضيح.",
    nextStep: "الخطوة التالية",
    confirmatoryTesting: "فحص تأكيدي",
    journey: "رحلتك الصحية",
    careProgress: "تقدم الرعاية الخاصة بك",
    completed: "مكتمل",
    upcoming: "قادم",
    nextAppointment: "الموعد التالي",
    screeningCompleted: "اكتمل الفحص",
    resultReviewedStep: "تمت مراجعة النتيجة",
    careFollowUp: "الرعاية والمتابعة",
    whatHappensNext: "ماذا سيحدث بعد ذلك؟",
    nextDescription:
      "سيرشدك فريق الرعاية خلال الخطوة التالية. يرجى التواصل معهم إذا كنت بحاجة إلى المساعدة.",
    yourResponse: "ردك",
    hearFromYou: "نود معرفة رأيك",
    feedbackIntro: "تساعد ملاحظاتك فريق الرعاية على فهم أفضل طريقة لدعمك.",
    receivedQuestion: "هل استلمت هذه المعلومات؟",
    acknowledged: "تم تأكيد استلام المعلومات",
    received: "لقد استلمت هذه المعلومات",
    understandingQuestion: "هل تفهم معنى هذه النتيجة وما الذي سيحدث بعد ذلك؟",
    yes: "نعم",
    partly: "جزئياً",
    no: "لا",
    confidenceQuestion: "ما مدى ثقتك بشأن الخطوة التالية؟",
    confidenceHint: "١ تعني غير واثق؛ ٥ تعني واثق جداً.",
    notExplained: "لم يشرح لي أحد هذه المعلومات",
    callbackQuestion: "هل ترغب في أن يتصل بك أحد؟",
    callbackDescription:
      "يمكن لفريق الرعاية الاتصال بك لشرح نتيجتك أو الإجابة عن أسئلتك.",
    callbackRequested: "تم طلب معاودة الاتصال",
    requestCallback: "طلب معاودة الاتصال",
    callbackRecorded:
      "تم تسجيل طلبك في هذه التجربة التوضيحية. لم يتم تحديد موعد اتصال فعلي.",
    submit: "إرسال الردود",
    submitted: "تم إرسال الردود",
    submitHint:
      "يرجى تأكيد استلام المعلومات وتحديد مدى فهمك وتقييم مستوى ثقتك قبل الإرسال.",
    thankYou: "شكراً لك على ردك.",
    submittedNotice:
      "تم تسجيل ردودك في هذه التجربة التوضيحية. لم يتم إرسالها إلى فريق الرعاية الصحية.",
    submittedResponses: "الردود التي قدمتها",
    informationReceived: "استلام المعلومات",
    understanding: "مدى الفهم",
    confidenceRating: "تقييم الثقة",
    callBackSummary: "طلب معاودة الاتصال",
    needHelp: "هل تحتاج إلى مساعدة أو لديك أسئلة؟",
    helpDescription:
      "فريق الرعاية متاح لشرح نتيجتك وإرشادك خلال الخطوات التالية.",
    contactDetails: "ستظهر تفاصيل الاتصال هنا.",
    footer: "Jusr AI · نساعدك على متابعة رعايتك الصحية.",
  },
} as const;

function PatientPage() {
  const [language, setLanguage] = useState<Language>("en");

  const t = translations[language];
  const isArabic = language === "ar";

  const formatNumber = (value: number) => {
  if (language === "ar") {
    const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

    return String(value).replace(
      /\d/g,
      (digit) => arabicDigits[Number(digit)]
    );
  }

  return String(value);
};

  const [acknowledged, setAcknowledged] = useState(false);
  const [understanding, setUnderstanding] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [notExplained, setNotExplained] = useState(false);
  const [callbackRequested, setCallbackRequested] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedResponse, setSubmittedResponse] = useState<{
    acknowledged: boolean;
    understanding: string;
    confidence: number;
    notExplained: boolean;
    callbackRequested: boolean;
    submittedAt: string;
  } | null>(null);

  const canSubmit =
    acknowledged && understanding !== "" && confidence !== null && !submitted;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const patientResponse = {
      acknowledged,
      understanding,
      confidence: confidence!,
      notExplained,
      callbackRequested,
      submittedAt: new Date().toISOString(),
    };

    setSubmittedResponse(patientResponse);
    setSubmitted(true);
  };

  const progressSteps = [
    { label: t.screeningCompleted, completed: true },
    { label: t.resultReviewedStep, completed: true },
    { label: t.nextAppointment, completed: false, current: true },
    { label: t.careFollowUp, completed: false },
  ];

  return (
    <main
      className={`patient-page ${isArabic ? "patient-arabic" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
      lang={language}
    >
      <header className="patient-header">
        <div className="patient-brand">
          <img src={jusrLogo} alt="Jusr AI" />
        </div>

        <div
  className="patient-language-switch"
  role="group"
  aria-label="Select language"
  dir="ltr"
>
  <button
    type="button"
    className={language === "en" ? "active" : ""}
    onClick={() => setLanguage("en")}
    aria-pressed={language === "en"}
  >
    English
  </button>

  <button
    type="button"
    className={language === "ar" ? "active" : ""}
    onClick={() => setLanguage("ar")}
    aria-pressed={language === "ar"}
  >
    العربية
  </button>
</div>

        <div className="patient-header-secure">
          <ShieldCheck size={16} />
          <span>{t.secureAccess}</span>
        </div>
      </header>

      <div className="patient-simulation-notice">
        <Info size={16} />
        <span>{t.simulated}</span>
      </div>

      <div className="patient-content">
        <section className="patient-welcome">
          <span className="patient-eyebrow">{t.eyebrow}</span>
          <h1>{t.hello}</h1>
          <p>{t.welcome}</p>
        </section>

        <section className="patient-result-card">
          <div className="patient-section-heading">
            <div>
              <span className="patient-eyebrow">{t.screeningUpdate}</span>
              <h2>{t.resultReviewed}</h2>
            </div>
            <span className="patient-result-icon">
              <CheckCircle2 size={23} />
            </span>
          </div>

          <p> {t.resultDescription}</p>

          <div className="patient-urgency">
            <span>{t.nextStep}</span>
            <strong>{t.confirmatoryTesting}</strong>
          </div>
        </section>

        <section className="patient-progress-card">
          <div className="patient-card-heading">
            <div>
              <span className="patient-eyebrow">{t.journey}</span>
              <h2>{t.careProgress}</h2>
            </div>
          </div>

          <div className="patient-progress-list">
            {progressSteps.map((step, index) => (
              <div className="patient-progress-step" key={step.label}>
                <div className="patient-progress-marker">
                  {step.completed ? (
                    <CheckCircle2 size={21} />
                  ) : step.current ? (
                    <span className="patient-current-marker" />
                  ) : (
                    <Circle size={21} />
                  )}

                  {index !== progressSteps.length - 1 && (
                    <span
                      className={`patient-progress-line ${
                        step.completed ? "completed" : ""
                      }`}
                    />
                  )}
                </div>

                <div className="patient-progress-label">
                  <strong>{step.label}</strong>
                  <span>
                    {step.completed
                      ? t.completed
                      : step.current
                        ? t.nextStep
                        : t.upcoming}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="patient-next-step-card">
          <div className="patient-card-heading">
            <CalendarDays size={20} />
            <h2>{t.whatHappensNext}</h2>
          </div>

          <strong>{t.confirmatoryTesting}</strong>
          <p>{t.nextDescription}</p>
        </section>

        <section className="patient-response-card">
          <span className="patient-eyebrow">{t.yourResponse}</span>
          <h2>{t.hearFromYou}</h2>
          <p className="patient-response-intro">{t.feedbackIntro}</p>

          <div className="patient-response-group">
            <h3>{t.receivedQuestion}</h3>

            <button
              type="button"
              disabled={submitted}
              className={`patient-acknowledge-button ${
                acknowledged ? "selected" : ""
              }`}
              onClick={() => setAcknowledged(!acknowledged)}
              aria-pressed={acknowledged}
            >
              {acknowledged ? <CheckCircle2 size={19} /> : <Circle size={19} />}
              {acknowledged ? t.acknowledged : t.received}
            </button>
          </div>

          <div className="patient-response-group">
            <h3>{t.understandingQuestion}</h3>

            <div className="patient-choice-list">
              {[t.yes, t.partly, t.no].map((option) => (
                <button
                  type="button"
                  disabled={submitted}
                  key={option}
                  className={`patient-choice-button ${
                    understanding === option ? "selected" : ""
                  }`}
                  onClick={() => setUnderstanding(option)}
                  aria-pressed={understanding === option}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="patient-response-group">
            <h3>{t.confidenceQuestion}</h3>
            <p className="patient-response-hint">{t.confidenceHint}</p>

            <div className="patient-confidence-list">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  type="button"
                  disabled={submitted}
                  key={rating}
                  className={`patient-confidence-button ${
                    confidence === rating ? "selected" : ""
                  }`}
                  onClick={() => setConfidence(rating)}
                  aria-pressed={confidence === rating}
                  aria-label={`Confidence rating ${rating}`}
                >
                  {formatNumber(rating)}
                </button>
              ))}
            </div>
          </div>

          <div className="patient-response-group">
            <button
              type="button"
              disabled={submitted}
              className={`patient-not-explained-button ${
                notExplained ? "selected" : ""
              }`}
              onClick={() => setNotExplained(!notExplained)}
              aria-pressed={notExplained}
            >
              {notExplained ? "✓ " : ""}
              {t.notExplained}
            </button>
          </div>

          <div className="patient-response-group patient-callback-group">
            <div>
              <h3>{t.callbackQuestion}</h3>
              <p className="patient-response-hint">{t.callbackDescription}</p>
            </div>

            <button
              type="button"
              disabled={submitted}
              className="patient-callback-button"
              onClick={() => setCallbackRequested(!callbackRequested)}
            >
              <Phone size={17} />
              {callbackRequested ? t.callbackRequested : t.requestCallback}
            </button>

            {callbackRequested && (
              <p className="patient-feedback-message" role="status">
                {t.callbackRecorded}
              </p>
            )}
          </div>

          <div className="patient-submit-area">
            <button
              type="button"
              className="patient-submit-button"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {submitted ? t.submitted : t.submit}
            </button>

            {!submitted && (
              <p className="patient-submit-hint">{t.submitHint}</p>
            )}

            {submitted && submittedResponse && (
              <div className="patient-submit-success" role="status">
                <CheckCircle2 size={20} />

                <div className="patient-submission-details">
                  <strong>{t.thankYou}</strong>

                  <p>{t.submittedNotice}</p>

                  <div className="patient-submission-summary">
                    <h4>{t.submittedResponses}</h4>

                    <div>
                      <span>{t.informationReceived}</span>
                      <strong>
                        {submittedResponse.acknowledged ? t.yes : t.no}
                      </strong>
                    </div>

                    <div>
                      <span>{t.understanding}</span>
                      <strong>
                        {submittedResponse.understanding === "Yes"
                          ? t.yes
                          : submittedResponse.understanding === "Partly"
                            ? t.partly
                            : t.no}
                      </strong>
                    </div>

                    <div>
                      <span>{t.confidenceRating}</span>
                      <strong dir="ltr">
  {formatNumber(submittedResponse.confidence)} / {formatNumber(5)}
</strong>
                    </div>

                    <div>
                      <span>{t.notExplained}</span>
                      <strong>
                        {submittedResponse.notExplained ? t.yes : t.no}
                      </strong>
                    </div>

                    <div>
                      <span>{t.callBackSummary}</span>
                      <strong>
                        {submittedResponse.callbackRequested ? t.yes : t.no}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="patient-contact-card">
          <div className="patient-contact-icon">
            <Phone size={20} />
          </div>

          <div>
            <h3>{t.needHelp}</h3>
            <p>{t.helpDescription}</p>
            <span>{t.contactDetails}</span>
          </div>
        </section>
      </div>

      <footer className="patient-footer">
        <p>{t.footer}</p>
      </footer>
    </main>
  );
}

export default PatientPage;
