const controlClasses =
  'w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/20 disabled:bg-stone-100'

export function FormField({ label, htmlFor, error, hint, required, children, className = '' }) {
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-stone-800">
          {label}
          {required ? <span className="ml-0.5 text-red-600">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="mt-1 text-xs font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-stone-500">{hint}</p>
      ) : null}
    </div>
  )
}

export function TextInput({ className = '', invalid = false, ...props }) {
  return (
    <input
      className={`${controlClasses} ${invalid ? 'border-red-500' : ''} ${className}`}
      aria-invalid={invalid || undefined}
      {...props}
    />
  )
}

export function SelectInput({ className = '', invalid = false, children, ...props }) {
  return (
    <select
      className={`${controlClasses} ${invalid ? 'border-red-500' : ''} ${className}`}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {children}
    </select>
  )
}

export function TextArea({ className = '', invalid = false, rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`${controlClasses} ${invalid ? 'border-red-500' : ''} ${className}`}
      aria-invalid={invalid || undefined}
      {...props}
    />
  )
}

export function CheckboxField({ label, description, className = '', ...props }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 p-3 hover:bg-stone-50 ${className}`}>
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border-stone-300 text-leaf-700 focus:ring-leaf-600"
        {...props}
      />
      <span>
        <span className="block text-sm font-medium text-stone-800">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-stone-500">{description}</span> : null}
      </span>
    </label>
  )
}

export function CheckboxGroup({ legend, options, values, onChange }) {
  const toggle = (value) => {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value))
    } else {
      onChange([...values, value])
    }
  }

  return (
    <fieldset>
      <legend className="mb-2 block text-sm font-medium text-stone-800">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-stone-200 px-3 py-2 text-sm hover:bg-stone-50"
          >
            <input
              type="checkbox"
              checked={values.includes(option.value)}
              onChange={() => toggle(option.value)}
              className="h-4 w-4 rounded border-stone-300 text-leaf-700 focus:ring-leaf-600"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
