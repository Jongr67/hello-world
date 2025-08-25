import { Application, Finding, Ticket, Certificate, ProductArea, Team, Person, Role, TeamMembership, ApplicationTeam } from '../types/domain';

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  async getFindings(): Promise<Finding[]> {
    const res = await fetch('/api/findings');
    return json<Finding[]>(res);
  },
  async getFindingsSummary(): Promise<Record<string, number>> {
    const res = await fetch('/api/findings/summary/apg');
    return json<Record<string, number>>(res);
  },
  async getApplications(): Promise<Application[]> {
    const res = await fetch('/api/applications');
    return json<Application[]>(res);
  },
  async getCertificates(): Promise<Certificate[]> {
    const res = await fetch('/api/certificates');
    return json<Certificate[]>(res);
  },
  async getTickets(): Promise<Ticket[]> {
    const res = await fetch('/api/tickets');
    return json<Ticket[]>(res);
  },

  // Product Areas
  async getProductAreas(): Promise<ProductArea[]> {
    const res = await fetch('/api/product-areas');
    return json<ProductArea[]>(res);
  },

  // Teams
  async getTeams(): Promise<Team[]> {
    const res = await fetch('/api/teams');
    return json<Team[]>(res);
  },

  async getTeamsByProductArea(productAreaId: number): Promise<Team[]> {
    const res = await fetch(`/api/teams/product-area/${productAreaId}`);
    return json<Team[]>(res);
  },

  // Persons
  async getPersons(): Promise<Person[]> {
    const res = await fetch('/api/persons');
    return json<Person[]>(res);
  },

  // Roles
  async getRoles(): Promise<Role[]> {
    const res = await fetch('/api/roles');
    return json<Role[]>(res);
  },

  // Team Memberships
  async getTeamMemberships(): Promise<TeamMembership[]> {
    const res = await fetch('/api/team-memberships');
    return json<TeamMembership[]>(res);
  },

  async getTeamMembershipsByTeam(teamId: number): Promise<TeamMembership[]> {
    const res = await fetch(`/api/team-memberships/team/${teamId}`);
    return json<TeamMembership[]>(res);
  },
};
