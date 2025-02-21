"use client"

import { NextAuthProvider } from "./NextAuthProvider"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<NextAuthProvider>
			{children}
			<Toaster />
		</NextAuthProvider>
	)
}