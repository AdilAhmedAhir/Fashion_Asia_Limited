import { Fragment } from "react";

// Renders **bold** spans inside otherwise plain copy. Deliberately not a
// markdown parser — the CMS stores plain strings and this is the only
// formatting the editors need, so splitting on the marker keeps it safe
// (no dangerouslySetInnerHTML) and predictable. An unmatched marker is left
// as literal text rather than swallowing the rest of the paragraph.
export function RichText({ text }: { text: string }) {
    const segments = text.split("**");

    // An even number of markers yields an odd segment count; anything else
    // means the copy has a stray marker, so render it verbatim.
    if (segments.length % 2 === 0) return <>{text}</>;

    return (
        <>
            {segments.map((segment, i) =>
                i % 2 === 1 ? (
                    <strong key={i} className="font-semibold text-white">{segment}</strong>
                ) : (
                    <Fragment key={i}>{segment}</Fragment>
                )
            )}
        </>
    );
}
