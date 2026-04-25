import NavBar from "../NavBar"
import Footer from "../Footer"
import NotFoundView from "../NotFoundView"

export const metadata = { title: "Mockup · 404" }

export default function MockupIkkeFunnet() {
  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col">
      <NavBar />
      <NotFoundView />
      <Footer />
    </div>
  )
}
