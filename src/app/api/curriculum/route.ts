import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface PDCRecord {
  materia: string;
  nro_pdc: string;
  distrito: string;
  maestro: string;
  nivel: string;
  asignatura: string;
  unidad_educativa: string;
  mes: string;
  director: string;
  anio_escolaridad: string;
  perfiles_salida: string;
  objetivo_holistico: string;
  contenidos: string;
  practica: string;
  teoria: string;
  valoracion: string;
  produccion: string;
  materiales_vida: string;
  materiales_analogicos: string;
  ser: string;
  saber: string;
  hacer: string;
  adaptacion_curricular: string;
  producto: string;
  competencia: string;
  fecha_emision?: string;
}

export interface ClaseRecord {
  MES: string;
  ANO: string;
  GRADO: string;
  ASIGNATURA: string;
  DOCENTE: string;
  UNIDAD_EDUCATIVA: string;
  DIRECTOR: string;
  OBJETIVO_HOLISTICO: string;
  COMPETENCIA: string;
  CAPACIDADES: string;
  ACTITUDES_SER: string;
  INDICADORES_SABER: string;
  INDICADORES_HACER: string;
  INSTRUMENTOS_EVALUACION: string;
  CLASE_NUM: string;
  TEMA: string;
  FASE_INICIO: string;
  FASE_ADQUISICION: string;
  FASE_APLICACION: string;
  FASE_EVALUACION: string;
  RECURSOS: string;
  EVALUACION_DETALLE: string;
  ADAPTACIONES: string;
}

// Fallback robusto con 2 PDCs y 2 Planes de Clase del Lic. Ivan Mancilla Copa
const FALLBACK_CURRICULUM = {
  generated_at: new Date().toISOString(),
  stats: { pdcs: 2, planes: 2 },
  pdcs: [
    {
      materia: "Historia de Bolivia",
      nro_pdc: "1",
      distrito: "Sucre",
      maestro: "Lic. Ivan Mancilla Copa",
      nivel: "Secundaria",
      asignatura: "Historia de Bolivia",
      unidad_educativa: "Colegio Fielding",
      mes: "Febrero",
      director: "Ing. José Pinaya",
      anio_escolaridad: "1ro de Secundaria",
      perfiles_salida:
        "Reconoce la importancia de la historia como ciencia y sus fuentes. Describe la tradición oral andina y la memoria viva. Relata los métodos de la arqueología y el estudio estratigráfico. Interactúa recolectando fuentes históricas familiares para su exposición.",
      objetivo_holistico:
        "Fortalecemos la identidad personal y familiar en el entorno escolar, comprendiendo la ciencia histórica, la historia oral y la arqueología, mediante la recopilación de objetos y relatos para un Museo Familiar, para promover el autoconocimiento y la valoración de la memoria histórica viva.",
      contenidos:
        "Semana 1: Fuentes Históricas (Ciencia del pasado y clasificación de fuentes). Semana 2: Historia Oral (Tradición andina y memoria viva). Semana 3: Feriado Carnaval. Semana 4: Arqueología (Método estratigráfico y sitios clave).",
      practica:
        "(Clase 1): Entrevistas a familiares sobre la historia personal y reconocimiento de objetos antiguos. (Clase 2): Diálogo en círculo rescatando mitos y leyendas de la tradición oral andina. (Clase 3): Taller arqueológico simulado analizando capas de tierra o imágenes de estratigrafía.",
      teoria:
        "Clasificación de fuentes primarias y secundarias. Explicación de la importancia de la memoria colectiva. Análisis del método arqueológico.",
      valoracion:
        "Valoración del pasado familiar como parte de la historia nacional y respeto por el patrimonio cultural.",
      produccion:
        "Montaje de un Museo Familiar en el aula con objetos históricos y sus fichas descriptivas.",
      materiales_vida: "Objetos antiguos del hogar, fotografías familiares, tierra.",
      materiales_analogicos: "Pizarra, textos de historia básica, videos sobre excavaciones.",
      ser: "Muestra respeto por las historias y tradiciones de sus compañeros.",
      saber: "Identifica los diferentes tipos de fuentes históricas y el rol de la arqueología.",
      hacer: "Organiza un museo en el aula y expone con claridad relatos.",
      adaptacion_curricular:
        "Uso de objetos táctiles y narraciones orales para estudiantes con dificultades de lectura.",
      producto: "Museo Familiar",
      competencia: "Comprensión del tiempo histórico y la metodología de investigación.",
      fecha_emision: "02/02/2026",
    },
    {
      materia: "Historia Universal",
      nro_pdc: "8",
      distrito: "Sucre",
      maestro: "Lic. Ivan Mancilla Copa",
      nivel: "Secundaria",
      asignatura: "Historia Universal",
      unidad_educativa: "Colegio Fielding",
      mes: "Septiembre",
      director: "Ing. José Pinaya",
      anio_escolaridad: "1ro de Secundaria",
      perfiles_salida:
        "Analiza el tránsito de la antigüedad al feudalismo medieval y el rol de la Iglesia en Europa.",
      objetivo_holistico:
        "Fortalecer la responsabilidad y el pensamiento crítico, analizando la transición a la Edad Media, el régimen feudal, la Iglesia y el renacimiento urbano, mediante dictados temáticos, explicaciones orales y tareas de investigación.",
      contenidos:
        "Semana 1: Introducción a la Edad Media y el Feudalismo. Semana 2: La Iglesia y las Cruzadas. Semana 3: El Renacimiento Urbano y el Arte Románico y Gótico.",
      practica:
        "Lectura guiada de fuentes documentales medievales y proyección de videos sobre arquitectura gótica.",
      teoria:
        "Estructura estamental del vasallaje, economía feudal y expansión de los burgos urbanos.",
      valoracion:
        "Reflexión crítica sobre los derechos humanos frente a la servidumbre medieval y apreciación del arte histórico.",
      produccion:
        "Elaboración de un esquema piramidal de la sociedad feudal y fichas de investigación de arte medieval.",
      materiales_vida: "Material gráfico impreso, maquetas de castillos.",
      materiales_analogicos: "Proyector multimedia, textos de Historia Universal, diapositivas.",
      ser: "Demuestra honestidad académica y respeto en el debate.",
      saber: "Explica las fases del feudalismo y la influencia de las Cruzadas.",
      hacer: "Construye esquemas de vasallaje y resuelve cuestionarios estructurados.",
      adaptacion_curricular:
        "Guías visuales simplificadas con apoyatura de glosario medieval.",
      producto: "Álbum Histórico Medieval",
      competencia: "Pensamiento crítico sobre las instituciones del medioevo.",
      fecha_emision: "01/09/2026",
    },
  ],
  planes: [
    {
      MES: "Septiembre",
      ANO: "2026",
      GRADO: "1º de Secundaria",
      ASIGNATURA: "Historia Universal",
      DOCENTE: "Lic. Ivan Ezequiel Mancilla Copa",
      UNIDAD_EDUCATIVA: "Fielding",
      DIRECTOR: "Ing. José Mariano Pinaya",
      OBJETIVO_HOLISTICO:
        "Fortalecer la responsabilidad y el pensamiento crítico, analizando la transición a la Edad Media, el régimen feudal, la Iglesia y el renacimiento urbano, mediante dictados temáticos, explicaciones orales, videos interactivos y tareas de investigación, para comprender la dinámica sociocultural del mundo medieval.",
      COMPETENCIA:
        "Analiza las estructuras sociopolíticas, económicas y culturales de la Europa medieval comparando el régimen feudal y el desarrollo urbano con sentido crítico.",
      CAPACIDADES:
        "• Comprende el funcionamiento del vasallaje y la sociedad estamental. • Identifica las causas e impacto de las Cruzadas. • Compara las manifestaciones arquitectónicas del arte románico y gótico.",
      ACTITUDES_SER:
        "• Disciplina y puntualidad en la toma de dictados. • Respeto mutuo durante las evaluaciones orales. • Honestidad y pulcritud académica.",
      INDICADORES_SABER:
        "Explica la periodización medieval, la caída de Roma y el surgimiento de las relaciones de vasallaje.",
      INDICADORES_HACER:
        "Registra el dictado en su carpeta y elabora el diagrama de vasallaje en su archivador.",
      INSTRUMENTOS_EVALUACION:
        "Carpetas de dictados, archivadores de investigación, pruebas escritas estructuradas y rúbricas de evaluación oral.",
      CLASE_NUM: "1",
      TEMA: "Introducción a la Edad Media y el Feudalismo",
      FASE_INICIO:
        "• Activación de saberes previos sobre la caída del Imperio Romano. • Pregunta problematizadora: ¿Por qué la fragmentación del poder dio origen a los señores feudales?",
      FASE_ADQUISICION:
        "• Dictado ordenado del tema en la carpeta de aula. • Explicación oral detallada sobre el feudo y el pacto de vasallaje. • Proyección y análisis de un video interactivo sobre la Europa feudal.",
      FASE_APLICACION:
        "• Evaluación oral individual para verificar la comprensión del contenido dictado. • Asignación de la tarea de investigación: Investigar el pacto de vasallaje y elaborar un diagrama con obligaciones mutuas.",
      FASE_EVALUACION:
        "• Registro de la participación en la evaluación oral y verificación del dictado en carpeta.",
      RECURSOS:
        "Pizarra, proyector multimedia, video interactivo, carpeta de aula, hojas para archivador.",
      EVALUACION_DETALLE:
        "Registro cualitativo de la evaluación oral y lista de cotejo del dictado en carpeta.",
      ADAPTACIONES:
        "Dosificación de la velocidad del dictado con apoyo visual en pizarra y acompañamiento personalizado en tareas de investigación.",
    },
    {
      MES: "Septiembre",
      ANO: "2026",
      GRADO: "1º de Secundaria",
      ASIGNATURA: "Historia de Bolivia",
      DOCENTE: "Lic. Ivan Ezequiel Mancilla Copa",
      UNIDAD_EDUCATIVA: "Fielding",
      DIRECTOR: "Ing. José Mariano Pinaya",
      OBJETIVO_HOLISTICO:
        "Promover la identidad plurinacional mediante el análisis de las culturas prehispánicas andinas y de tierras bajas, a través de debates y cartografía histórica, valorando la cosmovisión originaria.",
      COMPETENCIA:
        "Identifica y describe los aportes organizativos, tecnológicos y agrícolas de Tiwanaku y los señoríos aymaras.",
      CAPACIDADES:
        "• Localiza geográficamente los pisos ecológicos andinos. • Comprende la técnica de los camellones o suka kollus.",
      ACTITUDES_SER:
        "• Participación activa y respeto por los saberes ancestrales.",
      INDICADORES_SABER:
        "Describe las fases de desarrollo de Tiwanaku y su arquitectura lítica.",
      INDICADORES_HACER:
        "Dibuja y esquematiza en su cuaderno la Puerta del Sol y los pisos ecológicos.",
      INSTRUMENTOS_EVALUACION:
        "Rúbrica de mapa conceptual, cuaderno de notas y evaluación escrita.",
      CLASE_NUM: "2",
      TEMA: "La Civilización de Tiwanaku y el Manejo de Pisos Ecológicos",
      FASE_INICIO:
        "• Diálogo inicial sobre monumentos arqueológicos de La Paz y el lago Titicaca.",
      FASE_ADQUISICION:
        "• Explicación magistral con apoyo de diapositivas sobre la agricultura de altura y la lítica tiwanakota.",
      FASE_APLICACION:
        "• Taller práctico de reconstrucción gráfica de un camellón o suka kollu en equipos.",
      FASE_EVALUACION:
        "• Revisión del esquema gráfico y síntesis oral grupal.",
      RECURSOS:
        "Mapas de Bolivia, láminas arqueológicas, pizarra y marcadores.",
      EVALUACION_DETALLE:
        "Evaluación formativa del trabajo en equipo y precisión cartográfica.",
      ADAPTACIONES:
        "Lecturas complementarias con tipografía ampliada e ilustraciones contextuales.",
    },
  ],
};

export async function GET() {
  const startTime = Date.now();
  try {
    const filePath = path.join(process.cwd(), "public", "seed", "fielding_curriculum_seed.json");

    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8");
      const json = JSON.parse(raw);
      const latencyMs = Date.now() - startTime;

      return NextResponse.json(
        {
          ...json,
          _meta: {
            latencyMs,
            source: "disk",
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
    }

    // Si no existe, devolvemos el fallback integrado
    const latencyMs = Date.now() - startTime;
    return NextResponse.json(
      {
        ...FALLBACK_CURRICULUM,
        _meta: {
          latencyMs,
          source: "fallback",
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
  } catch (err: any) {
    return NextResponse.json(
      {
        ...FALLBACK_CURRICULUM,
        _meta: {
          error: err?.message,
          source: "fallback_on_error",
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "Content-Type": "application/json",
        },
      }
    );
  }
}
