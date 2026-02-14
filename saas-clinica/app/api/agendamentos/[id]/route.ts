import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()

    if (body.status) {
      const validStatuses = ["agendado", "confirmado", "atendido", "cancelado"]
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: "Status invalido" },
          { status: 400 }
        )
      }
      const rows = await sql`
        UPDATE agendamentos SET status = ${body.status} WHERE id = ${id} RETURNING *
      `
      if (rows.length === 0) {
        return NextResponse.json(
          { error: "Agendamento nao encontrado" },
          { status: 404 }
        )
      }
      return NextResponse.json(rows[0])
    }

    const rows = await sql`
      UPDATE agendamentos
      SET paciente_id = ${body.paciente_id},
          profissional_id = ${body.profissional_id},
          data_hora = ${body.data_hora}::timestamp,
          tipo_atendimento = ${body.tipo_atendimento},
          status = ${body.status || "agendado"},
          observacoes = ${body.observacoes || null}
      WHERE id = ${id}
      RETURNING *
    `
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Agendamento nao encontrado" },
        { status: 404 }
      )
    }
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Error updating agendamento:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar agendamento" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const rows = await sql`DELETE FROM agendamentos WHERE id = ${id} RETURNING id`
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Agendamento nao encontrado" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting agendamento:", error)
    return NextResponse.json(
      { error: "Erro ao excluir agendamento" },
      { status: 500 }
    )
  }
}
