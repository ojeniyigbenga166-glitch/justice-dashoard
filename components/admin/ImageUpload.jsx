'use client';

import { useState, useRef, useEffect } from 'react';
import { uploadProductImage, uploadProjectImage } from '@/utils/storage';
import toast from 'react-hot-toast';

/**
 * ImageUpload — reusable file upload component for images.
 * @param {object} props
 * @param {'product' | 'project'} props.type - Which bucket to upload to
 * @param {Function} props.onUpload - Called with { url, path } on success
 * @param {string} [props.currentUrl] - Existing image URL to preview
 */
export default function ImageUpload({ type = 'product', onUpload, currentUrl }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || null);
  const inputRef = useRef(null);

  // Sync preview when currentUrl prop changes (e.g. switching between edit items)
  useEffect(() => {
    setPreview(currentUrl || null);
  }, [currentUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, WebP, or GIF image.');
      return;
    }

    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${maxSizeMB}MB.`);
      return;
    }

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setUploading(true);
    try {
      const uploadFn = type === 'project' ? uploadProjectImage : uploadProductImage;
      const { url, path, error } = await uploadFn(file);

      if (error) throw error;

      toast.success('Image uploaded successfully.');
      onUpload?.({ url, path });
    } catch (err) {
      toast.error(err.message || 'Upload failed. Please try again.');
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {preview && (
        <div style={{ marginBottom: '0.5rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        disabled={uploading}
        id={`image-upload-${type}`}
        style={{ display: 'none' }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{ cursor: uploading ? 'not-allowed' : 'pointer', padding: '0.5rem 1rem' }}
      >
        {uploading ? 'Uploading…' : preview ? 'Change Image' : 'Upload Image'}
      </button>
    </div>
  );
}
