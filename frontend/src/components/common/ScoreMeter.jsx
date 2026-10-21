export default function ScoreMeter({ score, threshold = 30, label = 'Demand gap score' }) {
  const bounded = Math.max(0, Math.min(100, Number(score) || 0))
  const tone = bounded >= 60 ? 'bg-leaf-600' : bounded >= threshold ? 'bg-harvest-500' : 'bg-stone-400'

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-stone-500">{label}</span>
        <span className="text-sm font-bold text-stone-900">
          {bounded}
          <span className="text-xs font-normal text-stone-500">/100</span>
        </span>
      </div>
      <div
        className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-stone-200"
        role="meter"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={bounded}
        aria-label={label}
      >
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${bounded}%` }} />
      </div>
      <p className="mt-1 text-[11px] text-stone-500">Qualifies at {threshold}+</p>
    </div>
  )
}
