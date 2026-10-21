export default function Card({ children, className = '', as = 'div', ...props }) {
  const Component = as
  return (
    <Component
      className={`rounded-2xl border border-stone-200/80 bg-white shadow-sm ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}
