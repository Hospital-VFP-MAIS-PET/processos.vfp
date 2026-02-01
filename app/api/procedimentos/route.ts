import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

interface Procedimento {
  cod: number;
  nome: string;
  grupo_linha: string;
  sub_grupo: string;
  preco_tabela: string;
}

let cachedProcedimentos: Procedimento[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora de cache

export async function GET(request: NextRequest) {
  try {
    // Verificar cache primeiro
    const now = Date.now();
    if (cachedProcedimentos && now - cacheTimestamp < CACHE_DURATION) {
      return NextResponse.json(
        {
          success: true,
          data: cachedProcedimentos,
          cached: true,
          cacheAge: Math.floor((now - cacheTimestamp) / 1000),
        },
        {
          headers: {
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        }
      );
    }

    // Criar conexão com banco de dados
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Query para buscar todos os procedimentos - ordenado por nome
    const [rows] = await connection.execute(
      "SELECT cod, nome, grupo_linha, sub_grupo, preco_tabela FROM Processos ORDER BY nome ASC LIMIT 5000"
    );

    const procedimentos = rows as Procedimento[];

    // Fechar conexão imediatamente
    await connection.end();

    // Armazenar em cache na memória
    cachedProcedimentos = procedimentos;
    cacheTimestamp = now;

    return NextResponse.json(
      {
        success: true,
        data: procedimentos,
        cached: false,
        count: procedimentos.length,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
          "X-Cache": "MISS",
        },
      }
    );
  } catch (error) {
    console.error("Erro ao buscar procedimentos:", error);

    // Se houver erro, tentar devolver o cache mesmo que expirado
    if (cachedProcedimentos) {
      return NextResponse.json(
        {
          success: true,
          data: cachedProcedimentos,
          cached: true,
          warning: "Usando cache expirado devido a erro de conexão",
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, max-age=300",
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Erro ao buscar procedimentos do banco de dados",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
