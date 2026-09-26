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

// --- Recommended size (soft guidance — never blocks an upload) -----------
//
// `ImageUploadField` is shared by three surfaces: `/what-we-do` category
// cards, the homepage "Life at Fashion Asia" facility photos, and (T-004)
// per-category products. One shared target covers all three rather than a
// per-instance override:
//
//   - Facility photos (`MediaPreviewSection`) render inside a fixed
//     `aspect-[4/3]` box — 4:3 landscape is the literal displayed shape.
//   - Category/product cards (`/what-we-do`'s grid, and T-004's product
//     cards, which reuse the same visual language) use a fixed CARD HEIGHT
//     with a flexible width capped by this project's 1400px container. At
//     the widest real layout (a 4-column row against that cap) a card lands
//     ~300px wide x ~224px tall — ~4:3 as well. Narrower breakpoints get a
//     moderate `object-cover` crop either way, which is expected for a
//     background-style photo, not a defect.
//
// Neither context ever renders a card image above roughly 640 CSS px wide
// on desktop (see the file header above) — but the governing case is
// actually mobile: the facility grid drops to ONE full-width column below
// the `sm` breakpoint, so on a ~430px-wide, 3x-density phone screen a single
// card already needs ~1150 real device pixels to stay sharp. 1200x900
// clears that with a small margin, stays a comfortable 2x below the
// existing MAX_UPLOAD_DIMENSION hard cap (2400px), and a properly
// TinyPNG-optimised photo at this resolution normally lands well under the
// 400 KB hard cap too — the recommendation is achievable, not a trap.
export const RECOMMENDED_UPLOAD_WIDTH = 1200; // px
export const RECOMMENDED_UPLOAD_HEIGHT = 900; // px — 1200x900 = 4:3 landscape

// "Off-proportion" tolerance around that 4:3 target, expressed as a shape
// range rather than a fixed percentage so it reads directly as a shape:
// anything from square (1:1) to a wide 2:1 landscape passes without a
// warning, since both display contexts above already tolerate that much
// variation via `object-cover`. Outside that range is either a genuinely
// portrait photo (badly crops the sides in a 4:3-ish box) or an extreme
// panorama crop (badly crops the top/bottom) — worth flagging either way.
export const MIN_RECOMMENDED_ASPECT_RATIO = 1; // 1:1 — square
export const MAX_RECOMMENDED_ASPECT_RATIO = 2; // 2:1 — wide panorama

export interface ImageSizeAdvisory {
    tooSmall: boolean;
    offProportion: boolean;
}

/**
 * Non-blocking advisory only — the hard limits above (format, bytes, max
 * dimension) already ran and passed by the time this is called. Both flags
 * can be true at once (e.g. a small portrait screenshot); the caller decides
 * how to word a combined warning.
 */
export function checkImageSizeAdvisory(width: number, height: number): ImageSizeAdvisory {
    const tooSmall = width < RECOMMENDED_UPLOAD_WIDTH || height < RECOMMENDED_UPLOAD_HEIGHT;
    const ratio = width / height;
    const offProportion = ratio < MIN_RECOMMENDED_ASPECT_RATIO || ratio > MAX_RECOMMENDED_ASPECT_RATIO;
    return { tooSmall, offProportion };
}
