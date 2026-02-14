"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { ProfessionalFormDialog } from "@/components/professional-form"

interface Professional {
  id: number
  nome: string
  especialidade?: string
  telefone?: string
  email?: string
  ativo: boolean
}

export default function ProfissionaisPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editingPro, setEditingPro] = useState<Professional | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: professionals, isLoading, mutate } = useSWR<Professional[]>(
    "/api/profissionais"
  )

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(`/api/profissionais/${id}`, {
          method: "DELETE",
        })
        if (!res.ok) {
          const err = await res.json()
          toast.error(err.error || "Erro ao excluir profissional")
          return
        }
        toast.success("Profissional excluido com sucesso")
        mutate()
      } catch {
        toast.error("Erro ao excluir profissional")
      }
      setDeleteId(null)
    },
    [mutate]
  )

  function openEdit(pro: Professional) {
    setEditingPro(pro)
    setFormOpen(true)
  }

  function openNew() {
    setEditingPro(null)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Profissionais
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os profissionais da clinica.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Profissional
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Lista de Profissionais</CardTitle>
        </CardHeader>
        <CardContent>
          {professionals && professionals.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead className="hidden md:table-cell">Telefone</TableHead>
                    <TableHead className="hidden lg:table-cell">Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {professionals.map((pro) => (
                    <TableRow key={pro.id}>
                      <TableCell className="font-medium">{pro.nome}</TableCell>
                      <TableCell>{pro.especialidade || "-"}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {pro.telefone || "-"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {pro.email || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={pro.ativo ? "default" : "secondary"}
                          className={
                            pro.ativo
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                          }
                        >
                          {pro.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(pro)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(pro.id)}
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
              Nenhum profissional cadastrado.
            </p>
          )}
        </CardContent>
      </Card>

      <ProfessionalFormDialog
        key={editingPro?.id || "new"}
        open={formOpen}
        onOpenChange={setFormOpen}
        professional={editingPro}
        onSuccess={() => mutate()}
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Profissional</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este profissional? Todos os
              agendamentos associados tambem serao removidos.
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
