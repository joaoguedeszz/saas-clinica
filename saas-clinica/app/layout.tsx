import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "sonner"
import { SWRProvider } from "@/components/swr-provider"

import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ClinicaPlus - Gestao de Clinicas",
  description:
    "Sistema completo de gestao para clinicas medicas. Agendamentos, pacientes, profissionais e relatorios.",
}

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        <SWRProvider>
          {children}
        </SWRProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
