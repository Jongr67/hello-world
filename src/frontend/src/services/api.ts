import { Application, Finding, Ticket, Certificate } from '../types/domain';

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
};
