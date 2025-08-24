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
