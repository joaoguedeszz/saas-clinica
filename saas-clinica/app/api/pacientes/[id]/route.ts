import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { pacienteSchema } from "@/lib/validators"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const rows = await sql`SELECT * FROM pacientes WHERE id = ${id}`
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Paciente nao encontrado" },
        { status: 404 }
      )
    }
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Error fetching paciente:", error)
    return NextResponse.json(
      { error: "Erro ao buscar paciente" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const data = pacienteSchema.parse(body)

    const existing = await sql`SELECT id FROM pacientes WHERE cpf = ${data.cpf} AND id != ${id}`
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "CPF ja cadastrado para outro paciente" },
        { status: 409 }
      )
    }

    const rows = await sql`
      UPDATE pacientes
      SET nome = ${data.nome},
          cpf = ${data.cpf},
          data_nascimento = ${data.data_nascimento || null},
          telefone = ${data.telefone || null},
          email = ${data.email || null},
          endereco = ${data.endereco || null},
          observacoes = ${data.observacoes || null}
      WHERE id = ${id}
      RETURNING *
    `
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Paciente nao encontrado" },
        { status: 404 }
      )
    }
    return NextResponse.json(rows[0])
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json(
        { error: "Dados invalidos", details: error },
        { status: 400 }
      )
    }
    console.error("Error updating paciente:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar paciente" },
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
    const rows = await sql`DELETE FROM pacientes WHERE id = ${id} RETURNING id`
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Paciente nao encontrado" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting paciente:", error)
    return NextResponse.json(
      { error: "Erro ao excluir paciente" },
      { status: 500 }
    )
  }
}
