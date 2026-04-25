"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"

const OPTIONS = [
  { value: "alfabetisk", label: "Alfabetisk" },
  { value: "billigst", label: "Billigste pris" },
  { value: "rabatt", label: "Størst rabatt" },
]

export default function SortSelect({ value }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function onChange(e) {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value === "alfabetisk") {
      params.delete("sort")
    } else {
      params.set("sort", e.target.value)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <select
      value={value}
      onChange={onChange}
      className="rounded-full bg-blush-50 border border-rose-mist px-3 py-1 text-ink text-xs focus:outline-none focus:border-rose-dusty cursor-pointer"
    >
      {OPTIONS.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
