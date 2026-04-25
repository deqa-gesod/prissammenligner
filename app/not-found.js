import NotFoundView from "./mockup/NotFoundView"

// Ekte 404-side. Vises automatisk av Next.js for ukjente URL-er.
// Bruker samme visning som /mockup/ikke-funnet.
export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col">
      <NotFoundView />
    </div>
  )
}
