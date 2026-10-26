import { Link } from "react-router-dom";
import { formatDuration, type Style } from "@/lib/styles";

export default function StyleCard({ style, onPreview }: { style: Style; onPreview: (s: Style) => void }) {
  return (
    <article className="style-card" id={`style-${style.slug}`}>
      <button className="thumb" type="button" aria-label={`Watch the ${style.name} demo film`} onClick={() => onPreview(style)}>
        {style.image && <img src={style.image} alt="" loading="lazy" decoding="async" width={640} height={360} />}
        <span className="fmt">No. {style.number}</span>
        {style.duration ? <span className="dur">{formatDuration(style.duration)}</span> : null}
        <span className="play-sm" aria-hidden="true">▶</span>
      </button>
      <div className="style-body">
        <span className="style-cat">{style.categoryLabel}</span>
        <h3><Link to={`/styles/${style.slug}`}>{style.name}</Link></h3>
        {style.film && <p className="style-film">Demo: {style.film}</p>}
        <p>{style.line}</p>
        <div className="style-meta">
          {style.uses.slice(0, 3).map((u) => <span className="tag" key={u}>{u}</span>)}
        </div>
      </div>
    </article>
  );
}
