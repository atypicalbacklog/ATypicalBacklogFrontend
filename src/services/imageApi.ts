/**
 * Get image URL for a given image UID.
 * @param imageUid Image UID (can be null)
 * @param thumbnail If true, requests thumbnail; if false, requests original
 * @returns Image URL or null if imageUid is null
 */
export function getImageUrl(
  imageUid: string | null,
  thumbnail: boolean
): string | null {
  if (!imageUid) return null;
  return `/api/images/${imageUid}?thumbnail=${thumbnail}`;
}
