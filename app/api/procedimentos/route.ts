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
            Vary: "Origin",
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
          Vary: "Origin",
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
            Vary: "Origin",
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
