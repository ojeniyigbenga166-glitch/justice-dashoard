import supabase from '@/lib/supabase';

const TABLE = 'projects';

/**
 * Fetch all projects.
 * @param {object} options
 * @param {string} [options.status] - Filter by status
 * @param {string} [options.search] - Search by name
 * @param {number} [options.limit]
 * @param {number} [options.offset]
 * @returns {Promise<{data: Array, error: Error|null, count: number}>}
 */
export async function getProjects({ status, search, limit = 50, offset = 0 } = {}) {
  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error, count } = await query;
  return { data, error, count };
}

/**
 * Fetch a single project by ID.
 * @param {string} id
 * @returns {Promise<{data: object, error: Error|null}>}
 */
export async function getProjectById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

/**
 * Create a new project.
 * @param {object} project
 * @returns {Promise<{data: object, error: Error|null}>}
 */
export async function createProject(project) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([project])
    .select()
    .single();
  return { data, error };
}

/**
 * Update a project.
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<{data: object, error: Error|null}>}
 */
export async function updateProject(id, updates) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

/**
 * Delete a project by ID.
 * @param {string} id
 * @returns {Promise<{error: Error|null}>}
 */
export async function deleteProject(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  return { error };
}
