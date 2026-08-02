import { supabase } from './supabase';
import { Opportunity, Commission, QuoteTemplate } from '@/types';
import { INITIAL_OPPORTUNITIES, INITIAL_COMMISSIONS, INITIAL_SELLERS, INITIAL_TEMPLATES } from './mockData';

// --- OPPORTUNITIES ---

export async function fetchOpportunities(userId: string): Promise<Opportunity[]> {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Supabase fetchOpportunities notice:', error?.message);
      return INITIAL_OPPORTUNITIES;
    }

    return data as Opportunity[];
  } catch (err) {
    return INITIAL_OPPORTUNITIES;
  }
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
    const { error } = await supabase
      .from('opportunities')
      .update(updated)
      .eq('id', id);

    return !error;
  } catch (err) {
    return false;
  }
}

export async function deleteOpportunity(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', id);

    return !error;
  } catch (err) {
    return false;
  }
}

// --- COMMISSIONS ---

export async function fetchCommissions(userId: string): Promise<Commission[]> {
  try {
    const { data, error } = await supabase
      .from('commissions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Supabase fetchCommissions notice:', error?.message);
      return INITIAL_COMMISSIONS;
    }

    return data as Commission[];
  } catch (err) {
    return INITIAL_COMMISSIONS;
  }
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
    const { error } = await supabase
      .from('commissions')
      .update(updated)
      .eq('id', id);

    return !error;
  } catch (err) {
    return false;
  }
}

export async function deleteCommission(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('commissions')
      .delete()
      .eq('id', id);

    return !error;
  } catch (err) {
    return false;
  }
}

// --- SELLERS ---

export async function fetchSellers(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('sellers')
      .select('name')
      .eq('user_id', userId);

    if (error || !data || data.length === 0) {
      return [];
    }

    const fetchedNames = data.map((s) => s.name);
    return Array.from(new Set(fetchedNames)).sort();
  } catch (err) {
    return [];
  }
}

export async function createSeller(userId: string, name: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('sellers')
      .insert([{ user_id: userId, name: name.trim() }]);

    return !error;
  } catch (err) {
    return false;
  }
}

// --- QUOTE TEMPLATES ---

export async function fetchQuoteTemplates(userId: string): Promise<QuoteTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('quote_templates')
      .select('*')
      .eq('user_id', userId);

    if (error || !data) {
      return INITIAL_TEMPLATES;
    }

    return data as QuoteTemplate[];
  } catch (err) {
    return INITIAL_TEMPLATES;
  }
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
