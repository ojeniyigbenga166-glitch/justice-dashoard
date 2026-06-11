import supabase from '@/lib/supabase';

/**
 * Upload a file to Supabase Storage.
 * @param {File} file - The file to upload
 * @param {string} bucket - Storage bucket name ('product-images' | 'project-images')
 * @param {string} [folder] - Optional subfolder path
 * @returns {Promise<{url: string|null, path: string|null, error: Error|null}>}
 */
export async function uploadFile(file, bucket, folder = '') {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    return { url: null, path: null, error };
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return { url: publicUrl, path: data.path, error: null };
}

/**
 * Delete a file from Supabase Storage.
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path in the bucket
 * @returns {Promise<{error: Error|null}>}
 */
export async function deleteFile(bucket, path) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return { error };
}

/**
 * Get a public URL for a stored file.
 * @param {string} bucket
 * @param {string} path
 * @returns {string}
 */
export function getPublicUrl(bucket, path) {
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}

/**
 * Upload a product image.
 * @param {File} file
 * @returns {Promise<{url: string|null, path: string|null, error: Error|null}>}
 */
export async function uploadProductImage(file) {
  return uploadFile(file, 'product-images', 'products');
}

/**
 * Upload a project image.
 * @param {File} file
 * @returns {Promise<{url: string|null, path: string|null, error: Error|null}>}
 */
export async function uploadProjectImage(file) {
  return uploadFile(file, 'project-images', 'projects');
}
