import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

// Staff roles defined in the Jusr AI Developer Guide
export type UserRole =
  | "coordinator"
  | "referring_clinician"
  | "receiving_clinician"
  | "facility_administrator";

// Facility information
export interface Facility {
  id: string;
  name: string;
}

// Staff user information
export interface DemoUser {
  id: string;
  name: string;
  role: UserRole;
  facility: Facility;
  authorisedToClose: boolean;
}

// Available demo facilities
export const demoFacilities: Facility[] = [
  {
    id: "demo-facility",
    name: "Demo Facility",
  },
  {
    id: "central-specialist",
    name: "Central Specialist Hospital",
  },
];

// Simulated staff accounts for the hackathon
export const demoUsers: DemoUser[] = [
  {
    id: "user-001",
    name: "Jane Doe",
    role: "coordinator",
    facility: demoFacilities[0],
    authorisedToClose: false,
  },
  {
    id: "user-002",
    name: "Dr Williams",
    role: "referring_clinician",
    facility: demoFacilities[0],
    authorisedToClose: true,
  },
  {
    id: "user-003",
    name: "Mary Johnson",
    role: "coordinator",
    facility: demoFacilities[1],
    authorisedToClose: false,
  },
  {
    id: "user-004",
    name: "Dr Okafor",
    role: "receiving_clinician",
    facility: demoFacilities[1],
    authorisedToClose: true,
  },
  {
    id: "user-005",
    name: "Facility Admin",
    role: "facility_administrator",
    facility: demoFacilities[0],
    authorisedToClose: false,
  },
];

// Context definition
interface UserContextType {
  activeUser: DemoUser;
  demoUsers: DemoUser[];
  setActiveUserById: (userId: string) => void;
}

const STORAGE_KEY = "jusr-demo-user";

// Create context
const UserContext = createContext<UserContextType | undefined>(
  undefined
);

// Context provider
export function UserProvider({ children }: { children: ReactNode }) {
  const [activeUser, setActiveUser] = useState<DemoUser>(() => {
    const savedUserId = sessionStorage.getItem(STORAGE_KEY);

    return (
      demoUsers.find((user) => user.id === savedUserId) ??
      demoUsers[0]
    );
  });

  const setActiveUserById = (userId: string) => {
    const selectedUser = demoUsers.find(
      (user) => user.id === userId
    );

    if (selectedUser) {
      setActiveUser(selectedUser);
      sessionStorage.setItem(STORAGE_KEY, selectedUser.id);
    }
  };

  return (
    <UserContext.Provider
      value={{
        activeUser,
        demoUsers,
        setActiveUserById,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// Custom hook for accessing user context
export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error(
      "useUser must be used within a UserProvider"
    );
  }

  return context;
}
