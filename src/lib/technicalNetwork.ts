import { supabase } from './supabase';
import { Tecnico } from '@/types';
// Supabase limits each response. Paginate so growing networks are not silently truncated.
export async function loadTechnicalNetwork(activeOnly = false): Promise<Tecnico[]> {
  const rows: Tecnico[] = [];
  for (let start = 0; ; start += 500) {
    let query = supabase.from('tecnicos').select('*').order('id').range(start, start + 499);
    if (activeOnly) query = query.eq('is_active', true);
    const {data,error} = await query;
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < 500) return rows;
  }
}
