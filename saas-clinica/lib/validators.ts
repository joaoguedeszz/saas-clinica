import { z } from "zod"

function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "")
  if (cleaned.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cleaned)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(cleaned.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(cleaned.charAt(10))) return false

  return true
}

export function formatCPF(value: string): string {
  const cleaned = value.replace(/\D/g, "").slice(0, 11)
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`
  if (cleaned.length <= 9)
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
}

export const pacienteSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: z
    .string()
    .min(14, "CPF deve ter 11 digitos")
    .refine((val) => isValidCPF(val), { message: "CPF invalido" }),
  data_nascimento: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("Email invalido").optional().or(z.literal("")),
  endereco: z.string().optional(),
  observacoes: z.string().optional(),
})

export const profissionalSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  especialidade: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("Email invalido").optional().or(z.literal("")),
  ativo: z.boolean().default(true),
})

export const agendamentoSchema = z.object({
  paciente_id: z.coerce.number().min(1, "Selecione um paciente"),
  profissional_id: z.coerce.number().min(1, "Selecione um profissional"),
  data_hora: z.string().min(1, "Selecione data e hora"),
  tipo_atendimento: z.string().min(1, "Selecione o tipo de atendimento"),
  status: z
    .enum(["agendado", "confirmado", "atendido", "cancelado"])
    .default("agendado"),
  observacoes: z.string().optional(),
})

export type PacienteForm = z.infer<typeof pacienteSchema>
export type ProfissionalForm = z.infer<typeof profissionalSchema>
export type AgendamentoForm = z.infer<typeof agendamentoSchema>
