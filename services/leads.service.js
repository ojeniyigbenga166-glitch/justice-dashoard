import supabase from '@/lib/supabase';

const TABLE = 'leads';

/**
 * Fetch all leads.
 * @param {object} options
 * @param {string} [options.status] - Filter by status (new|contacted|qualified|lost)
 * @param {string} [options.search] - Search by name or email
 * @param {number} [options.limit]
 * @param {number} [options.offset]
 * @returns {Promise<{data: Array, error: Error|null, count: number}>}
 */
export async function getLeads({ status, search, limit = 50, offset = 0 } = {}) {
  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error, count } = await query;
  return { data, error, count };
}

/**
 * Fetch a single lead by ID.
 * @param {string} id
 * @returns {Promise<{data: object, error: Error|null}>}
 */
export async function getLeadById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

/**
 * Create a new lead.
 * @param {object} lead
 * @returns {Promise<{data: object, error: Error|null}>}
 */
export async function createLead(lead) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([lead])
    .select()
    .single();
  return { data, error };
}

/**
 * Update a lead.
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<{data: object, error: Error|null}>}
 */
export async function updateLead(id, updates) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

/**
 * Delete a lead by ID.
 * @param {string} id
 * @returns {Promise<{error: Error|null}>}
 */
export async function deleteLead(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  return { error };
}
