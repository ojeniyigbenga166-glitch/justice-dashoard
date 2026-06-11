import supabase from '@/lib/supabase';

const TABLE = 'orders';

/**
 * Fetch all orders.
 * @param {object} options
 * @param {string} [options.status] - Filter by status (pending|confirmed|shipped|delivered|cancelled)
 * @param {string} [options.search] - Search by customer name or order ID
 * @param {number} [options.limit]
 * @param {number} [options.offset]
 * @returns {Promise<{data: Array, error: Error|null, count: number}>}
 */
export async function getOrders({ status, search, limit = 50, offset = 0 } = {}) {
  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);
  }

  const { data, error, count } = await query;
  return { data, error, count };
}

/**
 * Fetch a single order by ID.
 * @param {string} id
 * @returns {Promise<{data: object, error: Error|null}>}
 */
export async function getOrderById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

/**
 * Create a new order.
 * @param {object} order
 * @returns {Promise<{data: object, error: Error|null}>}
 */
export async function createOrder(order) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([order])
    .select()
    .single();
  return { data, error };
}

/**
 * Update an order (e.g. change status).
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<{data: object, error: Error|null}>}
 */
export async function updateOrder(id, updates) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

/**
 * Delete an order by ID.
 * @param {string} id
 * @returns {Promise<{error: Error|null}>}
 */
export async function deleteOrder(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  return { error };
}
