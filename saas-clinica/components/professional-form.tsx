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
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { profissionalSchema, type ProfissionalForm } from "@/lib/validators"

interface ProfessionalFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  professional?: {
    id: number
    nome: string
    especialidade?: string
    telefone?: string
    email?: string
    ativo: boolean
  } | null
  onSuccess: () => void
}

export function ProfessionalFormDialog({
  open,
  onOpenChange,
  professional,
  onSuccess,
}: ProfessionalFormProps) {
  const isEditing = !!professional

  const form = useForm<ProfissionalForm>({
    resolver: zodResolver(profissionalSchema),
    defaultValues: {
      nome: professional?.nome || "",
      especialidade: professional?.especialidade || "",
      telefone: professional?.telefone || "",
      email: professional?.email || "",
      ativo: professional?.ativo ?? true,
    },
  })

  async function onSubmit(data: ProfissionalForm) {
    try {
      const url = isEditing
        ? `/api/profissionais/${professional.id}`
        : "/api/profissionais"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Erro ao salvar profissional")
        return
      }

      toast.success(
        isEditing
          ? "Profissional atualizado com sucesso"
          : "Profissional cadastrado com sucesso"
      )
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error("Erro ao salvar profissional")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? "Editar Profissional" : "Novo Profissional"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Altere os dados do profissional."
              : "Cadastre um novo profissional na clinica."}
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
                    <Input placeholder="Nome do profissional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="especialidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Cardiologia, Ortopedia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel className="text-sm font-medium">Ativo</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Profissional disponivel para agendamentos
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
