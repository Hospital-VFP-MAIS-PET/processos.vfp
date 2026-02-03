import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

interface Procedimento {
  cod: number;
  nome: string;
  planos: string;
  grupo_linha: string;
  sub_grupo: string;
  preco: string;
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 60; // 60 req/min por IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  rateLimitMap.set(ip, entry);
  return entry.count > RATE_LIMIT_MAX;
}

function isAllowedOrigin(request: NextRequest) {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const siteOrigin = request.nextUrl.origin;
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  const isOriginAllowed = (value: string) =>
    value === siteOrigin || allowedOrigins.includes(value);

  if (origin) return isOriginAllowed(origin);

  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      return isOriginAllowed(refOrigin);
    } catch {
      return false;
    }
  }

  return false;
}

export async function GET(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  try {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json(
        { success: false, error: "Origem não permitida" },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      );
    }

    const clientIp = getClientIp(request);
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, error: "Limite de requisições excedido" },
        { status: 429, headers: { "Cache-Control": "no-store" } }
      );
    }

    const planosParam = request.nextUrl.searchParams.get("plano");
    const subGrupoParam = request.nextUrl.searchParams.get("sub_grupo");

    // Criar conexão com banco de dados
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    if (!planosParam) {
      const [rows] = await connection.execute(
        "SELECT DISTINCT planos FROM Procedimentos WHERE planos IS NOT NULL AND planos <> '' ORDER BY planos ASC"
      );

      const planos = (rows as Array<{ planos: string }>).map((r) => r.planos);

      return NextResponse.json(
        {
          success: true,
          data: planos,
          count: planos.length,
        },
        {
          headers: {
            "Cache-Control": "no-store",
            Vary: "Origin",
          },
        }
      );
    }

    if (!subGrupoParam) {
      const [rows] = await connection.execute(
        "SELECT DISTINCT sub_grupo FROM Procedimentos WHERE planos = ? AND sub_grupo IS NOT NULL AND sub_grupo <> '' ORDER BY sub_grupo ASC",
        [planosParam]
      );

      const subGrupos = (rows as Array<{ sub_grupo: string }>).map(
        (r) => r.sub_grupo
      );

      return NextResponse.json(
        {
          success: true,
          data: subGrupos,
          count: subGrupos.length,
        },
        {
          headers: {
            "Cache-Control": "no-store",
            Vary: "Origin",
          },
        }
      );
    }

    const [rows] = await connection.execute(
      "SELECT cod, nome, grupo_linha, planos, sub_grupo, preco FROM Procedimentos WHERE planos = ? AND sub_grupo = ? ORDER BY nome ASC LIMIT 5000",
      [planosParam, subGrupoParam]
    );

    const procedimentos = rows as Procedimento[];

    return NextResponse.json(
      {
        success: true,
        data: procedimentos,
        count: procedimentos.length,
      },
      {
        headers: {
          "Cache-Control": "no-store",
          Vary: "Origin",
        },
      }
    );
  } catch (error) {
    console.error("Erro ao buscar procedimentos:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erro ao buscar procedimentos do banco de dados",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
