// Dusty peach badge for kampanjer/tilbud.
// Implementeres i Fase 7.
function CampaignBadge({ discount_percent, text }) {
  return (
    <span className="rounded-full bg-peach-soft/60 text-ink text-xs uppercase tracking-wide px-3 py-1">
      TODO: {text || `-${discount_percent}%`}
    </span>
  )
}

export default CampaignBadge
