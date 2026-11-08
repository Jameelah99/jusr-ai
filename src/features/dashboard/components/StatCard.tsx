
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  tone: "navy" | "teal" | "coral" | "amber";
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  tone,
}: StatCardProps) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <div className="stat-card-top">
        <span>{label}</span>

        <div className="stat-icon">
          <Icon size={19} strokeWidth={2} />
        </div>
      </div>

      <div className="stat-value">
        {value.toLocaleString()}
      </div>

      <p>{description}</p>
    </article>
  );
}

export default StatCard;
