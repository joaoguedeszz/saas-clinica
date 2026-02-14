import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { pacienteSchema } from "@/lib/validators"

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") || ""

  try {
    let rows
    if (search) {
      rows = await sql`
        SELECT * FROM pacientes
        WHERE nome ILIKE ${"%" + search + "%"}
           OR cpf ILIKE ${"%" + search + "%"}
        ORDER BY nome ASC
      `
    } else {
      rows = await sql`SELECT * FROM pacientes ORDER BY nome ASC`
    }
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching pacientes:", error)
    return NextResponse.json(
      { error: "Erro ao buscar pacientes" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = pacienteSchema.parse(body)

    const existing = await sql`SELECT id FROM pacientes WHERE cpf = ${data.cpf}`
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "CPF ja cadastrado" },
        { status: 409 }
      )
    }

    const rows = await sql`
      INSERT INTO pacientes (nome, cpf, data_nascimento, telefone, email, endereco, observacoes)
      VALUES (${data.nome}, ${data.cpf}, ${data.data_nascimento || null}, ${data.telefone || null}, ${data.email || null}, ${data.endereco || null}, ${data.observacoes || null})
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
    console.error("Error creating paciente:", error)
    return NextResponse.json(
      { error: "Erro ao criar paciente" },
      { status: 500 }
    )
  }
}
