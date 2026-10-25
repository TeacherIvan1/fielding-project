import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { normalizarNombre, getClasificacionCurricular } from "../src/lib/siged";

const DATA_DIR = path.join(process.cwd(), "data");
const OUT_DIR = path.join(process.cwd(), "public", "seed");

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function generarUsername(nombreNorm: string, prefix: string, index: number): string {
  const parts = nombreNorm.split(" ").filter(Boolean);
  const base = parts.length >= 2 ? `${parts[0].toLowerCase()}.${parts[1].toLowerCase()}` : `user${index}`;
  return `${prefix}_${base}`;
}

function findCsvFile(patterns: string[]): string {
  for (const p of patterns) {
    const full = path.join(DATA_DIR, p);
    if (fs.existsSync(full)) return full;
  }
  const files = fs.existsSync(DATA_DIR) ? fs.readdirSync(DATA_DIR) : [];
  for (const file of files) {
    for (const pat of patterns) {
      const cleanPat = pat.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanFile = file.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (cleanFile.includes(cleanPat)) {
        return path.join(DATA_DIR, file);
      }
    }
  }
  return "";
}

async function run() {
  console.log("⚡ Procesando CSVs del Colegio Fielding Bolivia...");

  // -------------------------------------------------------------
  // A) CENTRALIZADOR MAESTRO (PROFESORES Y ESTUDIANTES)
  // -------------------------------------------------------------
  const configPath = findCsvFile([
    "CENTRALIZADOR MAESTRO - FIELDING - Config_Profesores.csv",
    "CENTRALIZADOR_MAESTRO_FIELDING_Config_Profesores.csv"
  ]);
  const anualPath = findCsvFile([
    "CENTRALIZADOR MAESTRO - FIELDING - BD_Consolidada_Anual.csv",
    "CENTRALIZADOR_MAESTRO_FIELDING_BD_Consolidada_Anual.csv"
  ]);

  if (configPath && anualPath) {
    const configCsv = fs.readFileSync(configPath, "utf8");
    const anualCsv = fs.readFileSync(anualPath, "utf8");

    const configRows = Papa.parse<Record<string, string>>(configCsv, { header: true, skipEmptyLines: true }).data;
    const anualRows = Papa.parse<Record<string, string>>(anualCsv, { header: true, skipEmptyLines: true }).data;

    // 1. Extraer Profesores Únicos
    const teachersMap = new Map<string, any>();
    configRows.forEach((row, idx) => {
      const profRaw = (row["Profesor"] || "").trim();
      const profNorm = normalizarNombre(profRaw);
      if (!profNorm) return;
      if (!teachersMap.has(profNorm)) {
        teachersMap.set(profNorm, {
          id: `TCH-${teachersMap.size + 1}`,
          username: generarUsername(profNorm, "prof", teachersMap.size + 1),
          password_initial: `Fielding2026!`,
          role: "TEACHER",
          full_name: profRaw,
          normalized_name: profNorm,
          must_change_password: true,
          assignments: []
        });
      }
      teachersMap.get(profNorm).assignments.push({
        course: (row["Curso_Nivel"] || "").trim().toUpperCase(),
        subject: (row["Materia"] || "").trim().toUpperCase(),
        drive_url: row["URL_Archivo"] || ""
      });
    });

    // 2. Extraer Estudiantes, detectar Curso Principal y Nivel de Inglés
    const studentsMap = new Map<string, any>();
    const englishRecords: any[] = [];

    anualRows.forEach((row) => {
      const estRaw = (row["Estudiante"] || "").trim().toUpperCase();
      if (!estRaw || estRaw.includes("#REF!") || estRaw.includes("#N/A")) return;
      const estNorm = normalizarNombre(estRaw);
      const curso = (row["Curso"] || "").trim().toUpperCase();
      const materia = (row["Materia"] || "").trim().toUpperCase();
      const isIngles = materia.includes("INGLE") || /^[A-C][1-2](-[A-B])?$/.test(curso);

      if (!isIngles) {
        if (!studentsMap.has(estNorm)) {
          const idx = studentsMap.size + 1;
          studentsMap.set(estNorm, {
            id: `STU-${idx}`,
            student_username: generarUsername(estNorm, "est", idx),
            parent_username: generarUsername(estNorm, "fam", idx),
            password_initial: `Fielding${1000 + idx}`,
            full_name: estRaw,
            normalized_name: estNorm,
            course: curso,
            english_level: null,
            must_change_password: true,
            grades: {}
          });
        }
        const st = studentsMap.get(estNorm);
        const cl = getClasificacionCurricular(materia, curso);
        st.grades[materia] = {
          profesor: row["Profesor"],
          campo: cl.campo,
          area: cl.area,
          t1: { ser: row["1T Ser"], saber: row["1T Saber"], hacer: row["1T Hacer"], auto: row["1T Auto"], total: row["1T Total"] },
          t2: { ser: row["2T Ser"], saber: row["2T Saber"], hacer: row["2T Hacer"], auto: row["2T Auto"], total: row["2T Total"] },
          t3: { ser: row["3T Ser"], saber: row["3T Saber"], hacer: row["3T Hacer"], auto: row["3T Auto"], total: row["3T Total"] },
          final: row["Promedio Final"],
          estado: row["Estado"]
        };
      } else {
        englishRecords.push({ estNorm, curso, row });
      }
    });

    // 3. Fuzzy Match de Lengua Extranjera
    englishRecords.forEach(({ estNorm, curso, row }) => {
      let target = studentsMap.get(estNorm);
      if (!target) {
        const words = estNorm.split(" ").filter((w: string) => w.length >= 3);
        let bestScore = 0;
        for (const [candNorm, candObj] of studentsMap.entries()) {
          let score = 0;
          words.forEach((w: string) => { if (candNorm.includes(w)) score++; });
          if (score > bestScore && score >= 2) {
            bestScore = score;
            target = candObj;
          }
        }
      }
      if (target) {
        target.english_level = curso;
        target.grades["LENGUA EXTRANJERA"] = {
          profesor: `${row["Profesor"]} (${curso})`,
          campo: "COMUNIDAD Y SOCIEDAD",
          area: "COMUNICACIÓN Y LENGUAJES",
          t1: { ser: row["1T Ser"], saber: row["1T Saber"], hacer: row["1T Hacer"], auto: row["1T Auto"], total: row["1T Total"] },
          t2: { ser: row["2T Ser"], saber: row["2T Saber"], hacer: row["2T Hacer"], auto: row["2T Auto"], total: row["2T Total"] },
          t3: { ser: row["3T Ser"], saber: row["3T Saber"], hacer: row["3T Hacer"], auto: row["3T Auto"], total: row["3T Total"] },
          final: row["Promedio Final"],
          estado: row["Estado"]
        };
      }
    });

    const payload = {
      generated_at: new Date().toISOString(),
      stats: { teachers: teachersMap.size, students: studentsMap.size },
      teachers: Array.from(teachersMap.values()),
      students: Array.from(studentsMap.values())
    };

    fs.writeFileSync(path.join(OUT_DIR, "fielding_db_seed.json"), JSON.stringify(payload, null, 2), "utf8");
    console.log(`✅ Semilla académica en public/seed/fielding_db_seed.json (${teachersMap.size} profesores, ${studentsMap.size} estudiantes).`);
  }

  // -------------------------------------------------------------
  // B) PLANES DE CLASE Y PDCs (PLANIFICACIÓN CURRICULAR DOCENTE)
  // -------------------------------------------------------------
  const pdcPath = findCsvFile([
    "PDCs - Sheet1.csv",
    "PDCs_Sheet1.csv",
    "PDCs.csv"
  ]);
  const planesPath = findCsvFile([
    "Planes de Clase - Ivan Mancilla.csv",
    "Planes_de_Clase_Ivan_Mancilla.csv",
    "Planes_de_Clase.csv"
  ]);

  let pdcRows: any[] = [];
  let planesRows: any[] = [];

  if (pdcPath && fs.existsSync(pdcPath)) {
    const pdcCsv = fs.readFileSync(pdcPath, "utf8");
    pdcRows = Papa.parse<Record<string, string>>(pdcCsv, { header: true, skipEmptyLines: true }).data;
  }

  if (planesPath && fs.existsSync(planesPath)) {
    const planesCsv = fs.readFileSync(planesPath, "utf8");
    planesRows = Papa.parse<Record<string, string>>(planesCsv, { header: true, skipEmptyLines: true }).data;
  }

  if (pdcRows.length > 0 || planesRows.length > 0) {
    const curriculumPayload = {
      generated_at: new Date().toISOString(),
      stats: {
        pdcs: pdcRows.length,
        planes: planesRows.length
      },
      pdcs: pdcRows,
      planes: planesRows
    };

    fs.writeFileSync(
      path.join(OUT_DIR, "fielding_curriculum_seed.json"),
      JSON.stringify(curriculumPayload, null, 2),
      "utf8"
    );
    console.log(
      `✅ Semilla curricular generada en public/seed/fielding_curriculum_seed.json (${pdcRows.length} PDCs, ${planesRows.length} Planes de Clase).`
    );
  }
}

run();
