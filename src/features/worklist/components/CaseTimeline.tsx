import "./CaseTimeline.css";
import { Activity, UserRound, Clock3, FileText } from "lucide-react";
import { formatDateTime } from "../../../utils/formatDateTime";
import type { CaseTimelineEvent } from "../worklist.types";

interface CaseTimelineProps {
  events: CaseTimelineEvent[];
}

function CaseTimeline({ events }: CaseTimelineProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  if (sortedEvents.length === 0) {
    return (
      <section className="case-timeline">
        <div className="case-timeline-heading">
          <Activity size={17} />
          <div>
            <h3>Case activity history</h3>
            <span className="case-timeline-demo-label">
              Synthetic demo events
            </span>
          </div>
        </div>

        <div className="case-timeline-empty">
          <FileText size={25} />
          <strong>No activity recorded yet</strong>
          <p>Case activities will appear here as the case progresses.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="case-timeline">
      <div className="case-timeline-heading">
        <Activity size={17} />
        <div>
          <h3>Case activity history</h3>
          <span>{sortedEvents.length} recorded events</span>
        </div>
        <span className="case-timeline-demo-label">Synthetic demo events</span>
      </div>

      <div className="case-timeline-list">
        {sortedEvents.map((event, index) => (
          <article className="case-timeline-item" key={event.id}>
            <div className="case-timeline-marker">
              <span className="case-timeline-dot" />

              {index !== sortedEvents.length - 1 && (
                <span className="case-timeline-line" />
              )}
            </div>

            <div className="case-timeline-event">
              <div className="case-timeline-event-header">
                <h4>{event.title}</h4>
                <span className="case-timeline-type">
                  {event.eventType.replace(/_/g, " ")}
                </span>
              </div>

              <p>{event.description}</p>

              <div className="case-timeline-metadata">
                <span>
                  <UserRound size={13} />
                  {event.actor}
                </span>

                <span>{event.actorRole}</span>
              </div>

              <div className="case-timeline-time">
                <Clock3 size={12} />
                {formatDateTime(event.timestamp)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CaseTimeline;
