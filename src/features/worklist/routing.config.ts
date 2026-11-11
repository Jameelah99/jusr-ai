
export interface SpecialtyRoutingPool {
  specialty: string;
  primaryClinicians: string[];
  backupClinician: string;
  urgentAcceptanceLimitHours: number;
  backupEscalationLimitHours: number;
}

export const specialtyRoutingConfig: SpecialtyRoutingPool[] = [
  {
    specialty: "Endocrinology",
    primaryClinicians: ["Dr. Williams"],
    backupClinician: "Dr. Adams",
    urgentAcceptanceLimitHours: 2,
    backupEscalationLimitHours: 2,
  },
  {
    specialty: "Cardiology",
    primaryClinicians: ["Dr. Adams"],
    backupClinician: "Dr. Williams",
    urgentAcceptanceLimitHours: 2,
    backupEscalationLimitHours: 2,
  },
  {
    specialty: "General Practice",
    primaryClinicians: ["Nurse Johnson", "Dr. Adams"],
    backupClinician: "Dr. Williams",
    urgentAcceptanceLimitHours: 2,
    backupEscalationLimitHours: 2,
  },
];
