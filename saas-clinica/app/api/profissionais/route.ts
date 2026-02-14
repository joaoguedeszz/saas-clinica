import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { profissionalSchema } from "@/lib/validators"

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM profissionais ORDER BY nome ASC`
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching profissionais:", error)
    return NextResponse.json(
      { error: "Erro ao buscar profissionais" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = profissionalSchema.parse(body)

    const rows = await sql`
      INSERT INTO profissionais (nome, especialidade, telefone, email, ativo)
      VALUES (${data.nome}, ${data.especialidade || null}, ${data.telefone || null}, ${data.email || null}, ${data.ativo})
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
    console.error("Error creating profissional:", error)
    return NextResponse.json(
      { error: "Erro ao criar profissional" },
      { status: 500 }
    )
  }
}
