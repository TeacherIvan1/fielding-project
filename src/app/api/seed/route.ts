import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const startTime = Date.now();
  try {
    const seedPath = path.join(process.cwd(), "public", "seed", "fielding_db_seed.json");
    
    if (!fs.existsSync(seedPath)) {
      return NextResponse.json(
        { error: "Archivo de datos seed no encontrado en public/seed/fielding_db_seed.json" },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
        }
      );
    }

    const raw = fs.readFileSync(seedPath, "utf8");
    const data = JSON.parse(raw);
    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        ...data,
        _meta: {
          latencyMs,
          loaded_at: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "Content-Type": "application/json",
          "X-Latency-Ms": String(latencyMs),
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error al leer seed data" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      }
    );
  }
}
