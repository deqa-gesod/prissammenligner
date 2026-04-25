// Skjelett-placeholder mens data hentes fra DB.
// Implementeres i Fase 7.
function LoadingSkeleton() {
  return (
    <div className="rounded-xl border border-rose-mist bg-blush-50 p-6 animate-pulse">
      <div className="h-4 w-3/4 bg-rose-mist rounded mb-2" />
      <div className="h-3 w-1/2 bg-rose-mist/70 rounded" />
      <div className="mt-4 space-y-2">
        <div className="h-4 bg-rose-mist/60 rounded" />
        <div className="h-4 bg-rose-mist/60 rounded" />
      </div>
    </div>
  )
}

export default LoadingSkeleton
