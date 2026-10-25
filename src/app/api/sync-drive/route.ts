import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { normalizarNombre, getClasificacionCurricular } from "@/lib/siged";

export const dynamic = "force-dynamic";

interface GradeRecord {
  student: string;
  t1?: { ser?: any; saber?: any; hacer?: any; auto?: any; total?: any };
  t2?: { ser?: any; saber?: any; hacer?: any; auto?: any; total?: any };
  t3?: { ser?: any; saber?: any; hacer?: any; auto?: any; total?: any };
  final?: number | string;
  estado?: string;
}

interface SyncPayload {
  secret: string;
  teacher?: string;
  course: string;
  subject: string;
  records?: GradeRecord[];
}

const EXPECTED_SECRET = process.env.FIELDING_SYNC_SECRET || "80f145381e";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body: SyncPayload = await req.json();

    // 1. Validación de seguridad con el secret de sincronización
    if (!body || body.secret !== EXPECTED_SECRET) {
      return NextResponse.json(
        { ok: false, error: "No autorizado: secret de sincronización inválido." },
        { status: 401 }
      );
    }

    const seedPath = path.join(process.cwd(), "public", "seed", "fielding_db_seed.json");
    if (!fs.existsSync(seedPath)) {
      return NextResponse.json(
        { ok: false, error: "El archivo public/seed/fielding_db_seed.json no existe." },
        { status: 404 }
      );
    }

    const rawData = fs.readFileSync(seedPath, "utf8");
    const seedData = JSON.parse(rawData);

    if (!Array.isArray(seedData.students)) {
      seedData.students = [];
    }

    const records = body.records || [];
    let updatedCount = 0;

    const courseRaw = String(body.course || "").trim().toUpperCase();
    const subjectRaw = String(body.subject || "").trim().toUpperCase();
    const teacherName = body.teacher || "Profesor Asignado";

    const isIngles =
      subjectRaw.includes("INGLE") ||
      subjectRaw.includes("EXTRAN") ||
      /^[A-C][1-2](-[A-B])?$/.test(courseRaw) ||
      /^[A-C][1-2](-[A-B])?$/.test(subjectRaw);

    // Si vienen registros para sincronizar
    if (records.length > 0) {
      records.forEach((rec) => {
        const studentRaw = (rec.student || "").trim();
        if (!studentRaw) return;
        const normStudent = normalizarNombre(studentRaw);
        if (!normStudent) return;

        let target = seedData.students.find(
          (s: any) => s.normalized_name === normStudent && (!courseRaw || s.course === courseRaw)
        );

        // Si no se encuentra con curso exacto o si es materia de inglés (transversal)
        if (!target) {
          target = seedData.students.find((s: any) => s.normalized_name === normStudent);
        }

        // Fuzzy match con palabras clave del nombre
        if (!target) {
          const words = normStudent.split(" ").filter((w: string) => w.length >= 3);
          let bestScore = 0;
          for (const cand of seedData.students) {
            let score = 0;
            words.forEach((w: string) => {
              if (cand.normalized_name && cand.normalized_name.includes(w)) score++;
            });
            if (score > bestScore && score >= 2) {
              bestScore = score;
              target = cand;
            }
          }
        }

        const finalNum = parseFloat(String(rec.final ?? "").replace(",", "."));
        const estadoFinal =
          rec.estado || (!isNaN(finalNum) ? (finalNum >= 51 ? "APROBADO" : "REPROBADO") : "EN CURSO");

        if (isIngles) {
          if (target) {
            target.english_level = courseRaw;
            if (!target.grades) target.grades = {};
            target.grades["LENGUA EXTRANJERA"] = {
              profesor: `${teacherName} (${courseRaw})`,
              campo: "COMUNIDAD Y SOCIEDAD",
              area: "COMUNICACIÓN Y LENGUAJES",
              t1: rec.t1 || { ser: "-", saber: "-", hacer: "-", auto: "-", total: "-" },
              t2: rec.t2 || { ser: "-", saber: "-", hacer: "-", auto: "-", total: "-" },
              t3: rec.t3 || { ser: "-", saber: "-", hacer: "-", auto: "-", total: "-" },
              final: rec.final ?? "-",
              estado: estadoFinal,
            };
            updatedCount++;
          }
        } else {
          const cl = getClasificacionCurricular(subjectRaw, courseRaw);
          if (target) {
            if (!target.grades) target.grades = {};

            // Evitar duplicar materias por diferencia de tilde (ej: QUIMICA vs QUÍMICA)
            const cleanSub = subjectRaw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const existingKey = Object.keys(target.grades).find(
              (k) => k.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === cleanSub
            ) || cl.materia;

            target.grades[existingKey] = {
              profesor: teacherName,
              campo: cl.campo,
              area: cl.area,
              t1: rec.t1 || { ser: "-", saber: "-", hacer: "-", auto: "-", total: "-" },
              t2: rec.t2 || { ser: "-", saber: "-", hacer: "-", auto: "-", total: "-" },
              t3: rec.t3 || { ser: "-", saber: "-", hacer: "-", auto: "-", total: "-" },
              final: rec.final ?? "-",
              estado: estadoFinal,
            };
            updatedCount++;
          } else {
            // Estudiante nuevo no catalogado previamente
            const newIdx = seedData.students.length + 1;
            const newStudent = {
              id: `STU-${newIdx}`,
              student_username: `est_${normStudent.split(" ").slice(0, 2).join(".").toLowerCase()}`,
              parent_username: `fam_${normStudent.split(" ").slice(0, 2).join(".").toLowerCase()}`,
              password_initial: `Fielding${1000 + newIdx}`,
              full_name: studentRaw.toUpperCase(),
              normalized_name: normStudent,
              course: courseRaw || "1RO-SEC",
              english_level: null,
              must_change_password: true,
              grades: {
                [cl.materia]: {
                  profesor: teacherName,
                  campo: cl.campo,
                  area: cl.area,
                  t1: rec.t1 || { ser: "-", saber: "-", hacer: "-", auto: "-", total: "-" },
                  t2: rec.t2 || { ser: "-", saber: "-", hacer: "-", auto: "-", total: "-" },
                  t3: rec.t3 || { ser: "-", saber: "-", hacer: "-", auto: "-", total: "-" },
                  final: rec.final ?? "-",
                  estado: estadoFinal,
                },
              },
            };
            seedData.students.push(newStudent);
            updatedCount++;
          }
        }
      });
    } else {
      // Si records viene vacío (ping desde el Dashboard para sincronizar/refrescar)
      updatedCount = seedData.students.length;
    }

    const timestamp = new Date().toISOString();
    seedData.generated_at = timestamp;
    if (seedData.stats) {
      seedData.stats.students = seedData.students.length;
    }

    // Guardar los datos actualizados de forma persistente en disco
    fs.writeFileSync(seedPath, JSON.stringify(seedData, null, 2), "utf8");

    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        ok: true,
        updatedCount,
        course: courseRaw || "GLOBAL",
        subject: subjectRaw || "GLOBAL",
        timestamp,
        latencyMs,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    return NextResponse.json(
      { ok: false, error: error?.message || "Error interno al sincronizar con Google Drive", latencyMs },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "Fielding Google Drive Realtime Sync Webhook",
    timestamp: new Date().toISOString(),
    guide: "Envía un POST con { secret, course, subject, teacher?, records: [...] }",
  });
}
