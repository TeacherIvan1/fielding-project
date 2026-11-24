"use client";

import { useState, useEffect, useCallback } from "react";

export interface GradeDimension {
  ser: number | string;
  saber: number | string;
  hacer: number | string;
  auto: number | string;
  total: number | string;
}

export interface SubjectGrade {
  profesor: string;
  campo: string;
  area: string;
  t1: GradeDimension;
  t2: GradeDimension;
  t3: GradeDimension;
  final: number | string;
  estado: string;
}

export interface Student {
  id: string;
  student_username: string;
  parent_username: string;
  full_name: string;
  course: string;
  rude_code: string;
  english_level: string;
  parent_name: string;
  grades: Record<string, SubjectGrade>;
}

export interface TeacherAssignment {
  course: string;
  subject: string;
  drive_url: string;
  last_sync: string;
  students_count: number;
}

export interface TaskItem {
  id: string;
  course: string;
  subject: string;
  teacher: string;
  title: string;
  description: string;
  dueDate: string;
  type: "TAREA" | "EXAMEN" | "EVENTO";
  createdAt: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: "ALTA" | "MEDIA" | "GENERAL";
  author: string;
  targetRole: "TODOS" | "PADRES" | "DOCENTES";
  active: boolean;
}

export interface DirectMessage {
  id: string;
  threadId: string;
  senderRole: "parent" | "teacher" | "student" | "admin";
  senderName: string;
  recipientName: string;
  teacherName: string;
  course: string;
  text: string;
  timestamp: string;
  hasAlert: boolean;
  alertKeyword?: string;
}

export interface MeetInterview {
  id: string;
  teacherName: string;
  parentName: string;
  studentName: string;
  course: string;
  date: string;
  time: string;
  reason: string;
  status: "PROGRAMADA" | "COMPLETADA" | "CANCELADA";
  meetCode: string;
  meetLink: string;
  createdAt: string;
}

export interface PdcTemplate {
  nroPdc: string;
  docente: string;
  distrito: string;
  unidadEducativa: string;
  director: string;
  materia: string;
  grado: string;
  mes: string;
  tema: string;
  perfilesSalida: string;
  objetivoHolistico: string;
  contenidos: string;
  practica: string;
  teoria: string;
  valoracion: string;
  produccion: string;
  materialVida: string;
  materialDigital: string;
  criterioSer: string;
  criterioSaber: string;
  criterioHacer: string;
  adaptacionCurricular: string;
  producto: string;
  competencia: string;
}

export interface PlanClaseTemplate {
  claseNro: string;
  docente: string;
  materia: string;
  grado: string;
  mes: string;
  tema: string;
  objetivo: string;
  competencia: string;
  capacidades: string;
  actitudesSer: string;
  indicadoresSaber: string;
  indicadoresHacer: string;
  faseInicio: string;
  faseAdquisicion: string;
  faseAplicacion: string;
  faseEvaluacion: string;
  recursos: string;
}

export interface DemoStoreData {
  students: Student[];
  assignments: TeacherAssignment[];
  tasks: TaskItem[];
  announcements: AnnouncementItem[];
  messages: DirectMessage[];
  interviews: MeetInterview[];
  alertKeywords: string[];
  pdcTemplate: PdcTemplate;
  planTemplate: PlanClaseTemplate;
  lastSync: string;
}

export const DEFAULT_ALERT_KEYWORDS = [
  "urgente",
  "queja",
  "reclamo",
  "problema",
  "falta",
];

export function checkSensitiveAlert(
  text: string,
  keywords: string[] = DEFAULT_ALERT_KEYWORDS
): { hasAlert: boolean; keyword?: string } {
  const lower = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  for (const rawWord of keywords) {
    const word = rawWord
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (word && lower.includes(word)) {
      return { hasAlert: true, keyword: rawWord.trim().toUpperCase() };
    }
  }
  return { hasAlert: false };
}

function generateMeetRoomCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const part2 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `fld-${part1}-${part2}`;
}

const INITIAL_PDC: PdcTemplate = {
  nroPdc: "07/2026",
  docente: "Lic. Ivan Ezequiel Mancilla Copa",
  distrito: "Sucre",
  unidadEducativa: "Unidad Educativa Fielding Bolivia",
  director: "Ing. José Mariano Pinaya",
  materia: "Historia de Bolivia",
  grado: "1ro de Secundaria",
  mes: "Septiembre",
  tema: "La Guerra del Pacífico: Antecedentes, Tratado de 1904 e Impacto Territorial",
  perfilesSalida:
    "Analiza críticamente los procesos históricos, territoriales y sociales del siglo XIX en Bolivia, valorando la soberanía marítima y expresando argumentos fundamentados en debates colectivos.",
  objetivoHolistico:
    "Fortalecemos la identidad patriótica y el pensamiento reflexivo (SER), mediante el análisis documental y cartográfico de la Guerra del Pacífico (SABER), elaborando mapas temáticos y ensayos argumentativos (HACER), para consolidar el compromiso soberano en nuestra comunidad (DECIDIR).",
  contenidos:
    "1. Causas económicas y geopolíticas del conflicto del Litoral (el salitre y el guano).\n2. Invasión a Antofagasta y defensa de Calama (Eduardo Abaroa).\n3. Campañas marítimas y terrestres.\n4. El Tratado de 1904 y el enclaustramiento boliviano.",
  practica:
    "• Observación de mapas históricos de 1879 y testimonios epistolares de la época.\n• Lluvia de ideas guiada sobre el significado de la salida soberana al mar.",
  teoria:
    "• Exposición dialogada sobre la influencia de las empresas británicas y chilenas en el salitre.\n• Análisis del marco jurídico del Tratado de 1904 y la mediterraneidad.",
  valoracion:
    "• Reflexión ética sobre el heroísmo ciudadano y el valor de los recursos naturales estratégicos.\n• Debate grupal sobre la resolución pacífica de controversias internacionales.",
  produccion:
    "• Elaboración de un mapa cartográfico comparativo de pérdidas territoriales.\n• Redacción de un micro-ensayo argumentativo sobre la reintegración marítima.",
  materialVida: "Periódicos históricos, testimonios locales, archivo documental familiar.",
  materialDigital: "Plataforma Fielding App, proyector multimedia, Google Earth histórico, videos educativos.",
  criterioSer: "Manifiesta respeto por los héroes patrios y muestra empatía cívica.",
  criterioSaber: "Identifica con precisión las fechas, tratados y causas de la pérdida del Litoral.",
  criterioHacer: "Redacta ensayos con rigor metodológico y traza mapas cartográficos detallados.",
  adaptacionCurricular: "Uso de infografías visuales de alto contraste y glosario de términos históricos.",
  producto: "Panel mural interactivo y dossier de ensayos estudiantiles sobre el Litoral.",
  competencia: "Pensamiento histórico, análisis crítico y expresión escrita formal.",
};

const INITIAL_PLAN: PlanClaseTemplate = {
  claseNro: "24",
  docente: "Lic. Ivan Ezequiel Mancilla Copa",
  materia: "Historia de Bolivia",
  grado: "1ro de Secundaria",
  mes: "Septiembre",
  tema: "La Guerra del Pacífico: Antecedentes, Tratado de 1904 e Impacto Territorial",
  objetivo:
    "Desarrollar capacidades de análisis crítico respecto a la invasión del 14 de febrero de 1879 y la defensa heroica del Topáter.",
  competencia: "Argumenta con base en evidencias primarias y secundarias sobre la soberanía territorial.",
  capacidades: "Comprensión lectora de tratados, interpretación de mapas geopolíticos y formulación de hipótesis.",
  actitudesSer: "Responsabilidad cívica, escucha activa y respeto a las opiniones divergentes.",
  indicadoresSaber: "Diferencia las fases del conflicto bélico y ubica las batallas clave en la línea cronológica.",
  indicadoresHacer: "Construye una línea de tiempo secuencial y expone sus conclusiones con rigor histórico.",
  faseInicio:
    "Activación de conocimientos previos mediante la proyección del mapa de Bolivia de 1825. Pregunta dinamizadora: ¿Por qué era vital el puerto de Cobija y Antofagasta?",
  faseAdquisicion:
    "Lectura guiada de partes de guerra y análisis de la proclamación de Eduardo Abaroa. Explicación del impuesto de los 10 centavos y la mediación peruana.",
  faseAplicacion:
    "Trabajo en parejas para completar la matriz causa-efecto del enclaustramiento y elaboración de una ficha técnica de los héroes de Calama.",
  faseEvaluacion:
    "Ronda de preguntas orales metacognitivas y entrega de la línea de tiempo evaluada bajo rúbrica (Saber 45 / Hacer 40).",
  recursos: "Pizarra interactiva, fotocopias de documentos desclasificados, marcadores y cuadernos de apuntes.",
};

const INITIAL_STORE: DemoStoreData = {
  lastSync: "Hoy 14:32",
  alertKeywords: [...DEFAULT_ALERT_KEYWORDS],
  pdcTemplate: INITIAL_PDC,
  planTemplate: INITIAL_PLAN,
  students: [
    {
      id: "STU-1",
      student_username: "est_aliaga.ramos",
      parent_username: "fam_aliaga.ramos",
      full_name: "ALIAGA RAMOS YUSUF ADEL",
      course: "1RO-SEC",
      rude_code: "80730012020261A",
      english_level: "B1-A",
      parent_name: "Familia Aliaga Ramos",
      grades: {
        "HISTORIA DE BOLIVIA": {
          profesor: "Lic. Ivan Ezequiel Mancilla Copa",
          campo: "COMUNIDAD Y SOCIEDAD",
          area: "CIENCIAS SOCIALES",
          t1: { ser: 10, saber: 42, hacer: 38, auto: 5, total: 95 },
          t2: { ser: 10, saber: 40, hacer: 37, auto: 5, total: 92 },
          t3: { ser: 9, saber: 43, hacer: 39, auto: 5, total: 96 },
          final: 94,
          estado: "APROBADO",
        },
        "HISTORIA UNIVERSAL": {
          profesor: "Lic. Ivan Ezequiel Mancilla Copa",
          campo: "COMUNIDAD Y SOCIEDAD",
          area: "CIENCIAS SOCIALES",
          t1: { ser: 10, saber: 40, hacer: 38, auto: 5, total: 93 },
          t2: { ser: 10, saber: 42, hacer: 35, auto: 5, total: 92 },
          t3: { ser: 10, saber: 41, hacer: 38, auto: 5, total: 94 },
          final: 93,
          estado: "APROBADO",
        },
        "LENGUA EXTRANJERA": {
          profesor: "Lic. Ivan Ezequiel Mancilla Copa",
          campo: "COMUNIDAD Y SOCIEDAD",
          area: "COMUNICACIÓN Y LENGUAJES",
          t1: { ser: 10, saber: 42, hacer: 37, auto: 5, total: 94 },
          t2: { ser: 9, saber: 38, hacer: 36, auto: 4, total: 87 },
          t3: { ser: 10, saber: 44, hacer: 38, auto: 5, total: 97 },
          final: 93,
          estado: "APROBADO",
        },
        MATEMATICA: {
          profesor: "Prof. Senit Ariane Salinas",
          campo: "CIENCIA TECNOLOGÍA Y PRODUCCIÓN",
          area: "MATEMÁTICA",
          t1: { ser: 10, saber: 45, hacer: 40, auto: 5, total: 100 },
          t2: { ser: 10, saber: 44, hacer: 39, auto: 5, total: 98 },
          t3: { ser: 10, saber: 45, hacer: 40, auto: 5, total: 100 },
          final: 99,
          estado: "APROBADO",
        },
        LITERATURA: {
          profesor: "Prof. Jorge Antonio Arrázola",
          campo: "COMUNIDAD Y SOCIEDAD",
          area: "COMUNICACIÓN Y LENGUAJES",
          t1: { ser: 10, saber: 44, hacer: 38, auto: 5, total: 97 },
          t2: { ser: 9, saber: 37, hacer: 36, auto: 5, total: 87 },
          t3: { ser: 10, saber: 41, hacer: 38, auto: 5, total: 94 },
          final: 93,
          estado: "APROBADO",
        },
        BIOLOGIA: {
          profesor: "Prof. Rocio Jhessica Calvimontes",
          campo: "VIDA TIERRA TERRITORIO",
          area: "CIENCIAS NATURALES",
          t1: { ser: 10, saber: 38, hacer: 33, auto: 5, total: 86 },
          t2: { ser: 9, saber: 35, hacer: 32, auto: 4, total: 80 },
          t3: { ser: 10, saber: 40, hacer: 37, auto: 5, total: 92 },
          final: 86,
          estado: "APROBADO",
        },
        "FISICA - QUIMICA": {
          profesor: "Prof. Lynda Alejandra López",
          campo: "VIDA TIERRA TERRITORIO",
          area: "CIENCIAS NATURALES",
          t1: { ser: 10, saber: 43, hacer: 40, auto: 4, total: 97 },
          t2: { ser: 10, saber: 41, hacer: 39, auto: 5, total: 95 },
          t3: { ser: 10, saber: 42, hacer: 40, auto: 5, total: 97 },
          final: 96,
          estado: "APROBADO",
        },
        "EDUCACION FISICA": {
          profesor: "Prof. Sharon Lia Rollano",
          campo: "COMUNIDAD Y SOCIEDAD",
          area: "EDUCACIÓN FÍSICA Y DEPORTES",
          t1: { ser: 9, saber: 34, hacer: 34, auto: 5, total: 82 },
          t2: { ser: 9, saber: 35, hacer: 35, auto: 5, total: 84 },
          t3: { ser: 10, saber: 38, hacer: 38, auto: 5, total: 91 },
          final: 86,
          estado: "APROBADO",
        },
        "ARTES PLASTICAS": {
          profesor: "Prof. Daniela Palenque",
          campo: "COMUNIDAD Y SOCIEDAD",
          area: "ARTES PLÁSTICAS Y VISUALES",
          t1: { ser: 10, saber: 44, hacer: 38, auto: 5, total: 97 },
          t2: { ser: 10, saber: 41, hacer: 36, auto: 5, total: 92 },
          t3: { ser: 10, saber: 43, hacer: 39, auto: 5, total: 97 },
          final: 95,
          estado: "APROBADO",
        },
        "EDUCACION MUSICAL": {
          profesor: "Prof. Saul Flores",
          campo: "COMUNIDAD Y SOCIEDAD",
          area: "EDUCACIÓN MUSICAL",
          t1: { ser: 10, saber: 39, hacer: 36, auto: 4, total: 89 },
          t2: { ser: 10, saber: 40, hacer: 35, auto: 4, total: 89 },
          t3: { ser: 10, saber: 42, hacer: 38, auto: 5, total: 95 },
          final: 91,
          estado: "APROBADO",
        },
        "VALORES Y RELIGIONES": {
          profesor: "Prof. Lorena Arancibia",
          campo: "COSMOS Y PENSAMIENTOS",
          area: "VALORES, ESPIRITUALIDAD Y RELIGIONES",
          t1: { ser: 10, saber: 43, hacer: 39, auto: 5, total: 97 },
          t2: { ser: 10, saber: 42, hacer: 38, auto: 5, total: 95 },
          t3: { ser: 10, saber: 44, hacer: 40, auto: 5, total: 99 },
          final: 97,
          estado: "APROBADO",
        },
      },
    },
    {
      id: "STU-2",
      student_username: "est_alba.luciana",
      parent_username: "fam_alba.luciana",
      full_name: "ALBA CANSECO LUCIANA",
      course: "1RO-SEC",
      rude_code: "80730012020262B",
      english_level: "B1-A",
      parent_name: "Familia Alba Canseco",
      grades: {
        "HISTORIA DE BOLIVIA": {
          profesor: "Lic. Ivan Ezequiel Mancilla Copa",
          campo: "COMUNIDAD Y SOCIEDAD",
          area: "CIENCIAS SOCIALES",
          t1: { ser: 10, saber: 44, hacer: 40, auto: 5, total: 99 },
          t2: { ser: 10, saber: 45, hacer: 39, auto: 5, total: 99 },
          t3: { ser: 10, saber: 45, hacer: 40, auto: 5, total: 100 },
          final: 99,
          estado: "APROBADO",
        },
        "HISTORIA UNIVERSAL": {
          profesor: "Lic. Ivan Ezequiel Mancilla Copa",
          campo: "COMUNIDAD Y SOCIEDAD",
          area: "CIENCIAS SOCIALES",
          t1: { ser: 10, saber: 43, hacer: 39, auto: 5, total: 97 },
          t2: { ser: 10, saber: 44, hacer: 38, auto: 5, total: 97 },
          t3: { ser: 10, saber: 44, hacer: 40, auto: 5, total: 99 },
          final: 98,
          estado: "APROBADO",
        },
        MATEMATICA: {
          profesor: "Prof. Senit Ariane Salinas",
          campo: "CIENCIA TECNOLOGÍA Y PRODUCCIÓN",
          area: "MATEMÁTICA",
          t1: { ser: 10, saber: 45, hacer: 40, auto: 5, total: 100 },
          t2: { ser: 10, saber: 44, hacer: 40, auto: 5, total: 99 },
          t3: { ser: 10, saber: 45, hacer: 40, auto: 5, total: 100 },
          final: 100,
          estado: "APROBADO",
        },
        "LENGUA EXTRANJERA": {
          profesor: "Lic. Ivan Ezequiel Mancilla Copa",
          campo: "COMUNIDAD Y SOCIEDAD",
          area: "COMUNICACIÓN Y LENGUAJES",
          t1: { ser: 10, saber: 43, hacer: 39, auto: 5, total: 97 },
          t2: { ser: 10, saber: 44, hacer: 39, auto: 5, total: 98 },
          t3: { ser: 10, saber: 45, hacer: 40, auto: 5, total: 100 },
          final: 98,
          estado: "APROBADO",
        },
        BIOLOGIA: {
          profesor: "Prof. Rocio Jhessica Calvimontes",
          campo: "VIDA TIERRA TERRITORIO",
          area: "CIENCIAS NATURALES",
          t1: { ser: 10, saber: 42, hacer: 38, auto: 5, total: 95 },
          t2: { ser: 10, saber: 43, hacer: 38, auto: 5, total: 96 },
          t3: { ser: 10, saber: 44, hacer: 39, auto: 5, total: 98 },
          final: 96,
          estado: "APROBADO",
        },
        "VALORES Y RELIGIONES": {
          profesor: "Prof. Lorena Arancibia",
          campo: "COSMOS Y PENSAMIENTOS",
          area: "VALORES, ESPIRITUALIDAD Y RELIGIONES",
          t1: { ser: 10, saber: 44, hacer: 39, auto: 5, total: 98 },
          t2: { ser: 10, saber: 44, hacer: 39, auto: 5, total: 98 },
          t3: { ser: 10, saber: 45, hacer: 40, auto: 5, total: 100 },
          final: 99,
          estado: "APROBADO",
        },
      },
    },
    {
      id: "STU-3",
      student_username: "est_benavides.mateo",
      parent_username: "fam_benavides.mateo",
      full_name: "BENAVIDES CASTRO MATEO",
      course: "1RO-SEC",
      rude_code: "80730012020263C",
      english_level: "A2-B",
      parent_name: "Familia Benavides Castro",
      grades: {
        "HISTORIA DE BOLIVIA": {
          profesor: "Lic. Ivan Ezequiel Mancilla Copa",
          campo: "COMUNIDAD Y SOCIEDAD",
          area: "CIENCIAS SOCIALES",
          t1: { ser: 7, saber: 25, hacer: 24, auto: 3, total: 59 },
          t2: { ser: 8, saber: 28, hacer: 26, auto: 3, total: 65 },
          t3: { ser: 7, saber: 27, hacer: 25, auto: 3, total: 62 },
          final: 62,
          estado: "APROBADO",
        },
        "HISTORIA UNIVERSAL": {
          profesor: "Lic. Ivan Ezequiel Mancilla Copa",
          campo: "COMUNIDAD Y SOCIEDAD",
          area: "CIENCIAS SOCIALES",
          t1: { ser: 7, saber: 22, hacer: 21, auto: 3, total: 53 },
          t2: { ser: 7, saber: 24, hacer: 22, auto: 3, total: 56 },
          t3: { ser: 8, saber: 25, hacer: 24, auto: 3, total: 60 },
          final: 56,
          estado: "APROBADO",
        },
        MATEMATICA: {
          profesor: "Prof. Senit Ariane Salinas",
          campo: "CIENCIA TECNOLOGÍA Y PRODUCCIÓN",
          area: "MATEMÁTICA",
          t1: { ser: 6, saber: 20, hacer: 18, auto: 2, total: 46 },
          t2: { ser: 6, saber: 21, hacer: 19, auto: 2, total: 48 },
          t3: { ser: 7, saber: 20, hacer: 19, auto: 3, total: 49 },
          final: 48,
          estado: "REPROBADO",
        },
        BIOLOGIA: {
          profesor: "Prof. Rocio Jhessica Calvimontes",
          campo: "VIDA TIERRA TERRITORIO",
          area: "CIENCIAS NATURALES",
          t1: { ser: 8, saber: 27, hacer: 25, auto: 3, total: 63 },
          t2: { ser: 8, saber: 28, hacer: 26, auto: 3, total: 65 },
          t3: { ser: 8, saber: 29, hacer: 26, auto: 4, total: 67 },
          final: 65,
          estado: "APROBADO",
        },
        "VALORES Y RELIGIONES": {
          profesor: "Prof. Lorena Arancibia",
          campo: "COSMOS Y PENSAMIENTOS",
          area: "VALORES, ESPIRITUALIDAD Y RELIGIONES",
          t1: { ser: 8, saber: 30, hacer: 28, auto: 4, total: 70 },
          t2: { ser: 8, saber: 31, hacer: 29, auto: 4, total: 72 },
          t3: { ser: 9, saber: 32, hacer: 30, auto: 4, total: 75 },
          final: 72,
          estado: "APROBADO",
        },
      },
    },
    {
      id: "STU-4",
      student_username: "est_condori.camila",
      parent_username: "fam_condori.camila",
      full_name: "CONDORI FLORES CAMILA",
      course: "2DO-SEC",
      rude_code: "80730012020264D",
      english_level: "B1-B",
      parent_name: "Familia Condori Flores",
      grades: {
        "HISTORIA DE BOLIVIA": {
          profesor: "Lic. Ivan Ezequiel Mancilla Copa",
          campo: "COMUNIDAD Y SOCIEDAD",
          area: "CIENCIAS SOCIALES",
          t1: { ser: 10, saber: 44, hacer: 39, auto: 5, total: 98 },
          t2: { ser: 10, saber: 43, hacer: 38, auto: 5, total: 96 },
          t3: { ser: 10, saber: 45, hacer: 40, auto: 5, total: 100 },
          final: 98,
          estado: "APROBADO",
        },
        MATEMATICA: {
          profesor: "Prof. Senit Ariane Salinas",
          campo: "CIENCIA TECNOLOGÍA Y PRODUCCIÓN",
          area: "MATEMÁTICA",
          t1: { ser: 10, saber: 43, hacer: 38, auto: 5, total: 96 },
          t2: { ser: 10, saber: 42, hacer: 38, auto: 5, total: 95 },
          t3: { ser: 10, saber: 44, hacer: 39, auto: 5, total: 98 },
          final: 96,
          estado: "APROBADO",
        },
        BIOLOGIA: {
          profesor: "Prof. Rocio Jhessica Calvimontes",
          campo: "VIDA TIERRA TERRITORIO",
          area: "CIENCIAS NATURALES",
          t1: { ser: 10, saber: 41, hacer: 37, auto: 5, total: 93 },
          t2: { ser: 10, saber: 42, hacer: 38, auto: 5, total: 95 },
          t3: { ser: 10, saber: 43, hacer: 38, auto: 5, total: 96 },
          final: 95,
          estado: "APROBADO",
        },
        "VALORES Y RELIGIONES": {
          profesor: "Prof. Lorena Arancibia",
          campo: "COSMOS Y PENSAMIENTOS",
          area: "VALORES, ESPIRITUALIDAD Y RELIGIONES",
          t1: { ser: 10, saber: 43, hacer: 38, auto: 5, total: 96 },
          t2: { ser: 10, saber: 44, hacer: 39, auto: 5, total: 98 },
          t3: { ser: 10, saber: 44, hacer: 39, auto: 5, total: 98 },
          final: 97,
          estado: "APROBADO",
        },
      },
    },
    {
      id: "STU-5",
      student_username: "est_gutierrez.lucas",
      parent_username: "fam_gutierrez.lucas",
      full_name: "GUTIERREZ MENDOZA LUCAS",
      course: "2DO-SEC",
      rude_code: "80730012020265E",
      english_level: "A2-A",
      parent_name: "Familia Gutierrez Mendoza",
      grades: {
        "HISTORIA DE BOLIVIA": {
          profesor: "Lic. Ivan Ezequiel Mancilla Copa",
          campo: "COMUNIDAD Y SOCIEDAD",
          area: "CIENCIAS SOCIALES",
          t1: { ser: 8, saber: 32, hacer: 30, auto: 4, total: 74 },
          t2: { ser: 8, saber: 33, hacer: 31, auto: 4, total: 76 },
          t3: { ser: 9, saber: 34, hacer: 32, auto: 4, total: 79 },
          final: 76,
          estado: "APROBADO",
        },
        MATEMATICA: {
          profesor: "Prof. Senit Ariane Salinas",
          campo: "CIENCIA TECNOLOGÍA Y PRODUCCIÓN",
          area: "MATEMÁTICA",
          t1: { ser: 8, saber: 30, hacer: 28, auto: 4, total: 70 },
          t2: { ser: 8, saber: 32, hacer: 30, auto: 4, total: 74 },
          t3: { ser: 9, saber: 33, hacer: 31, auto: 4, total: 77 },
          final: 74,
          estado: "APROBADO",
        },
        BIOLOGIA: {
          profesor: "Prof. Rocio Jhessica Calvimontes",
          campo: "VIDA TIERRA TERRITORIO",
          area: "CIENCIAS NATURALES",
          t1: { ser: 9, saber: 34, hacer: 31, auto: 4, total: 78 },
          t2: { ser: 9, saber: 35, hacer: 32, auto: 4, total: 80 },
          t3: { ser: 9, saber: 36, hacer: 33, auto: 4, total: 82 },
          final: 80,
          estado: "APROBADO",
        },
        "VALORES Y RELIGIONES": {
          profesor: "Prof. Lorena Arancibia",
          campo: "COSMOS Y PENSAMIENTOS",
          area: "VALORES, ESPIRITUALIDAD Y RELIGIONES",
          t1: { ser: 9, saber: 36, hacer: 33, auto: 4, total: 82 },
          t2: { ser: 9, saber: 37, hacer: 34, auto: 4, total: 84 },
          t3: { ser: 9, saber: 38, hacer: 35, auto: 5, total: 87 },
          final: 84,
          estado: "APROBADO",
        },
      },
    },
    {
      id: "STU-6",
      student_username: "est_flores.sofia",
      parent_username: "fam_flores.sofia",
      full_name: "FLORES VARGAS SOFIA",
      course: "4TO-PRIM",
      rude_code: "80730012020266F",
      english_level: "STARTERS-2",
      parent_name: "Familia Flores Vargas",
      grades: {
        "COMUNICACION Y LENGUAJES": {
          profesor: "Prof. Maria Elena Morales",
          campo: "COMUNIDAD Y SOCIEDAD",
          area: "COMUNICACIÓN Y LENGUAJES",
          t1: { ser: 10, saber: 45, hacer: 40, auto: 5, total: 100 },
          t2: { ser: 10, saber: 44, hacer: 39, auto: 5, total: 98 },
          t3: { ser: 10, saber: 45, hacer: 40, auto: 5, total: 100 },
          final: 99,
          estado: "APROBADO",
        },
        MATEMATICA: {
          profesor: "Prof. Maria Elena Morales",
          campo: "CIENCIA TECNOLOGÍA Y PRODUCCIÓN",
          area: "MATEMÁTICA",
          t1: { ser: 10, saber: 43, hacer: 39, auto: 5, total: 97 },
          t2: { ser: 10, saber: 44, hacer: 39, auto: 5, total: 98 },
          t3: { ser: 10, saber: 45, hacer: 40, auto: 5, total: 100 },
          final: 98,
          estado: "APROBADO",
        },
        "CIENCIAS NATURALES": {
          profesor: "Prof. Maria Elena Morales",
          campo: "VIDA TIERRA TERRITORIO",
          area: "CIENCIAS NATURALES",
          t1: { ser: 10, saber: 43, hacer: 38, auto: 5, total: 96 },
          t2: { ser: 10, saber: 43, hacer: 39, auto: 5, total: 97 },
          t3: { ser: 10, saber: 44, hacer: 39, auto: 5, total: 98 },
          final: 97,
          estado: "APROBADO",
        },
        "VALORES Y RELIGIONES": {
          profesor: "Prof. Lorena Arancibia",
          campo: "COSMOS Y PENSAMIENTOS",
          area: "VALORES, ESPIRITUALIDAD Y RELIGIONES",
          t1: { ser: 10, saber: 44, hacer: 39, auto: 5, total: 98 },
          t2: { ser: 10, saber: 44, hacer: 39, auto: 5, total: 98 },
          t3: { ser: 10, saber: 45, hacer: 40, auto: 5, total: 100 },
          final: 99,
          estado: "APROBADO",
        },
      },
    },
    {
      id: "STU-7",
      student_username: "est_perez.alejandro",
      parent_username: "fam_perez.alejandro",
      full_name: "PEREZ GOMEZ ALEJANDRO",
      course: "4TO-PRIM",
      rude_code: "80730012020267G",
      english_level: "STARTERS-1",
      parent_name: "Familia Perez Gomez",
      grades: {
        "COMUNICACION Y LENGUAJES": {
          profesor: "Prof. Maria Elena Morales",
          campo: "COMUNIDAD Y SOCIEDAD",
          area: "COMUNICACIÓN Y LENGUAJES",
          t1: { ser: 8, saber: 34, hacer: 32, auto: 4, total: 78 },
          t2: { ser: 8, saber: 35, hacer: 33, auto: 4, total: 80 },
          t3: { ser: 9, saber: 36, hacer: 34, auto: 4, total: 83 },
          final: 80,
          estado: "APROBADO",
        },
        MATEMATICA: {
          profesor: "Prof. Maria Elena Morales",
          campo: "CIENCIA TECNOLOGÍA Y PRODUCCIÓN",
          area: "MATEMÁTICA",
          t1: { ser: 8, saber: 33, hacer: 31, auto: 4, total: 76 },
          t2: { ser: 9, saber: 35, hacer: 32, auto: 4, total: 80 },
          t3: { ser: 9, saber: 37, hacer: 34, auto: 5, total: 85 },
          final: 80,
          estado: "APROBADO",
        },
        "CIENCIAS NATURALES": {
          profesor: "Prof. Maria Elena Morales",
          campo: "VIDA TIERRA TERRITORIO",
          area: "CIENCIAS NATURALES",
          t1: { ser: 9, saber: 36, hacer: 33, auto: 4, total: 82 },
          t2: { ser: 9, saber: 37, hacer: 34, auto: 4, total: 84 },
          t3: { ser: 9, saber: 38, hacer: 35, auto: 5, total: 87 },
          final: 84,
          estado: "APROBADO",
        },
        "VALORES Y RELIGIONES": {
          profesor: "Prof. Lorena Arancibia",
          campo: "COSMOS Y PENSAMIENTOS",
          area: "VALORES, ESPIRITUALIDAD Y RELIGIONES",
          t1: { ser: 9, saber: 38, hacer: 35, auto: 5, total: 87 },
          t2: { ser: 9, saber: 39, hacer: 36, auto: 5, total: 89 },
          t3: { ser: 10, saber: 40, hacer: 37, auto: 5, total: 92 },
          final: 89,
          estado: "APROBADO",
        },
      },
    },
  ],
  assignments: [
    {
      course: "1RO-SEC",
      subject: "HISTORIA UNIVERSAL",
      drive_url: "https://docs.google.com/spreadsheets/d/1historia_univ_1sec_fielding/edit",
      last_sync: "Hoy 14:32 (hace 18 min)",
      students_count: 28,
    },
    {
      course: "2DO-SEC",
      subject: "HISTORIA DE BOLIVIA",
      drive_url: "https://docs.google.com/spreadsheets/d/1historia_bolivia_2sec_fielding/edit",
      last_sync: "Hoy 14:15 (hace 35 min)",
      students_count: 26,
    },
    {
      course: "1RO-SEC",
      subject: "INGLÉS B1-A",
      drive_url: "https://docs.google.com/spreadsheets/d/1ingles_b1a_fielding/edit",
      last_sync: "Hoy 11:20 (hace 3 h)",
      students_count: 24,
    },
    {
      course: "1RO-SEC",
      subject: "HISTORIA DE BOLIVIA",
      drive_url: "https://docs.google.com/spreadsheets/d/1historia_bolivia_1sec_fielding/edit",
      last_sync: "Ayer 18:40",
      students_count: 28,
    },
  ],
  tasks: [
    {
      id: "TSK-101",
      course: "1RO-SEC",
      subject: "HISTORIA DE BOLIVIA",
      teacher: "Lic. Ivan Ezequiel Mancilla Copa",
      title: "Ensayo Histórico: Las Causas y Efectos de la Guerra del Pacífico",
      description:
        "Presentar un análisis de 3 páginas sobre el impacto territorial y económico en Bolivia. Se evaluará dimensión SABER (análisis crítico) y HACER (redacción y fuentes).",
      dueDate: "2026-11-28",
      type: "TAREA",
      createdAt: "2026-11-20",
    },
    {
      id: "TSK-102",
      course: "1RO-SEC",
      subject: "HISTORIA UNIVERSAL",
      teacher: "Lic. Ivan Ezequiel Mancilla Copa",
      title: "Evaluación Escrita: La Revolución Industrial y Nuevas Ideologías",
      description:
        "Examen presencial de 45 puntos cubriendo fases I y II de la Revolución Industrial, surgimiento del proletariado y cambios socioeconómicos.",
      dueDate: "2026-12-02",
      type: "EXAMEN",
      createdAt: "2026-11-21",
    },
    {
      id: "TSK-103",
      course: "1RO-SEC",
      subject: "INGLÉS B1-A",
      teacher: "Lic. Ivan Ezequiel Mancilla Copa",
      title: "Oral Presentation: Past Experiences and Travel Diary",
      description:
        "Presentación en parejas de 4 minutos utilizando Past Continuous y Present Perfect. Traer diapositivas o póster visual.",
      dueDate: "2026-11-30",
      type: "TAREA",
      createdAt: "2026-11-22",
    },
    {
      id: "TSK-104",
      course: "1RO-SEC",
      subject: "INSTITUCIONAL",
      teacher: "Dirección General - Fielding",
      title: "Feria de Ciencia, Tecnología y Producción Fielding 2026",
      description:
        "Presentación de stands interactivos en el coliseo central. Asistencia con uniforme de gala.",
      dueDate: "2026-12-05",
      type: "EVENTO",
      createdAt: "2026-11-19",
    },
  ],
  announcements: [
    {
      id: "ANN-1",
      title: "Cierre Trimestral y Publicación Oficial de Boletines",
      content:
        "Se informa a la comunidad de padres de familia que los boletines del tercer trimestre y promedios finales estarán disponibles para descarga e impresión formal a partir del 1 de diciembre.",
      date: "23 Nov 2026",
      priority: "ALTA",
      author: "Dirección General - Ing. José Mariano Pinaya",
      targetRole: "TODOS",
      active: true,
    },
    {
      id: "ANN-2",
      title: "Cronograma de Entrevistas Pedagógicas Virtuales (Google Meet)",
      content:
        "Los docentes titulares han habilitado horarios de atención virtual para la revisión de cuadernos y seguimiento del aprovechamiento escolar.",
      date: "22 Nov 2026",
      priority: "MEDIA",
      author: "Lic. Ivan Ezequiel Mancilla Copa",
      targetRole: "PADRES",
      active: true,
    },
    {
      id: "ANN-3",
      title: "Capacitación Docente en Sistema SIGED y PDCs 2026",
      content:
        "Reunión técnica presencial para todo el cuerpo docente este viernes a las 16:00 en la sala audiovisual.",
      date: "20 Nov 2026",
      priority: "GENERAL",
      author: "Dirección Académica",
      targetRole: "DOCENTES",
      active: true,
    },
  ],
  messages: [
    {
      id: "MSG-1",
      threadId: "TH-ALIAGA-MANCILLA",
      senderRole: "parent",
      senderName: "Familia Aliaga Ramos",
      recipientName: "Lic. Ivan Ezequiel Mancilla Copa",
      teacherName: "Lic. Ivan Ezequiel Mancilla Copa",
      course: "1RO-SEC",
      text: "Buenas tardes Lic. Mancilla, quisiéramos saber si Yusuf presentó el avance de su ensayo de Historia de Bolivia.",
      timestamp: "Ayer 15:30",
      hasAlert: false,
    },
    {
      id: "MSG-2",
      threadId: "TH-ALIAGA-MANCILLA",
      senderRole: "teacher",
      senderName: "Lic. Ivan Ezequiel Mancilla Copa",
      recipientName: "Familia Aliaga Ramos",
      teacherName: "Lic. Ivan Ezequiel Mancilla Copa",
      course: "1RO-SEC",
      text: "Buenas tardes estimada familia Aliaga. Sí, Yusuf presentó un excelente esquema de fuentes primarias. Va muy bien en el desglose de Saber y Hacer.",
      timestamp: "Ayer 16:10",
      hasAlert: false,
    },
    {
      id: "MSG-3",
      threadId: "TH-BENAVIDES-MANCILLA",
      senderRole: "parent",
      senderName: "Familia Benavides Castro",
      recipientName: "Lic. Ivan Ezequiel Mancilla Copa",
      teacherName: "Lic. Ivan Ezequiel Mancilla Copa",
      course: "1RO-SEC",
      text: "Profesor, tenemos una queja urgente sobre la falta de tiempo en el último examen de Mateo.",
      timestamp: "Hoy 09:15",
      hasAlert: true,
      alertKeyword: "URGENTE",
    },
    {
      id: "MSG-4",
      threadId: "TH-FLORES-MORALES",
      senderRole: "parent",
      senderName: "Familia Flores Vargas",
      recipientName: "Prof. Maria Elena Morales",
      teacherName: "Prof. Maria Elena Morales",
      course: "4TO-PRIM",
      text: "Buen día profesora María Elena, confirmamos que Sofía llevará los materiales para la feria de ciencias.",
      timestamp: "Hoy 10:12",
      hasAlert: false,
    },
    {
      id: "MSG-5",
      threadId: "TH-ALIAGA-MANCILLA",
      senderRole: "parent",
      senderName: "Familia Aliaga Ramos",
      recipientName: "Lic. Ivan Ezequiel Mancilla Copa",
      teacherName: "Lic. Ivan Ezequiel Mancilla Copa",
      course: "1RO-SEC",
      text: "Muchas gracias profesor. Solicitamos una breve reunión por Google Meet para coordinar el reforzamiento final.",
      timestamp: "Hoy 10:45",
      hasAlert: false,
    },
  ],
  interviews: [
    {
      id: "MEET-1",
      teacherName: "Lic. Ivan Ezequiel Mancilla Copa",
      parentName: "Familia Aliaga Ramos",
      studentName: "Aliaga Ramos Yusuf Adel",
      course: "1RO-SEC",
      date: "2026-11-26",
      time: "16:30",
      reason: "Seguimiento pedagógico y proyección a olimpiadas de historia",
      status: "PROGRAMADA",
      meetCode: "meet.google.com/fld-educ-dem",
      meetLink: "https://meet.google.com/new",
      createdAt: "2026-11-22",
    },
    {
      id: "MEET-2",
      teacherName: "Lic. Ivan Ezequiel Mancilla Copa",
      parentName: "Familia Benavides Castro",
      studentName: "Benavides Castro Mateo",
      course: "1RO-SEC",
      date: "2026-11-27",
      time: "17:15",
      reason: "Plan de reforzamiento y nivelación de competencias",
      status: "PROGRAMADA",
      meetCode: "meet.google.com/fld-matv-ref",
      meetLink: "https://meet.google.com/new",
      createdAt: "2026-11-23",
    },
    {
      id: "MEET-3",
      teacherName: "Prof. Maria Elena Morales",
      parentName: "Familia Flores Vargas",
      studentName: "Flores Vargas Sofia",
      course: "4TO-PRIM",
      date: "2026-11-24",
      time: "15:00",
      reason: "Revisión de cuadernos y cuadro de honor",
      status: "COMPLETADA",
      meetCode: "meet.google.com/fld-prim-sof",
      meetLink: "https://meet.google.com/new",
      createdAt: "2026-11-18",
    },
  ],
};

const STORAGE_KEY = "fielding_demo_store_v3";

export function getStoredData(): DemoStoreData {
  if (typeof window === "undefined") return INITIAL_STORE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STORE));
      return INITIAL_STORE;
    }
    const parsed = JSON.parse(raw) as Partial<DemoStoreData>;
    return {
      ...INITIAL_STORE,
      ...parsed,
      alertKeywords: parsed.alertKeywords || INITIAL_STORE.alertKeywords,
      pdcTemplate: parsed.pdcTemplate || INITIAL_STORE.pdcTemplate,
      planTemplate: parsed.planTemplate || INITIAL_STORE.planTemplate,
    };
  } catch (e) {
    console.error("Error reading fielding_demo_store:", e);
    return INITIAL_STORE;
  }
}

export function saveStoredData(data: DemoStoreData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("fielding_store_updated"));
  } catch (e) {
    console.error("Error saving fielding_demo_store:", e);
  }
}

export function useDemoStore() {
  const [data, setData] = useState<DemoStoreData>(INITIAL_STORE);
  const [mounted, setMounted] = useState(false);

  const reload = useCallback(() => {
    setData(getStoredData());
  }, []);

  useEffect(() => {
    setMounted(true);
    reload();

    const handleCustom = () => reload();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) reload();
    };

    window.addEventListener("fielding_store_updated", handleCustom);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("fielding_store_updated", handleCustom);
      window.removeEventListener("storage", handleStorage);
    };
  }, [reload]);

  const addMessage = useCallback(
    (msg: Omit<DirectMessage, "id" | "timestamp" | "hasAlert" | "alertKeyword" | "teacherName"> & { teacherName?: string }) => {
      const current = getStoredData();
      const alertInfo = checkSensitiveAlert(msg.text, current.alertKeywords);
      const inferredTeacher =
        msg.teacherName ||
        (msg.senderRole === "teacher" ? msg.senderName : msg.recipientName);
      const newMsg: DirectMessage = {
        ...msg,
        teacherName: inferredTeacher,
        id: "MSG-" + Date.now(),
        timestamp:
          "Hoy " +
          new Date().toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" }),
        hasAlert: alertInfo.hasAlert,
        alertKeyword: alertInfo.keyword,
      };
      const updated: DemoStoreData = {
        ...current,
        messages: [...current.messages, newMsg],
      };
      saveStoredData(updated);
      return newMsg;
    },
    []
  );

  const addAlertKeyword = useCallback((keyword: string) => {
    const clean = keyword.trim().toLowerCase();
    if (!clean) return;
    const current = getStoredData();
    if (current.alertKeywords.includes(clean)) return;
    const nextKeywords = [...current.alertKeywords, clean];
    const updatedMessages = current.messages.map((m) => {
      const alertInfo = checkSensitiveAlert(m.text, nextKeywords);
      return { ...m, hasAlert: alertInfo.hasAlert, alertKeyword: alertInfo.keyword };
    });
    saveStoredData({
      ...current,
      alertKeywords: nextKeywords,
      messages: updatedMessages,
    });
  }, []);

  const removeAlertKeyword = useCallback((keyword: string) => {
    const current = getStoredData();
    const nextKeywords = current.alertKeywords.filter((k) => k !== keyword);
    const updatedMessages = current.messages.map((m) => {
      const alertInfo = checkSensitiveAlert(m.text, nextKeywords);
      return { ...m, hasAlert: alertInfo.hasAlert, alertKeyword: alertInfo.keyword };
    });
    saveStoredData({
      ...current,
      alertKeywords: nextKeywords,
      messages: updatedMessages,
    });
  }, []);

  const addTask = useCallback((task: Omit<TaskItem, "id" | "createdAt">) => {
    const current = getStoredData();
    const newTask: TaskItem = {
      ...task,
      id: "TSK-" + Date.now(),
      createdAt: new Date().toISOString().split("T")[0],
    };
    saveStoredData({
      ...current,
      tasks: [newTask, ...current.tasks],
    });
    return newTask;
  }, []);

  const addMeetInterview = useCallback(
    (meet: Omit<MeetInterview, "id" | "createdAt" | "status" | "meetLink" | "meetCode">) => {
      const current = getStoredData();
      const roomCode = generateMeetRoomCode();
      const newMeet: MeetInterview = {
        ...meet,
        id: "MEET-" + Date.now(),
        createdAt: new Date().toISOString().split("T")[0],
        status: "PROGRAMADA",
        meetCode: `meet.google.com/${roomCode}`,
        meetLink: "https://meet.google.com/new",
      };
      saveStoredData({
        ...current,
        interviews: [newMeet, ...current.interviews],
      });
      return newMeet;
    },
    []
  );

  const updateMeetStatus = useCallback(
    (id: string, status: "PROGRAMADA" | "COMPLETADA" | "CANCELADA") => {
      const current = getStoredData();
      saveStoredData({
        ...current,
        interviews: current.interviews.map((m) => (m.id === id ? { ...m, status } : m)),
      });
    },
    []
  );

  const addAnnouncement = useCallback((ann: Omit<AnnouncementItem, "id" | "date" | "active">) => {
    const current = getStoredData();
    const now = new Date();
    const dateStr = now.toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const newAnn: AnnouncementItem = {
      ...ann,
      id: "ANN-" + Date.now(),
      date: dateStr,
      active: true,
    };
    saveStoredData({
      ...current,
      announcements: [newAnn, ...current.announcements],
    });
    return newAnn;
  }, []);

  const deleteAnnouncement = useCallback((id: string) => {
    const current = getStoredData();
    saveStoredData({
      ...current,
      announcements: current.announcements.filter((a) => a.id !== id),
    });
  }, []);

  const syncDrive = useCallback((courseSubject?: string) => {
    const current = getStoredData();
    const nowStr =
      "Hoy " +
      new Date().toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" }) +
      " (en vivo)";
    saveStoredData({
      ...current,
      lastSync: nowStr,
      assignments: current.assignments.map((a) => {
        if (!courseSubject || `${a.course} ${a.subject}` === courseSubject) {
          return { ...a, last_sync: nowStr };
        }
        return a;
      }),
    });
  }, []);

  const updatePdcTemplate = useCallback((patch: Partial<PdcTemplate>) => {
    const current = getStoredData();
    saveStoredData({
      ...current,
      pdcTemplate: { ...current.pdcTemplate, ...patch },
    });
  }, []);

  const updatePlanTemplate = useCallback((patch: Partial<PlanClaseTemplate>) => {
    const current = getStoredData();
    saveStoredData({
      ...current,
      planTemplate: { ...current.planTemplate, ...patch },
    });
  }, []);

  const resetToDefault = useCallback(() => {
    saveStoredData(INITIAL_STORE);
  }, []);

  return {
    mounted,
    data,
    students: data.students,
    assignments: data.assignments,
    tasks: data.tasks,
    announcements: data.announcements,
    messages: data.messages,
    interviews: data.interviews,
    alertKeywords: data.alertKeywords,
    pdcTemplate: data.pdcTemplate,
    planTemplate: data.planTemplate,
    lastSync: data.lastSync,
    addMessage,
    addAlertKeyword,
    removeAlertKeyword,
    addTask,
    addMeetInterview,
    updateMeetStatus,
    addAnnouncement,
    deleteAnnouncement,
    syncDrive,
    updatePdcTemplate,
    updatePlanTemplate,
    resetToDefault,
  };
}
