import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import Button from '../ui/Button'

export default function SearchBar({
  initialQuery = '',
  onSubmit,
  placeholder = 'Search seeds, tools, irrigation equipment…',
  buttonLabel = 'Search',
  className = '',
  autoFocus = false,
}) {
  const [value, setValue] = useState(initialQuery)

  useEffect(() => {
    setValue(initialQuery)
  }, [initialQuery])

  const submit = (event) => {
    event.preventDefault()
    onSubmit?.(value.trim())
  }

  return (
    <form onSubmit={submit} className={`flex flex-col gap-2 sm:flex-row ${className}`} role="search">
      <label htmlFor="marketplace-search" className="sr-only">
        Search products
      </label>
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400"
          aria-hidden="true"
        />
        <input
          id="marketplace-search"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-4 text-sm text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/20"
        />
      </div>
      <Button type="submit" size="md" className="sm:px-6">
        {buttonLabel}
      </Button>
    </form>
  )
}
