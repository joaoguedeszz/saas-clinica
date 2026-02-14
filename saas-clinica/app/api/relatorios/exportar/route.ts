import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dataInicio = searchParams.get("data_inicio")
  const dataFim = searchParams.get("data_fim")
  const profissionalId = searchParams.get("profissional_id")

  const inicio = dataInicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  const fim = dataFim || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0]

  try {
    let rows
    if (profissionalId) {
      rows = await sql`
        SELECT a.data_hora, a.tipo_atendimento, a.status, a.observacoes,
               p.nome as paciente_nome, p.cpf as paciente_cpf,
               pr.nome as profissional_nome, pr.especialidade
        FROM agendamentos a
        JOIN pacientes p ON a.paciente_id = p.id
        JOIN profissionais pr ON a.profissional_id = pr.id
        WHERE DATE(a.data_hora) >= ${inicio}::date
          AND DATE(a.data_hora) <= ${fim}::date
          AND a.profissional_id = ${profissionalId}
        ORDER BY a.data_hora ASC
      `
    } else {
      rows = await sql`
        SELECT a.data_hora, a.tipo_atendimento, a.status, a.observacoes,
               p.nome as paciente_nome, p.cpf as paciente_cpf,
               pr.nome as profissional_nome, pr.especialidade
        FROM agendamentos a
        JOIN pacientes p ON a.paciente_id = p.id
        JOIN profissionais pr ON a.profissional_id = pr.id
        WHERE DATE(a.data_hora) >= ${inicio}::date
          AND DATE(a.data_hora) <= ${fim}::date
        ORDER BY a.data_hora ASC
      `
    }

    const header = "Data/Hora,Paciente,CPF,Profissional,Especialidade,Tipo,Status,Observacoes"
    const csvRows = rows.map((r) => {
      const dataFormatted = new Date(r.data_hora).toLocaleString("pt-BR")
      return [
        dataFormatted,
        `"${r.paciente_nome}"`,
        r.paciente_cpf,
        `"${r.profissional_nome}"`,
        `"${r.especialidade || ""}"`,
        r.tipo_atendimento,
        r.status,
        `"${(r.observacoes || "").replace(/"/g, '""')}"`,
      ].join(",")
    })

    const csv = [header, ...csvRows].join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="relatorio_${inicio}_${fim}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting CSV:", error)
    return NextResponse.json(
      { error: "Erro ao exportar relatorio" },
      { status: 500 }
    )
  }
}
