import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { profissionalSchema } from "@/lib/validators"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const rows = await sql`SELECT * FROM profissionais WHERE id = ${id}`
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Profissional nao encontrado" },
        { status: 404 }
      )
    }
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Error fetching profissional:", error)
    return NextResponse.json(
      { error: "Erro ao buscar profissional" },
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
    const data = profissionalSchema.parse(body)

    const rows = await sql`
      UPDATE profissionais
      SET nome = ${data.nome},
          especialidade = ${data.especialidade || null},
          telefone = ${data.telefone || null},
          email = ${data.email || null},
          ativo = ${data.ativo}
      WHERE id = ${id}
      RETURNING *
    `
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Profissional nao encontrado" },
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
    console.error("Error updating profissional:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar profissional" },
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
    const rows = await sql`DELETE FROM profissionais WHERE id = ${id} RETURNING id`
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Profissional nao encontrado" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting profissional:", error)
    return NextResponse.json(
      { error: "Erro ao excluir profissional" },
      { status: 500 }
    )
  }
}
