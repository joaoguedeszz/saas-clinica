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
    let atendimentos
    if (profissionalId) {
      atendimentos = await sql`
        SELECT a.*, p.nome as paciente_nome, pr.nome as profissional_nome, pr.especialidade
        FROM agendamentos a
        JOIN pacientes p ON a.paciente_id = p.id
        JOIN profissionais pr ON a.profissional_id = pr.id
        WHERE DATE(a.data_hora) >= ${inicio}::date
          AND DATE(a.data_hora) <= ${fim}::date
          AND a.profissional_id = ${profissionalId}
        ORDER BY a.data_hora ASC
      `
    } else {
      atendimentos = await sql`
        SELECT a.*, p.nome as paciente_nome, pr.nome as profissional_nome, pr.especialidade
        FROM agendamentos a
        JOIN pacientes p ON a.paciente_id = p.id
        JOIN profissionais pr ON a.profissional_id = pr.id
        WHERE DATE(a.data_hora) >= ${inicio}::date
          AND DATE(a.data_hora) <= ${fim}::date
        ORDER BY a.data_hora ASC
      `
    }

    const totalAtendidos = atendimentos.filter(
      (a) => a.status === "atendido"
    ).length
    const totalAgendados = atendimentos.filter(
      (a) => a.status === "agendado" || a.status === "confirmado"
    ).length
    const totalCancelados = atendimentos.filter(
      (a) => a.status === "cancelado"
    ).length
    const taxa =
      totalAtendidos + totalCancelados > 0
        ? Math.round(
            (totalAtendidos / (totalAtendidos + totalCancelados)) * 100
          )
        : 0

    return NextResponse.json({
      atendimentos,
      resumo: {
        total: atendimentos.length,
        atendidos: totalAtendidos,
        agendados: totalAgendados,
        cancelados: totalCancelados,
        taxa_comparecimento: taxa,
      },
      periodo: { inicio, fim },
    })
  } catch (error) {
    console.error("Error fetching relatorio:", error)
    return NextResponse.json(
      { error: "Erro ao gerar relatorio" },
      { status: 500 }
    )
  }
}
