export interface CurricularClassification {
  campo: string;
  area: string;
  materia: string;
}

/**
 * Normaliza nombres eliminando tildes, caracteres especiales,
 * espacios extra y convirtiendo a mayúsculas limpias.
 */
export function normalizarNombre(nombre: string | null | undefined): string {
  if (!nombre) return "";
  return String(nombre)
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Retorna las clases de Tailwind CSS correspondientes a la escala de calificaciones de Bolivia:
 * - < 51: Rojo (Insuficiente / Reprobado)
 * - 51-65: Amarillo (Regular / En desarrollo)
 * - >= 90: Verde (Excelente / Destacado)
 * - 66-89: Neutro / Aprobado
 */
export function getGradeColorClass(val: number | string | null | undefined): string {
  if (val === "-" || val === null || val === undefined || val === "") {
    return "bg-slate-50 text-slate-500 font-medium";
  }
  const n = typeof val === "number" ? val : parseFloat(String(val).replace(",", "."));
  if (isNaN(n)) {
    return "bg-slate-50 text-slate-500 font-medium";
  }

  if (n < 51) {
    return "bg-[#fee2e2] text-[#b91c1c] font-bold border border-red-300";
  }
  if (n >= 51 && n <= 65) {
    return "bg-[#fef3c7] text-[#b45309] font-bold border border-amber-300";
  }
  if (n >= 90) {
    return "bg-[#dcfce7] text-[#15803d] font-bold border border-emerald-300";
  }
  return "bg-[#f1f5f9] text-[#1e293b] font-semibold border border-slate-200";
}

/**
 * Clasifica cualquier materia y curso en los 4 Campos oficiales SIGED
 * y sus Áreas oficiales del Currículo del Sistema Educativo Plurinacional de Bolivia.
 * Mapea materias de Inglés o niveles MCER (A1, A2, B1, B2, C1) como LENGUA EXTRANJERA
 * dentro del área COMUNICACIÓN Y LENGUAJES.
 */
export function getClasificacionCurricular(
  materiaCruda: string | null | undefined,
  curso: string | null | undefined
): CurricularClassification {
  const m = String(materiaCruda || "").trim().toUpperCase();
  const c = String(curso || "").trim().toUpperCase();
  const isSec = c.includes("SEC");
  const matchNum = c.match(/\d+/);
  const numCurso = matchNum ? parseInt(matchNum[0], 10) : 0;

  // Normalizamos m sin acentos para comparaciones infalibles
  const mNorm = m.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const cNorm = c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  let campo = "COMUNIDAD Y SOCIEDAD";
  let area = "COMUNICACIÓN Y LENGUAJES";
  let materiaFinal = m;

  // Detección de Lengua Extranjera (Inglés y niveles MCER: A1-A, A1-B, A2, B1, etc.)
  const isEnglishOrMCER =
    mNorm.includes("INGLE") ||
    mNorm.includes("EXTRAN") ||
    /^[A-C][1-2](-[A-B])?$/.test(mNorm) ||
    /^[A-C][1-2](-[A-B])?$/.test(cNorm);

  if (isEnglishOrMCER) {
    materiaFinal = "LENGUA EXTRANJERA (INGLÉS)";
    campo = "COMUNIDAD Y SOCIEDAD";
    area = "COMUNICACIÓN Y LENGUAJES";
    return { campo, area, materia: materiaFinal };
  }

  // 1. CAMPO: COMUNIDAD Y SOCIEDAD
  if (
    mNorm.includes("LENGUAJE") ||
    mNorm.includes("VERBAL") ||
    mNorm.includes("LITERATURA") ||
    mNorm.includes("COMUNICACION") ||
    mNorm.includes("ORTOGRAFIA") ||
    mNorm.includes("LECTORA")
  ) {
    campo = "COMUNIDAD Y SOCIEDAD";
    area = "COMUNICACIÓN Y LENGUAJES";
  } else if (
    mNorm.includes("HISTORIA") ||
    mNorm.includes("SOCIALES") ||
    mNorm.includes("CIVICA") ||
    (mNorm.includes("GEOGRAFIA") && !isSec)
  ) {
    campo = "COMUNIDAD Y SOCIEDAD";
    area = "CIENCIAS SOCIALES";
  } else if (
    mNorm.includes("EDUCACION FISICA") ||
    (mNorm.includes("FISICA") && mNorm.includes("EDUC")) ||
    mNorm.includes("DEPORTE")
  ) {
    campo = "COMUNIDAD Y SOCIEDAD";
    area = "EDUCACIÓN FÍSICA Y DEPORTES";
  } else if (mNorm.includes("MUSICA") || mNorm.includes("MUSICAL")) {
    campo = "COMUNIDAD Y SOCIEDAD";
    area = "EDUCACIÓN MUSICAL";
  } else if (
    mNorm.includes("ARTES") ||
    mNorm.includes("PLASTICA") ||
    mNorm.includes("VISUALES") ||
    mNorm.includes("DIBUJO")
  ) {
    campo = "COMUNIDAD Y SOCIEDAD";
    area = "ARTES PLÁSTICAS Y VISUALES";
  }
  // 2. CAMPO: CIENCIA TECNOLOGÍA Y PRODUCCIÓN
  else if (
    mNorm.includes("MATEMATICA") ||
    mNorm.includes("ALGEBRA") ||
    mNorm.includes("ARITMETICA") ||
    mNorm.includes("GEOMETRIA") ||
    mNorm.includes("CALCULO") ||
    mNorm.includes("RAZONAMIENTO MAT")
  ) {
    campo = "CIENCIA TECNOLOGÍA Y PRODUCCIÓN";
    area = "MATEMÁTICA";
  } else if (
    mNorm.includes("ROBOTICA") ||
    mNorm.includes("TECNICA") ||
    mNorm.includes("TECNOLOGIA") ||
    mNorm.includes("COMPUTACION") ||
    mNorm.includes("INFORMATICA")
  ) {
    campo = "CIENCIA TECNOLOGÍA Y PRODUCCIÓN";
    area = isSec && numCurso >= 3 && mNorm.includes("ROBOTICA") ? "MATEMÁTICA" : "TÉCNICA TECNOLÓGICA";
  }
  // 3. CAMPO: VIDA TIERRA TERRITORIO
  else if (
    mNorm.includes("NATURALES") ||
    mNorm.includes("BIOLOGIA") ||
    mNorm.includes("CIENCIA") ||
    mNorm.includes("QUIMICA") ||
    (mNorm.includes("FISICA") && !mNorm.includes("EDUC"))
  ) {
    campo = "VIDA TIERRA TERRITORIO";
    if (isSec) {
      if (mNorm.includes("QUIMICA") || (mNorm.includes("FISICA") && !mNorm.includes("EDUC"))) {
        area = numCurso <= 2 ? "CIENCIAS NATURALES" : "FÍSICA - QUÍMICA";
      } else if (mNorm.includes("BIOLOGIA") || mNorm.includes("GEOGRAFIA")) {
        area = numCurso <= 2 ? "CIENCIAS NATURALES" : "BIOLOGÍA - GEOGRAFÍA";
      } else {
        area = "CIENCIAS NATURALES";
      }
    } else {
      area = "CIENCIAS NATURALES";
    }
  }
  // 4. CAMPO: COSMOS Y PENSAMIENTOS
  else if (
    mNorm.includes("FILOSOFIA") ||
    mNorm.includes("PSICOLOGIA") ||
    mNorm.includes("SICOLOGIA") ||
    mNorm.includes("COSMOVISION")
  ) {
    campo = "COSMOS Y PENSAMIENTOS";
    area = "COSMOVISIONES, FILOSOFÍA Y SICOLOGÍA";
  } else if (
    mNorm.includes("VALORES") ||
    mNorm.includes("RELIGION") ||
    mNorm.includes("ESPIRITUAL") ||
    mNorm.includes("EMOCIONAL") ||
    mNorm.includes("ETICA")
  ) {
    campo = "COSMOS Y PENSAMIENTOS";
    area = "VALORES, ESPIRITUALIDAD Y RELIGIONES";
  }

  return { campo, area, materia: materiaFinal };
}
