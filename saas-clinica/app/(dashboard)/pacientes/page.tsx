"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { Plus, Search, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PatientFormDialog } from "@/components/patient-form"

interface Patient {
  id: number
  nome: string
  cpf: string
  data_nascimento?: string
  telefone?: string
  email?: string
  endereco?: string
  observacoes?: string
}

export default function PacientesPage() {
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: patients, isLoading, mutate } = useSWR<Patient[]>(
    `/api/pacientes?search=${encodeURIComponent(search)}`
  )

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(`/api/pacientes/${id}`, { method: "DELETE" })
        if (!res.ok) {
          const err = await res.json()
          toast.error(err.error || "Erro ao excluir paciente")
          return
        }
        toast.success("Paciente excluido com sucesso")
        mutate()
      } catch {
        toast.error("Erro ao excluir paciente")
      }
      setDeleteId(null)
    },
    [mutate]
  )

  function openEdit(patient: Patient) {
    setEditingPatient(patient)
    setFormOpen(true)
  }

  function openNew() {
    setEditingPatient(null)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Pacientes
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os pacientes cadastrados na clinica.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-foreground">Lista de Pacientes</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {patients && patients.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead className="hidden md:table-cell">Telefone</TableHead>
                    <TableHead className="hidden lg:table-cell">Email</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">
                        {patient.nome}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {patient.cpf}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {patient.telefone || "-"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {patient.email || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(patient)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(patient.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nenhum paciente encontrado.
            </p>
          )}
        </CardContent>
      </Card>

      <PatientFormDialog
        key={editingPatient?.id || "new"}
        open={formOpen}
        onOpenChange={setFormOpen}
        patient={editingPatient}
        onSuccess={() => mutate()}
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Paciente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este paciente? Esta acao nao pode ser
              desfeita e todos os agendamentos associados tambem serao removidos.
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
