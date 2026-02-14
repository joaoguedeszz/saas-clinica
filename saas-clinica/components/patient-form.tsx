"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CpfInput } from "@/components/cpf-input"
import { pacienteSchema, type PacienteForm } from "@/lib/validators"

interface PatientFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient?: {
    id: number
    nome: string
    cpf: string
    data_nascimento?: string
    telefone?: string
    email?: string
    endereco?: string
    observacoes?: string
  } | null
  onSuccess: () => void
}

export function PatientFormDialog({
  open,
  onOpenChange,
  patient,
  onSuccess,
}: PatientFormProps) {
  const isEditing = !!patient

  const form = useForm<PacienteForm>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: {
      nome: patient?.nome || "",
      cpf: patient?.cpf || "",
      data_nascimento: patient?.data_nascimento
        ? patient.data_nascimento.split("T")[0]
        : "",
      telefone: patient?.telefone || "",
      email: patient?.email || "",
      endereco: patient?.endereco || "",
      observacoes: patient?.observacoes || "",
    },
  })

  async function onSubmit(data: PacienteForm) {
    try {
      const url = isEditing
        ? `/api/pacientes/${patient.id}`
        : "/api/pacientes"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Erro ao salvar paciente")
        return
      }

      toast.success(
        isEditing
          ? "Paciente atualizado com sucesso"
          : "Paciente cadastrado com sucesso"
      )
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error("Erro ao salvar paciente")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? "Editar Paciente" : "Novo Paciente"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Altere os dados do paciente."
              : "Preencha os dados para cadastrar um novo paciente."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do paciente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF *</FormLabel>
                  <FormControl>
                    <CpfInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data_nascimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereco</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, numero, cidade" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observacoes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Alergias, condicoes, etc."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Salvando..."
                  : isEditing
                    ? "Salvar Alteracoes"
                    : "Cadastrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
