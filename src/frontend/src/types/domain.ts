export type Finding = {
  id: number;
  description?: string;
  applicationSealId?: string;
  severity?: string;
  criticality?: string;
  targetDate?: string;
  assignedApg?: string;
  createdDate?: string;
};

export type Application = {
  id: number;
  sealId: string;
  name: string;
  platform?: string;
  owningApg?: string;
  codeRepository?: string;
  certificates?: string;
  productArea?: ProductArea;
};

export type Ticket = {
  id: number;
  jiraKey?: string;
  jiraUrl?: string;
  apg?: string;
  status?: string;
  findingId?: number;
  applicationSealId?: string;
};

export type Certificate = {
  id: number;
  cn?: string;
  serial?: string;
  expirationDate?: string;
  application?: Application;
  applicationId?: number;
};

export type ProductArea = {
  id: number;
  name: string;
  description?: string;
  createdDate?: string;
  updatedDate?: string;
};

export type Team = {
  id: number;
  name: string;
  description?: string;
  productArea: ProductArea;
  createdDate?: string;
  updatedDate?: string;
};

export type Person = {
  id: number;
  firstName: string;
  lastName: string;
  sid: string;
  email?: string;
  createdDate?: string;
  updatedDate?: string;
};

export type Role = {
  id: number;
  name: string;
  description?: string;
  createdDate?: string;
  updatedDate?: string;
};

export type TeamMembership = {
  id: number;
  team: Team;
  person: Person;
  role: Role;
  startDate?: string;
  endDate?: string;
  isPrimary?: boolean;
  createdDate?: string;
  updatedDate?: string;
};

export type ApplicationTeam = {
  id: number;
  application: Application;
  team: Team;
  relationship: string;
  createdDate?: string;
  updatedDate?: string;
};
