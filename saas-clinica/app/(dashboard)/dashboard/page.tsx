"use client"

import useSWR from "swr"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  CalendarDays,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"

export default function DashboardPage() {
  const { data, isLoading } = useSWR("/api/dashboard", {
    refreshInterval: 30000,
  })

  if (isLoading && !data) {
    return null
  }

  const hojeFormatado = format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground capitalize">{hojeFormatado}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consultas Hoje
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {data?.consultas_hoje ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              agendamentos para hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total do Mes
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {data?.total_mes ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              agendamentos neste mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Atendidos no Mes
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {data?.atendidos_mes ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              pacientes atendidos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Consultas de Hoje</CardTitle>
            <CardDescription>
              Agendamentos para {format(new Date(), "dd/MM/yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data?.hoje_detalhes?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Horario</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.hoje_detalhes.map(
                    (item: {
                      id: number
                      data_hora: string
                      paciente_nome: string
                      profissional_nome: string
                      status: string
                    }) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {format(new Date(item.data_hora), "HH:mm")}
                        </TableCell>
                        <TableCell>{item.paciente_nome}</TableCell>
                        <TableCell>{item.profissional_nome}</TableCell>
                        <TableCell>
                          <StatusBadge status={item.status} />
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Nenhum agendamento para hoje.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Proximos Atendimentos
            </CardTitle>
            <CardDescription>Proximos 5 agendamentos</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.proximos?.length > 0 ? (
              <div className="flex flex-col gap-3">
                {data.proximos.map(
                  (item: {
                    id: number
                    data_hora: string
                    paciente_nome: string
                    profissional_nome: string
                    tipo_atendimento: string
                    status: string
                  }) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                          {item.paciente_nome}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.profissional_nome} - {item.tipo_atendimento}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-medium text-foreground">
                          {format(
                            new Date(item.data_hora),
                            "dd/MM 'as' HH:mm",
                            { locale: ptBR }
                          )}
                        </span>
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Nenhum agendamento proximo.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


