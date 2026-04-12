export class CreateDemoRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  employees: string;
  marketplaces: string[];
  message?: string;
  preferredTime?: string;
}
