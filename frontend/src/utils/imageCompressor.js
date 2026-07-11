/**
 * Utility to compress and resize images client-side.
 * This is crucial to prevent "413 Payload Too Large" errors on hostings like Vercel (4.5MB limit)
 * and to keep database document sizes within limits since the images are stored as base64 in MongoDB.
 * 
 * @param {File} file - The original File object from file input
 * @param {Object} options - Configuration for resizing/compression
 * @param {number} options.maxWidth - Max width in pixels (aspect ratio preserved)
 * @param {number} options.maxHeight - Max height in pixels (aspect ratio preserved)
 * @param {number} options.quality - JPEG quality (0 to 1)
 * @param {number} options.maxSizeKB - Files below this size in KB are skipped (saved as-is)
 * @returns {Promise<File>} A promise resolving to the compressed File object (or original if not compressed)
 */
export const compressImage = (file, { maxWidth = 1200, maxHeight = 1200, quality = 0.75, maxSizeKB = 500 } = {}) => {
  return new Promise((resolve) => {
    // Return early if not a file or not an image
    if (!file || !file.type || !file.type.startsWith('image/')) {
      return resolve(file);
    }

    // Skip compression if the image is already small (e.g. less than maxSizeKB)
    if (file.size < maxSizeKB * 1024) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Preserve aspect ratio while ensuring max dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert PNG/BMP to JPEG for much better compression
        let mimeType = file.type;
        let extension = file.name.split('.').pop();
        
        if (mimeType === 'image/png' || mimeType === 'image/bmp') {
          mimeType = 'image/jpeg';
          extension = 'jpg';
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file); // Fallback to original
            }

            // Create new file with similar name and correct extension/mime-type
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const newName = `${baseName}_compressed.${extension}`;
            
            const compressedFile = new File([blob], newName, {
              type: mimeType,
              lastModified: Date.now(),
            });

            // If by some chance the compressed file is larger than the original, return original
            if (compressedFile.size >= file.size) {
              return resolve(file);
            }

            resolve(compressedFile);
          },
          mimeType,
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = event.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};
