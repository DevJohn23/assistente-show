'use client';
import React, { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Check, History, Pencil, Plus, Search, ShieldCheck, Upload, Users, X } from 'lucide-react';
import { EmployeeAvatar, useOrganization } from './OrganizationProvider';
import { Department, Employee, EmployeeInput, OrganizationHistory } from '@/types/organization';
import { descendantsOf, matchesEmployee, organizationError, validateEmployee } from '@/lib/organization';
import { deleteDepartment, fetchOrganizationHistory, saveDepartment, saveEmployee, uploadOrganizationPhoto } from '@/lib/organizationService';

const blankEmployee = (departmentId: string): EmployeeInput => ({ name: '', job_title: '', department_id: departmentId, unit: '', email: '', phone: '', extension: '', responsibilities: '', serves: [], manager_id: null, photo_path: '', status: 'active', is_example: false, sort_order: 1000 });

function EmployeeEditor({ employee, onClose, onSaved }: { employee?: Employee; onClose: () => void; onSaved: (saved: Employee, photo?: Blob) => void }) {
  const { employees, departments } = useOrganization();
  const [form, setForm] = useState<EmployeeInput>(() => employee ? {
    name: employee.name, job_title: employee.job_title, department_id: employee.department_id, unit: employee.unit,
    email: employee.email, phone: employee.phone, extension: employee.extension, responsibilities: employee.responsibilities,
    serves: employee.serves, manager_id: employee.manager_id, photo_path: employee.photo_path, status: employee.status,
    is_example: employee.is_example, sort_order: employee.sort_order,
  } : blankEmployee(departments[0]?.id || ''));
  const [servesText, setServesText] = useState(employee?.serves.join('\n') || '');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [discard, setDiscard] = useState(false);
  const saving = useRef(false);
  const uploaded = useRef<{ file: File; path: string } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const forbidden = employee ? descendantsOf(employee.id, employees) : new Set<string>();
  const patch = (value: Partial<EmployeeInput>) => { setForm(prev => ({ ...prev, ...value })); setDirty(true); };
  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement;
    dialog.current?.showModal(); return () => previousFocus.current?.focus();
  }, []);
  useEffect(() => {
    if (!photo) { setPreview(''); return; }
    const url = URL.createObjectURL(photo); setPreview(url); return () => URL.revokeObjectURL(url);
  }, [photo]);
  const close = () => { if (saving.current) return; if (dirty) setDiscard(true); else onClose(); };
  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (saving.current) return;
    const input = { ...form, name: form.name.trim(), job_title: form.job_title.trim(), email: form.email.trim(),
      serves: Array.from(new Set(servesText.split('\n').map(s => s.trim()).filter(Boolean))) };
    const validation = validateEmployee({ id: employee?.id || '__new', manager_id: input.manager_id, status: input.status }, employees);
    if (validation) { setError(validation); return; }
    if (!input.name || !input.job_title || !input.department_id) { setError('Preencha nome, cargo e departamento.'); return; }
    if (input.serves.length > 30 || input.serves.some(s => s.length > 150)) { setError('Informe até 30 atendimentos, com até 150 caracteres cada.'); return; }
    saving.current = true; setBusy(true); setError('');
    try {
      if (photo) {
        if (uploaded.current?.file !== photo) uploaded.current = { file: photo, path: await uploadOrganizationPhoto(photo) };
        input.photo_path = uploaded.current.path;
      }
      const saved = await saveEmployee(input, employee);
      onSaved(saved, photo || undefined);
    } catch (e) { setError((e as Error).message === 'PHOTO_INVALID' ? 'Escolha uma imagem JPG, PNG ou WebP de até 5 MB.' : organizationError(e)); }
    finally { saving.current = false; setBusy(false); }
  };
  return <dialog ref={dialog} className="org-dialog" aria-labelledby="employee-editor-title" onCancel={event => { event.preventDefault(); close(); }}>
    <form onSubmit={submit}>
      <header><div><p className="org-eyebrow">GESTÃO DE PESSOAS</p><h2 id="employee-editor-title">{employee ? 'Editar colaborador' : 'Novo colaborador'}</h2></div><button type="button" aria-label="Fechar edição" className="ui-icon-button" onClick={close} disabled={busy}><X size={18} /></button></header>
      <div className="org-form-body">
        {discard && <div className="org-discard" role="alert"><p>Descartar as alterações não salvas?</p><button type="button" className="org-button" onClick={() => setDiscard(false)}>Continuar editando</button><button type="button" className="org-button org-danger" onClick={onClose}>Descartar</button></div>}
        <div className="org-photo-field">{preview ? <img src={preview} alt="Prévia da nova foto" /> : employee && form.photo_path ? <EmployeeAvatar employee={{ ...employee, photo_path: form.photo_path }} size={64} /> : <div className="org-avatar" style={{ width: 64, height: 64 }}><Users size={26} /></div>}
          <div><label className="org-button"><Upload size={15} />Selecionar foto<input type="file" aria-label="Foto do colaborador" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => {
            const file = e.target.files?.[0]; if (!file) return;
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5242880) { setError('Escolha uma imagem JPG, PNG ou WebP de até 5 MB.'); e.target.value = ''; return; }
            setPhoto(file); setDirty(true); setError('');
          }} /></label><small>JPG, PNG ou WebP · até 5 MB</small>{(photo || form.photo_path) && <button type="button" className="org-text-link" disabled={busy} onClick={() => { setPhoto(null); patch({ photo_path: '' }); }}>Remover foto</button>}</div></div>
        <fieldset disabled={busy}><legend>Identificação</legend><div className="org-form-grid">
          <label className="org-field org-span-2">Nome completo<input aria-label="Nome completo" autoFocus className="org-input" required maxLength={150} value={form.name} onChange={e => patch({ name: e.target.value })} /></label>
          <label className="org-field">Cargo<input aria-label="Cargo" className="org-input" required maxLength={150} list="org-job-titles" value={form.job_title} onChange={e => patch({ job_title: e.target.value })} /><datalist id="org-job-titles">{Array.from(new Set(employees.map(e => e.job_title))).map(t => <option key={t} value={t} />)}</datalist></label>
          <label className="org-field">Departamento<select aria-label="Departamento" className="org-input" required value={form.department_id} onChange={e => patch({ department_id: e.target.value })}><option value="">Selecione</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
          <label className="org-field">Unidade / localidade<input aria-label="Unidade / localidade" className="org-input" maxLength={150} list="org-units" value={form.unit} onChange={e => patch({ unit: e.target.value })} placeholder="Ex.: João Pessoa · PB" /><datalist id="org-units">{Array.from(new Set(employees.map(e => e.unit).filter(Boolean))).map(u => <option key={u} value={u} />)}</datalist></label>
          <label className="org-field">Situação<select aria-label="Situação" className="org-input" value={form.status} onChange={e => patch({ status: e.target.value as Employee['status'] })}><option value="active">Ativo</option><option value="inactive">Inativo</option></select></label>
        </div></fieldset>
        <fieldset disabled={busy}><legend>Contatos profissionais</legend><div className="org-form-grid">
          <label className="org-field org-span-2">E-mail<input aria-label="E-mail" type="email" className="org-input" maxLength={254} value={form.email} onChange={e => patch({ email: e.target.value })} /></label>
          <label className="org-field">Telefone<input aria-label="Telefone" type="tel" className="org-input" maxLength={50} value={form.phone} onChange={e => patch({ phone: e.target.value })} /></label>
          <label className="org-field">Ramal<input aria-label="Ramal" className="org-input" maxLength={20} value={form.extension} onChange={e => patch({ extension: e.target.value })} /></label>
        </div></fieldset>
        <fieldset disabled={busy}><legend>Estrutura e responsabilidades</legend><div className="org-form-grid">
          <label className="org-field org-span-2">Responde a<select aria-label="Responde a" className="org-input" value={form.manager_id || ''} onChange={e => patch({ manager_id: e.target.value || null })}><option value="">Sem liderança cadastrada</option>{employees.filter(e => e.status === 'active' && e.id !== employee?.id && !forbidden.has(e.id)).map(e => <option key={e.id} value={e.id}>{e.name} · {e.job_title}</option>)}</select></label>
          {employee && employee.manager_id !== form.manager_id && <p className="org-note org-span-2">{form.name} {form.manager_id ? `passará a responder a ${employees.find(e => e.id === form.manager_id)?.name}.` : 'ficará sem liderança cadastrada.'}</p>}
          <label className="org-field org-span-2">Atende<textarea aria-label="Atende" className="org-input" rows={3} value={servesText} onChange={e => { setServesText(e.target.value); setDirty(true); }} placeholder="Uma pessoa, equipe ou público por linha" /><small>Atendimento é diferente de subordinação.</small></label>
          <label className="org-field org-span-2">Atribuições<textarea aria-label="Atribuições" className="org-input" rows={4} maxLength={5000} value={form.responsibilities} onChange={e => patch({ responsibilities: e.target.value })} placeholder="Descreva as responsabilidades desta pessoa" /></label>
          <label className="org-checkbox org-span-2"><input type="checkbox" checked={form.is_example} onChange={e => patch({ is_example: e.target.checked })} />Cadastro fictício para demonstração</label>
        </div></fieldset>
        {error && <p className="org-error" role="alert">{error}</p>}
      </div>
      <footer><button type="button" className="org-button" disabled={busy} onClick={close}>Cancelar</button><button className="org-button org-primary" disabled={busy}>{busy ? 'Salvando…' : 'Salvar colaborador'}</button></footer>
    </form>
  </dialog>;
}

function DepartmentEditor({ department, onClose, onSaved }: { department?: Department; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(department?.name || ''); const [color, setColor] = useState(department?.color || '#2563eb');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const lock = useRef(false); const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const previous = document.activeElement as HTMLElement; dialog.current?.showModal(); return () => previous?.focus(); }, []);
  return <dialog className="org-dialog org-small-dialog" ref={dialog} aria-labelledby="department-editor-title" onCancel={e => { e.preventDefault(); if (!busy) onClose(); }}><form onSubmit={async e => {
    e.preventDefault(); if (lock.current) return; lock.current = true; setBusy(true); setError('');
    try { await saveDepartment({ name: name.trim(), color }, department?.id); onSaved(); } catch (err) { setError(organizationError(err)); } finally { lock.current = false; setBusy(false); }
  }}><header><h2 id="department-editor-title">{department ? 'Editar departamento' : 'Novo departamento'}</h2><button type="button" className="ui-icon-button" aria-label="Fechar departamento" disabled={busy} onClick={onClose}><X size={18} /></button></header><div className="org-form-body">
    <label className="org-field">Nome do departamento<input aria-label="Nome do departamento" autoFocus className="org-input" required maxLength={100} value={name} onChange={e => setName(e.target.value)} disabled={busy} /></label>
    <label className="org-field mt-4">Cor de identificação<input type="color" value={color} onChange={e => setColor(e.target.value)} disabled={busy} /></label>
    {error && <p className="org-error" role="alert">{error}</p>}</div><footer><button type="button" className="org-button" disabled={busy} onClick={onClose}>Cancelar</button><button className="org-button org-primary" disabled={busy}>{busy ? 'Salvando…' : 'Salvar departamento'}</button></footer></form></dialog>;
}

function HistoryView() {
  const { employees, departments } = useOrganization();
  const [rows, setRows] = useState<OrganizationHistory[]>([]); const [error, setError] = useState(false); const [loading, setLoading] = useState(true); const [version, setVersion] = useState(0);
  useEffect(() => { let live = true; setLoading(true); setError(false); void fetchOrganizationHistory().then(data => { if (live) setRows(data); }).catch(() => { if (live) setError(true); }).finally(() => { if (live) setLoading(false); }); return () => { live = false; }; }, [version]);
  if (loading) return <div className="org-loading" role="status">Carregando histórico…</div>;
  if (error) return <div className="org-empty" role="alert">Não foi possível carregar o histórico.<button className="org-button" onClick={() => setVersion(v => v + 1)}>Tentar novamente</button></div>;
  const labels: Record<string, string> = { name: 'Nome', job_title: 'Cargo', email: 'E-mail', phone: 'Telefone', department_id: 'Departamento', unit: 'Unidade', manager_id: 'Liderança', status: 'Situação', responsibilities: 'Atribuições', serves: 'Atende', photo_path: 'Foto', extension: 'Ramal', is_example: 'Fictício', color: 'Cor' };
  const display = (key: string, value: unknown): string => {
    if (value === null || value === undefined || value === '') return 'Não informado';
    if (key === 'manager_id') return employees.find(e => e.id === value)?.name || 'Colaborador removido';
    if (key === 'department_id') return departments.find(d => d.id === value)?.name || 'Departamento removido';
    if (key === 'status') return value === 'active' ? 'Ativo' : 'Inativo';
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    if (Array.isArray(value)) return value.join(', ') || 'Não informado';
    return String(value);
  };
  return <div className="org-history"><p className="org-muted">Últimas 100 alterações. Os registros são gerados automaticamente.</p>{!rows.length && <p>Nenhuma alteração registrada.</p>}{rows.map(row => <details key={row.id}><summary><span className="org-history-dot" /><span><strong>{row.after_data?.name || row.before_data?.name || 'Registro'}</strong><small>{row.operation === 'INSERT' ? 'Cadastro criado' : row.operation === 'DELETE' ? 'Registro excluído' : 'Cadastro atualizado'} · {row.actor_email || 'Importação inicial'}</small></span><time>{new Date(row.created_at).toLocaleString('pt-BR')}</time></summary><dl>{Object.entries(labels).filter(([key]) => JSON.stringify(row.before_data?.[key as keyof Employee]) !== JSON.stringify(row.after_data?.[key as keyof Employee])).map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{key === 'photo_path' ? 'Foto alterada' : `${display(key, row.before_data?.[key as keyof Employee])} → ${display(key, row.after_data?.[key as keyof Employee])}`}</dd></div>)}</dl></details>)}</div>;
}

export default function OrganizationAdmin() {
  const { employees, departments, canManage, loading, error, reload, applyEmployee } = useOrganization();
  const [tab, setTab] = useState<'employees' | 'departments' | 'history'>('employees');
  const [query, setQuery] = useState(''); const [status, setStatus] = useState('active'); const [department, setDepartment] = useState('');
  const [editor, setEditor] = useState<Employee | 'new' | null>(null); const [deptEditor, setDeptEditor] = useState<Department | 'new' | null>(null);
  const [notice, setNotice] = useState(''); const [actionError, setActionError] = useState(''); const [removing, setRemoving] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  const initialEdit = useRef(false);
  useEffect(() => { if (!canManage || initialEdit.current || loading) return; initialEdit.current = true;
    const id = new URLSearchParams(window.location.search).get('editar'); const person = employees.find(e => e.id === id); if (person) setEditor(person);
  }, [canManage, loading, employees]);
  const saved = async () => {
    setEditor(null); setDeptEditor(null); setNotice('Alterações salvas.');
    if (!await reload()) setActionError('As alterações foram salvas, mas a lista não pôde ser atualizada. Tente recarregar.');
  };
  if (loading && !employees.length) return <div className="org-loading" role="status">Verificando permissão…</div>;
  if (error) return <div className="org-empty" role="alert"><p>Não foi possível verificar o acesso.</p><button className="org-button" onClick={() => void reload()}>Tentar novamente</button></div>;
  if (!canManage) return <div className="org-empty"><ShieldCheck size={36} /><h1>Acesso restrito</h1><p>Somente administradores podem gerenciar a organização.</p><Link href="/organograma" className="org-button">Voltar ao organograma</Link></div>;
  const filtered = employees.filter(e => (!status || e.status === status) && (!department || e.department_id === department) && matchesEmployee(e, query, departments.find(d => d.id === e.department_id)?.name));
  return <div className="org-admin"><Link href="/organograma" className="org-back-link"><ArrowLeft size={15} />Voltar ao organograma</Link>
    <header className="org-header"><div><p className="org-eyebrow">ADMINISTRAÇÃO</p><h1>Gestão da organização</h1><p>Cuide das pessoas, equipes e relações de trabalho.</p></div><span className="org-admin-badge"><ShieldCheck size={16} />Acesso administrativo</span></header>
    <div className="org-admin-tabs org-tabs">{([{ id: 'employees', label: 'Colaboradores', icon: Users }, { id: 'departments', label: 'Departamentos', icon: Building2 }, { id: 'history', label: 'Histórico', icon: History }] as const).map(({ id, label, icon: Icon }) => <button key={id} aria-pressed={tab === id} onClick={() => setTab(id)}><Icon size={16} />{label}</button>)}</div>
    {notice && <div className="org-success" role="status"><Check size={16} />{notice}<button aria-label="Fechar aviso" onClick={() => setNotice('')}><X size={15} /></button></div>}
    {actionError && <p role="alert" className="org-error">{actionError}</p>}
    {tab === 'employees' && <section className="org-admin-panel"><div className="org-admin-tools"><div className="org-search"><Search size={17} /><input aria-label="Buscar colaboradores" placeholder="Buscar colaboradores…" value={query} onChange={e => setQuery(e.target.value)} /></div>
      <select aria-label="Situação dos colaboradores" className="org-input" value={status} onChange={e => setStatus(e.target.value)}><option value="active">Ativos</option><option value="inactive">Inativos</option><option value="">Todas as situações</option></select>
      <select aria-label="Departamento dos colaboradores" className="org-input" value={department} onChange={e => setDepartment(e.target.value)}><option value="">Todos os departamentos</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
      <button className="org-button org-primary" onClick={() => { setNotice(''); setEditor('new'); }}><Plus size={16} />Novo colaborador</button></div>
      <div className="org-table-wrap"><table className="org-table"><thead><tr><th>Colaborador</th><th>Departamento</th><th>Responde a</th><th>Situação</th><th><span className="org-sr-only">Ações</span></th></tr></thead><tbody>{filtered.map(e => <tr key={e.id}><td><div className="org-table-person"><EmployeeAvatar employee={e} size={38} /><span><strong>{e.name}{e.is_example && <small> · Exemplo</small>}</strong><small>{e.job_title}</small></span></div></td><td>{departments.find(d => d.id === e.department_id)?.name}</td><td>{employees.find(p => p.id === e.manager_id)?.name || '—'}</td><td><span className={`org-status ${e.status}`}>{e.status === 'active' ? 'Ativo' : 'Inativo'}</span></td><td><button className="org-button" aria-label={`Editar ${e.name}`} onClick={() => setEditor(e)}><Pencil size={14} /><span className="org-edit-label">Editar</span></button></td></tr>)}</tbody></table></div>
      {!filtered.length && <div className="org-empty">Nenhum colaborador encontrado.</div>}<footer className="org-table-footer">{filtered.length} de {employees.length} colaboradores</footer>
    </section>}
    {tab === 'departments' && <section className="org-admin-panel"><div className="org-panel-title"><div><h2>Departamentos</h2><p className="org-muted">Organize as áreas sem alterar a hierarquia de pessoas.</p></div><button className="org-button org-primary" onClick={() => setDeptEditor('new')}><Plus size={16} />Novo departamento</button></div><div className="org-department-list">{departments.map(d => {
      const count = employees.filter(e => e.department_id === d.id).length;
      return <div key={d.id}><span className="org-area-dot" style={{ background: d.color }} /><span><strong>{d.name}</strong><small>{count} colaboradores cadastrados</small></span><button className="org-button" onClick={() => setDeptEditor(d)} aria-label={`Editar departamento ${d.name}`}><Pencil size={14} />Editar</button><button className="org-text-link org-danger" disabled={!!count || busy} title={count ? 'Reatribua os colaboradores antes de excluir' : undefined} onClick={() => setRemoving(d.id)}>Excluir</button>{removing === d.id && <div className="org-delete-confirm"><span>Excluir {d.name}?</span><button className="org-button" disabled={busy} onClick={() => setRemoving(null)}>Cancelar</button><button className="org-button org-danger" disabled={busy} onClick={async () => { if (busy) return; setBusy(true); setActionError(''); try { await deleteDepartment(d.id); setRemoving(null); await saved(); } catch (err) { setActionError(organizationError(err)); } finally { setBusy(false); } }}>Confirmar exclusão</button></div>}</div>;
    })}</div></section>}
    {tab === 'history' && <HistoryView />}
    {editor && <EmployeeEditor employee={editor === 'new' ? undefined : editor} onClose={() => setEditor(null)} onSaved={(employee, photo) => { applyEmployee(employee, photo); void saved(); }} />}
    {deptEditor && <DepartmentEditor department={deptEditor === 'new' ? undefined : deptEditor} onClose={() => setDeptEditor(null)} onSaved={() => void saved()} />}
  </div>;
}
