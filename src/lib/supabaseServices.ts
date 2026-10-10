import { supabase } from './supabase';
import { Opportunity, Commission, QuoteTemplate } from '@/types';

// --- OPPORTUNITIES ---

export async function fetchOpportunities(userId: string): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Opportunity[];
}

export async function createOpportunity(opp: Omit<Opportunity, 'id'>): Promise<Opportunity | null> {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .insert([opp])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating opportunity in Supabase:', error.message);
      return null;
    }

    return data as Opportunity;
  } catch (err) {
    return null;
  }
}

export async function updateOpportunity(id: string, updated: Partial<Opportunity>): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .update(updated)
      .eq('id', id)
      .select('id')
      .single();

    return !error && !!data;
  } catch (err) {
    return false;
  }
}

export async function deleteOpportunity(id: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', id)
      .select('id')
      .single();

    return !error && !!data;
  } catch (err) {
    return false;
  }
}

// --- COMMISSIONS ---

export async function fetchCommissions(userId: string): Promise<Commission[]> {
  const { data, error } = await supabase
    .from('commissions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Commission[];
}

export async function createCommission(comm: Omit<Commission, 'id'>): Promise<Commission | null> {
  try {
    const { data, error } = await supabase
      .from('commissions')
      .insert([comm])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating commission in Supabase:', error.message);
      return null;
    }

    return data as Commission;
  } catch (err) {
    return null;
  }
}

export async function updateCommission(id: string, updated: Partial<Commission>): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('commissions')
      .update(updated)
      .eq('id', id)
      .select('id')
      .single();

    return !error && !!data;
  } catch (err) {
    return false;
  }
}

export async function deleteCommission(id: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('commissions')
      .delete()
      .eq('id', id)
      .select('id')
      .single();

    return !error && !!data;
  } catch (err) {
    return false;
  }
}

// --- SELLERS ---

export async function fetchSellers(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('sellers')
    .select('name')
    .eq('user_id', userId);
  if (error) throw error;
  return Array.from(new Set((data ?? []).map((seller) => seller.name as string))).sort();
}

export async function createSeller(userId: string, name: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('sellers')
      .insert([{ user_id: userId, name: name.trim() }])
      .select('id')
      .single();

    return !error && !!data;
  } catch (err) {
    return false;
  }
}

// --- QUOTE TEMPLATES ---

export async function fetchQuoteTemplates(userId: string): Promise<QuoteTemplate[]> {
  const { data, error } = await supabase
    .from('quote_templates')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []) as QuoteTemplate[];
}

export async function createQuoteTemplate(template: Omit<QuoteTemplate, 'id'>): Promise<QuoteTemplate | null> {
  try {
    const { data, error } = await supabase
      .from('quote_templates')
      .insert([template])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating quote template in Supabase:', error.message);
      return null;
    }

    return data as QuoteTemplate;
  } catch (err) {
    return null;
  }
}

export async function updateQuoteTemplate(id: string, updated: Partial<QuoteTemplate>): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('quote_templates')
      .update(updated)
      .eq('id', id)
      .select('id')
      .single();

    return !error && !!data;
  } catch (err) {
    return false;
  }
}

export async function deleteQuoteTemplate(id: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('quote_templates')
      .delete()
      .eq('id', id)
      .select('id')
      .single();

    return !error && !!data;
  } catch (err) {
    return false;
  }
}
