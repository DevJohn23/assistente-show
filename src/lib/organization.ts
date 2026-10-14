import { Employee } from '@/types/organization';

export const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
export function matchesEmployee(employee: Employee, query: string, departmentName = '') {
  return normalizeSearch([employee.name, employee.job_title, employee.email, employee.phone, employee.unit,
    employee.responsibilities, ...employee.serves, departmentName].join(' ')).includes(normalizeSearch(query.trim()));
}
export function ancestorsOf(id: string, employees: Employee[]): string[] {
  const byId = new Map(employees.map(e => [e.id, e]));
  const seen = new Set<string>([id]);
  const result: string[] = [];
  let current = byId.get(id)?.manager_id;
  while (current && !seen.has(current)) {
    seen.add(current); result.push(current); current = byId.get(current)?.manager_id;
  }
  return result;
}
export function descendantsOf(id: string, employees: Employee[]): Set<string> {
  const found = new Set<string>();
  const queue = [id];
  while (queue.length) {
    const current = queue.shift();
    for (const child of employees.filter(e => e.manager_id === current)) {
      if (child.id !== id && !found.has(child.id)) { found.add(child.id); queue.push(child.id); }
    }
  }
  return found;
}
export function visibleEmployees(employees: Employee[], expanded: Set<string>, focusId: string | null,
  departmentId: string, query: string, departments: Map<string, string>): Employee[] {
  const active = employees.filter(e => e.status === 'active');
  if (focusId) {
    const self = active.find(e => e.id === focusId);
    return active.filter(e => e.id === focusId || e.id === self?.manager_id || e.manager_id === focusId);
  }
  if (departmentId || query.trim()) {
    const matching = active.filter(e => (!departmentId || e.department_id === departmentId) && matchesEmployee(e, query, departments.get(e.department_id)));
    const ids = new Set(matching.flatMap(e => [e.id, ...ancestorsOf(e.id, active)]));
    return active.filter(e => ids.has(e.id));
  }
  return active.filter(e => ancestorsOf(e.id, active).every(id => expanded.has(id)));
}
export function validateEmployee(input: Pick<Employee, 'id' | 'manager_id' | 'status'>, employees: Employee[]): string | null {
  if (input.manager_id === input.id || (input.manager_id && descendantsOf(input.id, employees).has(input.manager_id))) return 'Esta liderança criaria um ciclo na estrutura.';
  if (input.manager_id && !employees.some(e => e.id === input.manager_id && e.status === 'active')) return 'Escolha uma liderança ativa.';
  if (input.status === 'inactive' && employees.some(e => e.manager_id === input.id && e.status === 'active')) return 'Reatribua os liderados ativos antes de inativar esta pessoa.';
  return null;
}
export function organizationError(error: unknown): string {
  const e = error as { code?: string; message?: string };
  if (e.code === '42501') return 'Você não tem permissão para esta alteração. Verifique seu acesso.';
  if (e.code === '23503') return 'Este registro está vinculado à estrutura. Reatribua os vínculos antes de excluir.';
  if (e.code === '23505') return 'Já existe um registro com esse nome.';
  if (e.code === '23514') return e.message?.includes('constraint') ? 'Confira os campos e os limites de preenchimento.' : e.message || 'Estrutura inválida.';
  if (e.code === 'PGRST116') return 'O registro foi alterado por outra pessoa. Atualize a página antes de salvar novamente.';
  return 'Não foi possível concluir. Seus dados foram preservados; verifique a conexão e tente novamente.';
}
