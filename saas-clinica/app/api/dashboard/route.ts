import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const hoje = await sql`
      SELECT COUNT(*) as total FROM agendamentos
      WHERE DATE(data_hora) = CURRENT_DATE
    `

    const proximosRows = await sql`
      SELECT a.*, p.nome as paciente_nome, pr.nome as profissional_nome, pr.especialidade
      FROM agendamentos a
      JOIN pacientes p ON a.paciente_id = p.id
      JOIN profissionais pr ON a.profissional_id = pr.id
      WHERE a.data_hora >= NOW()
        AND a.status IN ('agendado', 'confirmado')
      ORDER BY a.data_hora ASC
      LIMIT 5
    `

    const mesAtual = await sql`
      SELECT COUNT(*) as total FROM agendamentos
      WHERE EXTRACT(MONTH FROM data_hora) = EXTRACT(MONTH FROM NOW())
        AND EXTRACT(YEAR FROM data_hora) = EXTRACT(YEAR FROM NOW())
    `

    const hojeDetalhes = await sql`
      SELECT a.*, p.nome as paciente_nome, pr.nome as profissional_nome, pr.especialidade
      FROM agendamentos a
      JOIN pacientes p ON a.paciente_id = p.id
      JOIN profissionais pr ON a.profissional_id = pr.id
      WHERE DATE(a.data_hora) = CURRENT_DATE
      ORDER BY a.data_hora ASC
    `

    const atendidosMes = await sql`
      SELECT COUNT(*) as total FROM agendamentos
      WHERE EXTRACT(MONTH FROM data_hora) = EXTRACT(MONTH FROM NOW())
        AND EXTRACT(YEAR FROM data_hora) = EXTRACT(YEAR FROM NOW())
        AND status = 'atendido'
    `

    return NextResponse.json({
      consultas_hoje: Number(hoje[0].total),
      proximos: proximosRows,
      total_mes: Number(mesAtual[0].total),
      hoje_detalhes: hojeDetalhes,
      atendidos_mes: Number(atendidosMes[0].total),
    })
  } catch (error) {
    console.error("Error fetching dashboard:", error)
    return NextResponse.json(
      { error: "Erro ao buscar dados do dashboard" },
      { status: 500 }
    )
  }
}
