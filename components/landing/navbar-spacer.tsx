"use client"

import { useEffect, useState } from "react"

export function NavbarSpacer() {
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const navbar = document.querySelector("header")
    if (navbar) {
      setHeight(navbar.offsetHeight)
    }
  }, [])

  return <div style={{ height: `${height}px` }} className="hidden" />
}
