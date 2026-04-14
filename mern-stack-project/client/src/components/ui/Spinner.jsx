function Spinner({ size = 'md', className = '' }) {
  const sizeClass = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-[3px]',
  }[size];

  return (
    <span
      className={`inline-block animate-spin rounded-full border-slate-300 border-t-slate-900 ${sizeClass} ${className}`}
      aria-label="Loading"
    />
  );
}

export default Spinner;