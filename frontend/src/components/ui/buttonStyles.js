const VARIANTS = {
  primary:
    'bg-leaf-700 text-white hover:bg-leaf-800 focus-visible:outline-leaf-700 disabled:bg-leaf-700/50',
  secondary:
    'bg-white text-leaf-800 ring-1 ring-inset ring-stone-300 hover:bg-leaf-50 focus-visible:outline-leaf-700',
  ghost: 'bg-transparent text-stone-700 hover:bg-stone-100 focus-visible:outline-leaf-700',
  danger:
    'bg-red-700 text-white hover:bg-red-800 focus-visible:outline-red-700 disabled:bg-red-700/50',
  harvest:
    'bg-harvest-500 text-white hover:bg-harvest-600 focus-visible:outline-harvest-600 disabled:bg-harvest-500/50',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-5 py-3 text-base gap-2',
}

export function buttonClasses({ variant = 'primary', size = 'md', className = '' } = {}) {
  return [
    'inline-flex items-center justify-center rounded-xl font-semibold transition',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:cursor-not-allowed',
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    className,
  ]
    .filter(Boolean)
    .join(' ')
}
