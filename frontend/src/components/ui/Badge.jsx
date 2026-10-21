const TONES = {
  neutral: 'bg-stone-100 text-stone-700 ring-stone-200',
  green: 'bg-leaf-100 text-leaf-800 ring-leaf-200',
  amber: 'bg-harvest-100 text-harvest-800 ring-harvest-200',
  blue: 'bg-sky-100 text-sky-800 ring-sky-200',
  red: 'bg-red-100 text-red-800 ring-red-200',
}

export default function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        TONES[tone] || TONES.neutral
      } ${className}`}
    >
      {children}
    </span>
  )
}
