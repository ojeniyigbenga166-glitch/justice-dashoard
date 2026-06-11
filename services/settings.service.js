import supabase from '@/lib/supabase';

const TABLE = 'settings';

/**
 * Fetch all settings (key-value pairs).
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function getSettings() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('key', { ascending: true });
  return { data, error };
}

/**
 * Fetch a single setting by key.
 * @param {string} key
 * @returns {Promise<{data: object, error: Error|null}>}
 */
export async function getSettingByKey(key) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('key', key)
    .single();
  return { data, error };
}

/**
 * Create a new setting.
 * @param {object} setting - { key, value, description? }
 * @returns {Promise<{data: object, error: Error|null}>}
 */
export async function createSetting(setting) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([setting])
    .select()
    .single();
  return { data, error };
}

/**
 * Update a setting by key.
 * @param {string} key
 * @param {any} value
 * @returns {Promise<{data: object, error: Error|null}>}
 */
export async function updateSetting(key, value) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key)
    .select()
    .single();
  return { data, error };
}

/**
 * Upsert (create or update) a setting by key.
 * @param {string} key
 * @param {any} value
 * @param {string} [description]
 * @returns {Promise<{data: object, error: Error|null}>}
 */
export async function upsertSetting(key, value, description) {
  const { data, error } = await supabase
    .from(TABLE)
    .upsert({ key, value, description, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    .select()
    .single();
  return { data, error };
}

/**
 * Delete a setting by key.
 * @param {string} key
 * @returns {Promise<{error: Error|null}>}
 */
export async function deleteSetting(key) {
  const { error } = await supabase.from(TABLE).delete().eq('key', key);
  return { error };
}
