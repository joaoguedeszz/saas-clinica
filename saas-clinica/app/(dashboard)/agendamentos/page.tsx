"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import { format } from "date-fns"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/status-badge"
import { AppointmentFormDialog } from "@/components/appointment-form"

interface Appointment {
  id: number
  paciente_id: number
  profissional_id: number
  data_hora: string
  tipo_atendimento: string
  status: string
  observacoes?: string
  paciente_nome: string
  profissional_nome: string
  especialidade?: string
}

export default function AgendamentosPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [profFilter, setProfFilter] = useState<string>("todos")
  const [dateStart, setDateStart] = useState("")
  const [dateEnd, setDateEnd] = useState("")

  const buildUrl = () => {
    const params = new URLSearchParams()
    if (dateStart && dateEnd) {
      params.set("data_inicio", `${dateStart}T00:00:00`)
      params.set("data_fim", `${dateEnd}T23:59:59`)
    }
    if (statusFilter !== "todos") params.set("status", statusFilter)
    if (profFilter !== "todos") params.set("profissional_id", profFilter)
    return `/api/agendamentos?${params.toString()}`
  }

  const {
    data: appointments,
    isLoading,
    mutate,
  } = useSWR<Appointment[]>(buildUrl())

  const { data: profissionais } = useSWR<
    { id: number; nome: string; ativo: boolean }[]
  >("/api/profissionais")

  const handleStatusChange = useCallback(
    async (id: number, newStatus: string) => {
      try {
        const res = await fetch(`/api/agendamentos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        })
        if (!res.ok) {
          toast.error("Erro ao atualizar status")
          return
        }
        toast.success("Status atualizado")
        mutate()
      } catch {
        toast.error("Erro ao atualizar status")
      }
    },
    [mutate]
  )

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(`/api/agendamentos/${id}`, {
          method: "DELETE",
        })
        if (!res.ok) {
          toast.error("Erro ao excluir agendamento")
          return
        }
        toast.success("Agendamento excluido com sucesso")
        mutate()
      } catch {
        toast.error("Erro ao excluir agendamento")
      }
      setDeleteId(null)
    },
    [mutate]
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Agendamentos
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os agendamentos da clinica.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Data Inicio</label>
              <Input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Data Fim</label>
              <Input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="atendido">Atendido</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Profissional</label>
              <Select value={profFilter} onValueChange={setProfFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {profissionais?.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Lista de Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments && appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead className="hidden md:table-cell">Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {format(new Date(apt.data_hora), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>{apt.paciente_nome}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{apt.profissional_nome}</span>
                          {apt.especialidade && (
                            <span className="text-xs text-muted-foreground">
                              {apt.especialidade}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {apt.tipo_atendimento}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="cursor-pointer">
                              <StatusBadge status={apt.status} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {["agendado", "confirmado", "atendido", "cancelado"]
                              .filter((s) => s !== apt.status)
                              .map((s) => (
                                <DropdownMenuItem
                                  key={s}
                                  onClick={() =>
                                    handleStatusChange(apt.id, s)
                                  }
                                  className="capitalize"
                                >
                                  Marcar como {s}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(apt.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nenhum agendamento encontrado. Ajuste os filtros ou crie um novo
              agendamento.
            </p>
          )}
        </CardContent>
      </Card>

      <AppointmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={() => mutate()}
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
