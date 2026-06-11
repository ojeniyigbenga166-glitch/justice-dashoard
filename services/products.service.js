import supabase from '@/lib/supabase';

const TABLE = 'products';

/**
 * Fetch all products, optionally filtered and sorted.
 * @param {object} options
 * @param {string} [options.category] - Filter by category
 * @param {string} [options.search] - Search by name
 * @param {number} [options.limit] - Limit results
 * @param {number} [options.offset] - Offset for pagination
 * @returns {Promise<{data: Array, error: Error|null, count: number}>}
 */
export async function getProducts({ category, search, limit = 50, offset = 0 } = {}) {
  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error, count } = await query;
  return { data, error, count };
}

/**
 * Fetch a single product by ID.
 * @param {string} id
 * @returns {Promise<{data: object, error: Error|null}>}
 */
export async function getProductById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

/**
 * Create a new product.
 * @param {object} product
 * @returns {Promise<{data: object, error: Error|null}>}
 */
export async function createProduct(product) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([product])
    .select()
    .single();
  return { data, error };
}

/**
 * Update an existing product.
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<{data: object, error: Error|null}>}
 */
export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

/**
 * Delete a product by ID.
 * @param {string} id
 * @returns {Promise<{error: Error|null}>}
 */
export async function deleteProduct(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  return { error };
}
