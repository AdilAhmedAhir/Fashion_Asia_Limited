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

// --- Pixel dimensions, read from the header (T-007) ----------------------
//
// The server re-checks MAX_UPLOAD_DIMENSION without decoding anything: the
// width and height come from the file's own header bytes, and anything that
// can't be read is refused (fail closed). These constants are format facts
// (ITU T.81 for JPEG, the RIFF/WebP container), not policy.
const JPEG_SOI = 0xd8;
const JPEG_EOI = 0xd9;
const JPEG_SOS = 0xda;
const JPEG_TEM = 0x01;
const JPEG_RST0 = 0xd0;
const JPEG_RST7 = 0xd7;
const JPEG_FRAME_HEADER_MIN_LENGTH = 8; // Lf (2) + P (1) + Y (2) + X (2) + Nf (1)
const WEBP_MIN_BYTES = 30; // RIFF header (12) + chunk header (8) + the 10 bytes the size lives in

type ImageDimensions = { width: number; height: number };

// SOF0 to SOF15 carry the frame header, except DHT (C4), JPG (C8) and DAC (CC).
function isJpegFrameHeader(marker: number): boolean {
    return marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
}

function readJpegDimensions(bytes: Uint8Array): ImageDimensions | null {
    const end = bytes.length;
    if (end < 2 || bytes[0] !== 0xff || bytes[1] !== JPEG_SOI) return null;
    let i = 2;
    while (i < end) {
        // Find the next marker the way libjpeg does: skip any stray bytes up
        // to an 0xFF, then any fill 0xFFs. FF 00 is a stuffed byte, skipped
        // like a stray one.
        while (i < end && bytes[i] !== 0xff) i++;
        while (i < end && bytes[i] === 0xff) i++;
        if (i >= end) return null;
        const marker = bytes[i++];
        if (marker === 0x00) continue;
        // RST0 to RST7 and TEM stand alone, with no length.
        if (marker === JPEG_TEM || (marker >= JPEG_RST0 && marker <= JPEG_RST7)) continue;
        // A scan, the end, or a second start before any frame header.
        if (marker === JPEG_SOS || marker === JPEG_EOI || marker === JPEG_SOI) return null;
        if (i + 2 > end) return null;
        const length = (bytes[i] << 8) | bytes[i + 1];
        if (length < 2 || i + length > end) return null;
        if (isJpegFrameHeader(marker)) {
            if (length < JPEG_FRAME_HEADER_MIN_LENGTH) return null;
            const height = (bytes[i + 3] << 8) | bytes[i + 4];
            const width = (bytes[i + 5] << 8) | bytes[i + 6];
            // A height of 0 means it's defined later by DNL: unreadable here.
            return width > 0 && height > 0 ? { width, height } : null;
        }
        // Every other segment, APP1/EXIF and its thumbnail included, is
        // skipped whole by its length. Never byte-scan for FF C0: an EXIF
        // thumbnail's frame header comes first.
        i += length;
    }
    return null;
}

function readWebpDimensions(bytes: Uint8Array): ImageDimensions | null {
    if (bytes.length < WEBP_MIN_BYTES) return null;
    const ascii = (offset: number) =>
        String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
    if (ascii(0) !== "RIFF" || ascii(8) !== "WEBP") return null;
    let width: number;
    let height: number;
    const chunk = ascii(12);
    if (chunk === "VP8 ") {
        // Lossy: the key frame's start code, then 14-bit width and height.
        if (bytes[23] !== 0x9d || bytes[24] !== 0x01 || bytes[25] !== 0x2a) return null;
        width = (bytes[26] | (bytes[27] << 8)) & 0x3fff;
        height = (bytes[28] | (bytes[29] << 8)) & 0x3fff;
    } else if (chunk === "VP8L") {
        // Lossless: the signature byte, then width - 1 and height - 1 in
        // bits 0-13 and 14-27 of the next 32 bits.
        if (bytes[20] !== 0x2f) return null;
        width = 1 + (bytes[21] | ((bytes[22] & 0x3f) << 8));
        height = 1 + ((bytes[22] >> 6) | (bytes[23] << 2) | ((bytes[24] & 0x0f) << 10));
    } else if (chunk === "VP8X") {
        // Extended: the canvas, width - 1 and height - 1 as 24-bit values.
        width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
        height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
    } else {
        return null;
    }
    return width > 0 && height > 0 ? { width, height } : null;
}

/**
 * @purpose An image's pixel width and height, read from its JPEG or WebP header without decoding it, so the server can re-check the longest-edge limit; null when they can't be read.
 * Pure: bounds-checked before every read, never throws, never decodes.
 * MAX_UPLOAD_BYTES has already bounded the walk by the time it's called.
 */
export function readImageDimensions(bytes: Uint8Array, format: "jpeg" | "webp"): ImageDimensions | null {
    if (format === "jpeg") return readJpegDimensions(bytes);
    if (format === "webp") return readWebpDimensions(bytes);
    return null;
}

/**
 * @purpose The one message for an image whose longest edge is over MAX_UPLOAD_DIMENSION, shared by the browser's check and the server's so both refuse in the same words.
 */
export function describeDimensionLimit(width: number, height: number): string {
    return `That image is ${width}×${height}. Resize it to ${MAX_UPLOAD_DIMENSION}px on the longest edge or smaller.`;
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
