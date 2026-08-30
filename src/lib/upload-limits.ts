// Shared between the upload form and the server action that receives it, so the
// rule the client is shown is the same rule the server enforces.
//
// Nothing is re-encoded on the server: the brief is to accept only files that
// are ALREADY optimised and to send anyone else to TinyPNG. So these limits are
// the whole quality gate, and they are deliberately tight — a card image is
// never displayed above ~640px wide on the site.

export const MAX_UPLOAD_BYTES = 400 * 1024;          // 400 KB
export const MAX_UPLOAD_DIMENSION = 2400;            // px, longest edge
export const TINYPNG_URL = "https://tinypng.com/";

/** Extensions offered in the file picker and accepted on submit. */
export const ALLOWED_EXTENSIONS = ["webp", "jpg", "jpeg"] as const;

/** `accept` attribute for <input type="file">. */
export const UPLOAD_ACCEPT = "image/webp,image/jpeg,.webp,.jpg,.jpeg";

export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

/**
 * Sniff the real format from the file's leading bytes.
 *
 * The extension and the browser-reported MIME type are both attacker-controlled
 * — renaming anything to .webp satisfies them — so the server decides from the
 * actual header. Returns null when the bytes are neither WebP nor JPEG.
 */
export function sniffImageFormat(bytes: Uint8Array): "webp" | "jpeg" | null {
    // JPEG: FF D8 FF
    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
        return "jpeg";
    }
    // WebP: "RIFF" .... "WEBP"
    if (bytes.length >= 12) {
        const ascii = (o: number, n: number) =>
            String.fromCharCode(...bytes.subarray(o, o + n));
        if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return "webp";
    }
    return null;
}
