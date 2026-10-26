import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { Style } from "@/lib/styles";

// Plays a style's demo film, streamed from the lemo-opuscar GitHub release.
export default function PreviewDialog({ style, onClose }: { style: Style | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (style && !dlg.open) dlg.showModal();
    if (!style && dlg.open) dlg.close();
  }, [style]);

  return (
    <dialog
      ref={ref}
      className="preview-dialog"
      aria-labelledby="preview-title"
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
    >
      {style && (
        <>
          <div className="preview-head">
            <div>
              <span className="eyebrow">{style.categoryLabel}</span>
              <h3 id="preview-title">{style.name}{style.film ? ` · ${style.film}` : ""}</h3>
            </div>
            <button className="icon-btn" type="button" aria-label="Close preview" onClick={onClose}>✕</button>
          </div>
          <div className="preview-video">
            <video key={style.slug} controls autoPlay playsInline preload="metadata" poster={style.image ?? undefined} src={style.video} />
          </div>
          <div className="preview-foot">
            <p>{style.line}</p>
            <Link className="btn btn-ghost btn-sm" to={`/styles/${style.slug}`} onClick={onClose}>Open style</Link>
          </div>
        </>
      )}
    </dialog>
  );
}
