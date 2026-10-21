const TONES = {
  MACHINERY: 'bg-harvest-100 text-harvest-700',
  TOOLS: 'bg-soil-100 text-soil-700',
  IRRIGATION: 'bg-sky-100 text-sky-700',
  SEEDS: 'bg-leaf-100 text-leaf-700',
  FERTILIZERS: 'bg-lime-100 text-lime-700',
  PESTICIDES: 'bg-red-100 text-red-700',
  OTHER: 'bg-stone-100 text-stone-700',
}

export function categoryTone(category) {
  return TONES[category] || TONES.OTHER
}
