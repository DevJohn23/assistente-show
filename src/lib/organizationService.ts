import { supabase } from '@/lib/supabase';
import { Department, Employee, EmployeeInput, OrganizationData, OrganizationHistory } from '@/types/organization';

export async function fetchOrganization(): Promise<OrganizationData> {
  const [employees, departments, access] = await Promise.all([
    supabase.from('org_employees').select('*').order('sort_order').order('name'),
    supabase.from('org_departments').select('*').order('name'),
    supabase.rpc('can_manage_organization'),
  ]);
  if (employees.error) throw employees.error;
  if (departments.error) throw departments.error;
  if (access.error) throw access.error;
  return { employees: employees.data as Employee[], departments: departments.data as Department[], canManage: access.data === true };
}
export async function saveEmployee(input: EmployeeInput, existing?: Employee): Promise<Employee> {
  const query = existing
    ? supabase.from('org_employees').update(input).eq('id', existing.id).eq('updated_at', existing.updated_at)
    : supabase.from('org_employees').insert(input);
  const { data, error } = await query.select('*').single();
  if (error) throw error;
  return data as Employee;
}
export async function saveDepartment(input: Omit<Department, 'id'>, id?: string) {
  const query = id ? supabase.from('org_departments').update(input).eq('id', id) : supabase.from('org_departments').insert(input);
  const { error } = await query.select('id').single();
  if (error) throw error;
}
export async function deleteDepartment(id: string) {
  const { error } = await supabase.from('org_departments').delete().eq('id', id).select('id').single();
  if (error) throw error;
}
export async function fetchOrganizationHistory(): Promise<OrganizationHistory[]> {
  const { data, error } = await supabase.from('org_history').select('*').order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  return data as OrganizationHistory[];
}
export async function uploadOrganizationPhoto(file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('PHOTO_INVALID');
  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type];
  const path = `uploads/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from('organization-photos').upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}
