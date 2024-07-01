"use client"

import HeroSection from "@/component/hero"

import { usePathname } from 'next/navigation'

export default function Chat() {
  const pathname = usePathname()
	return (
		<HeroSection backgroundImage="/images/background.png">
      {pathname}
		</HeroSection>
	)
}
