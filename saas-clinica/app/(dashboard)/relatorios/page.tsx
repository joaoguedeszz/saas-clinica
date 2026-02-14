"use client"

import { useState } from "react"
import useSWR from "swr"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Download, Users, CalendarCheck, TrendingUp, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts"

function getDefaultDates() {
  const now = new Date()
  const inicio = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0]
  const fim = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0]
  return { inicio, fim }
}

export default function RelatoriosPage() {
  const defaults = getDefaultDates()
  const [dataInicio, setDataInicio] = useState(defaults.inicio)
  const [dataFim, setDataFim] = useState(defaults.fim)
  const [profFilter, setProfFilter] = useState<string>("todos")

  const buildUrl = () => {
    const params = new URLSearchParams()
    params.set("data_inicio", dataInicio)
    params.set("data_fim", dataFim)
    if (profFilter !== "todos") params.set("profissional_id", profFilter)
    return `/api/relatorios?${params.toString()}`
  }

  const { data, isLoading } = useSWR(buildUrl())

  const { data: profissionais } = useSWR<
    { id: number; nome: string }[]
  >("/api/profissionais")

  function handleExport() {
    const params = new URLSearchParams()
    params.set("data_inicio", dataInicio)
    params.set("data_fim", dataFim)
    if (profFilter !== "todos") params.set("profissional_id", profFilter)
    window.open(`/api/relatorios/exportar?${params.toString()}`, "_blank")
  }

  const chartData = data?.atendimentos
    ? Object.entries(
        (
          data.atendimentos as {
            data_hora: string
            status: string
          }[]
        ).reduce(
          (acc: Record<string, number>, a) => {
            const day = format(new Date(a.data_hora), "dd/MM")
            acc[day] = (acc[day] || 0) + 1
            return acc
          },
          {} as Record<string, number>
        )
      ).map(([day, count]) => ({ dia: day, atendimentos: count }))
    : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Relatorios
          </h1>
          <p className="text-sm text-muted-foreground">
            Visualize e exporte dados de atendimentos.
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Filtros do Periodo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Data Inicio</label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Data Fim</label>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
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

      {!isLoading && data ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total
                </CardTitle>
                <CalendarCheck className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {data?.resumo?.total ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  agendamentos no periodo
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Atendidos
                </CardTitle>
                <Users className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {data?.resumo?.atendidos ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  pacientes atendidos
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Cancelados
                </CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {data?.resumo?.cancelados ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  agendamentos cancelados
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Comparecimento
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {data?.resumo?.taxa_comparecimento ?? 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  taxa de comparecimento
                </p>
              </CardContent>
            </Card>
          </div>

          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">
                  Atendimentos por Dia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="dia"
                        className="text-xs fill-muted-foreground"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        className="text-xs fill-muted-foreground"
                        tick={{ fontSize: 12 }}
                        allowDecimals={false}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                          color: "hsl(var(--card-foreground))",
                        }}
                      />
                      <Bar
                        dataKey="atendimentos"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                        name="Atendimentos"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">
                Detalhamento do Periodo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.atendimentos?.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Profissional</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Tipo
                        </TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.atendimentos.map(
                        (a: {
                          id: number
                          data_hora: string
                          paciente_nome: string
                          profissional_nome: string
                          tipo_atendimento: string
                          status: string
                        }) => (
                          <TableRow key={a.id}>
                            <TableCell className="font-medium whitespace-nowrap">
                              {format(
                                new Date(a.data_hora),
                                "dd/MM/yyyy HH:mm",
                                { locale: ptBR }
                              )}
                            </TableCell>
                            <TableCell>{a.paciente_nome}</TableCell>
                            <TableCell>{a.profissional_nome}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {a.tipo_atendimento}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={a.status} />
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Nenhum atendimento encontrado no periodo selecionado.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
