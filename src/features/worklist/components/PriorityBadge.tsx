
import type { CasePriority } from "../worklist.types";

interface PriorityBadgeProps {
  priority: CasePriority;
}

function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={`worklist-priority-badge priority-${priority}`}
    >
      <span className="priority-dot" />
      {priority}
    </span>
  );
}

export default PriorityBadge;
