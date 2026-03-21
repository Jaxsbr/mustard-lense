import './components.css'

export function FallbackComponent({ type }: { type: string }) {
  return (
    <div className="lense-card lense-card--fallback">
      <p className="lense-text-muted">Unknown component type: {type}</p>
    </div>
  )
}
