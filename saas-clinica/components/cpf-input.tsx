"use client"

import { Input } from "@/components/ui/input"
import { formatCPF } from "@/lib/validators"
import type { ChangeEvent } from "react"

interface CpfInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function CpfInput({ value, onChange, disabled }: CpfInputProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const formatted = formatCPF(e.target.value)
    onChange(formatted)
  }

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder="000.000.000-00"
      maxLength={14}
      disabled={disabled}
    />
  )
}
