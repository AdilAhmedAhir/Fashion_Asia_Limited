/**
 * @purpose The numbered layouts of the product preview pop-up (T-045), and the one the live site uses.
 * The client picks a number on the hidden samples page
 * (/product-preview-samples). To switch the live site, change
 * PRODUCT_PREVIEW_LAYOUT to that number: every product card uses it.
 *   1. A big photo with the thumbnails below it; the name and description
 *      beside it on wider screens, below it on phones.
 *   2. The thumbnails in a column beside the photo; the name and description
 *      to the side on wider screens, below on phones.
 *   3. One full-width photo with previous and next arrows and dots, then the
 *      name and description below.
 *   4. The name and description on top, then every photo in a scrolling grid.
 */
export type ProductPreviewLayout = 1 | 2 | 3 | 4;

/** Every numbered layout, in order, for the samples page. */
export const PRODUCT_PREVIEW_LAYOUTS: readonly ProductPreviewLayout[] = [1, 2, 3, 4];

/** The layout every product card's pop-up uses on the live site. */
export const PRODUCT_PREVIEW_LAYOUT: ProductPreviewLayout = 1;
