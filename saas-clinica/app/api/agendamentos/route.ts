import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { agendamentoSchema } from "@/lib/validators"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get("status")
  const profissionalId = searchParams.get("profissional_id")
  const dataInicio = searchParams.get("data_inicio")
  const dataFim = searchParams.get("data_fim")
  const hoje = searchParams.get("hoje")

  try {
    let rows

    if (hoje === "true") {
      rows = await sql`
        SELECT a.*, p.nome as paciente_nome, pr.nome as profissional_nome, pr.especialidade
        FROM agendamentos a
        JOIN pacientes p ON a.paciente_id = p.id
        JOIN profissionais pr ON a.profissional_id = pr.id
        WHERE DATE(a.data_hora) = CURRENT_DATE
        ORDER BY a.data_hora ASC
      `
    } else if (dataInicio && dataFim) {
      if (status && profissionalId) {
        rows = await sql`
          SELECT a.*, p.nome as paciente_nome, pr.nome as profissional_nome, pr.especialidade
          FROM agendamentos a
          JOIN pacientes p ON a.paciente_id = p.id
          JOIN profissionais pr ON a.profissional_id = pr.id
          WHERE a.data_hora >= ${dataInicio}::timestamp
            AND a.data_hora <= ${dataFim}::timestamp
            AND a.status = ${status}
            AND a.profissional_id = ${profissionalId}
          ORDER BY a.data_hora ASC
        `
      } else if (status) {
        rows = await sql`
          SELECT a.*, p.nome as paciente_nome, pr.nome as profissional_nome, pr.especialidade
          FROM agendamentos a
          JOIN pacientes p ON a.paciente_id = p.id
          JOIN profissionais pr ON a.profissional_id = pr.id
          WHERE a.data_hora >= ${dataInicio}::timestamp
            AND a.data_hora <= ${dataFim}::timestamp
            AND a.status = ${status}
          ORDER BY a.data_hora ASC
        `
      } else if (profissionalId) {
        rows = await sql`
          SELECT a.*, p.nome as paciente_nome, pr.nome as profissional_nome, pr.especialidade
          FROM agendamentos a
          JOIN pacientes p ON a.paciente_id = p.id
          JOIN profissionais pr ON a.profissional_id = pr.id
          WHERE a.data_hora >= ${dataInicio}::timestamp
            AND a.data_hora <= ${dataFim}::timestamp
            AND a.profissional_id = ${profissionalId}
          ORDER BY a.data_hora ASC
        `
      } else {
        rows = await sql`
          SELECT a.*, p.nome as paciente_nome, pr.nome as profissional_nome, pr.especialidade
          FROM agendamentos a
          JOIN pacientes p ON a.paciente_id = p.id
          JOIN profissionais pr ON a.profissional_id = pr.id
          WHERE a.data_hora >= ${dataInicio}::timestamp
            AND a.data_hora <= ${dataFim}::timestamp
          ORDER BY a.data_hora ASC
        `
      }
    } else {
      rows = await sql`
        SELECT a.*, p.nome as paciente_nome, pr.nome as profissional_nome, pr.especialidade
        FROM agendamentos a
        JOIN pacientes p ON a.paciente_id = p.id
        JOIN profissionais pr ON a.profissional_id = pr.id
        ORDER BY a.data_hora DESC
        LIMIT 100
      `
    }

    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching agendamentos:", error)
    return NextResponse.json(
      { error: "Erro ao buscar agendamentos" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = agendamentoSchema.parse(body)

    const rows = await sql`
      INSERT INTO agendamentos (paciente_id, profissional_id, data_hora, tipo_atendimento, status, observacoes)
      VALUES (${data.paciente_id}, ${data.profissional_id}, ${data.data_hora}::timestamp, ${data.tipo_atendimento}, ${data.status}, ${data.observacoes || null})
      RETURNING *
    `
    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json(
        { error: "Dados invalidos", details: error },
        { status: 400 }
      )
    }
    console.error("Error creating agendamento:", error)
    return NextResponse.json(
      { error: "Erro ao criar agendamento" },
      { status: 500 }
    )
  }
}
