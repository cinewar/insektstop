const LEGACY_R2_PUBLIC_HOST = 'pub-596a53037a844729b37afdf04e555d95.r2.dev';
const PRIMARY_R2_PUBLIC_HOST = 'images.gettogethertr.com';

/**
  * Describes behavior for normalizeImageUrl.
  * Usage: Call normalizeImageUrl(...) where this declaration is needed in the current module flow.
  */
export function normalizeImageUrl(imageUrl: string): string {
  if (!imageUrl) {
    return imageUrl;
  }

  try {
    const parsed = new URL(imageUrl);

    if (parsed.hostname === LEGACY_R2_PUBLIC_HOST) {
      parsed.hostname = PRIMARY_R2_PUBLIC_HOST;
    }

    return parsed.toString();
  } catch {
    return imageUrl;
  }
}
