export interface Department { id: string; name: string; color: string }
export interface Employee {
  id: string;
  name: string;
  job_title: string;
  department_id: string;
  unit: string;
  email: string;
  phone: string;
  extension: string;
  responsibilities: string;
  serves: string[];
  manager_id: string | null;
  photo_path: string;
  status: 'active' | 'inactive';
  is_example: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
export type EmployeeInput = Omit<Employee, 'id' | 'created_at' | 'updated_at'>;
export interface OrganizationData { employees: Employee[]; departments: Department[]; canManage: boolean }
export interface OrganizationHistory {
  id: number; entity_id: string; entity_type: string; operation: string;
  actor_email: string | null; created_at: string;
  before_data: Partial<Employee & Department> | null;
  after_data: Partial<Employee & Department> | null;
}
