import { Bug, Droplets, FlaskConical, Package, Sprout, Tractor, Wrench } from 'lucide-react'

const ICONS = {
  MACHINERY: Tractor,
  TOOLS: Wrench,
  IRRIGATION: Droplets,
  SEEDS: Sprout,
  FERTILIZERS: FlaskConical,
  PESTICIDES: Bug,
  OTHER: Package,
}

export default function CategoryIcon({ category, className = 'h-5 w-5' }) {
  const Icon = ICONS[category] || Package
  return <Icon className={className} aria-hidden="true" />
}
