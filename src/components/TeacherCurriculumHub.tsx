"use client";

import React, { useState } from "react";
import {
  FileText,
  BookOpen,
  Printer,
  Sparkles,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useDemoStore } from "@/lib/demoStore";

export default function TeacherCurriculumHub() {
  const { pdcTemplate, planTemplate, updatePdcTemplate, updatePlanTemplate } = useDemoStore();
  const [activeMode, setActiveMode] = useState<"pdc" | "planes">("pdc");

  // Filtros sincronizados con la plantilla activa en localStorage
  const activeDoc = activeMode === "pdc" ? pdcTemplate : planTemplate;
  const materia = activeDoc.materia;
  const grado = activeDoc.grado;
  const mes = activeDoc.mes;
  const tema = activeDoc.tema;

  const setFilter = (field: "materia" | "grado" | "mes" | "tema", value: string) => {
    updatePdcTemplate({ [field]: value });
    updatePlanTemplate({ [field]: value });
  };

  // Estado de Generación IA (Demo progresivo de 1.2s)
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [aiGenerated, setAiGenerated] = useState(false);

  const handleGenerateAI = () => {
    setIsGenerating(true);
    setAiGenerated(false);
    setGenerationStep("1/3 Analizando lineamientos curriculares del SEP Bolivia...");

    setTimeout(() => {
      setGenerationStep("2/3 Articulando objetivo holístico con dimensiones SER, SABER, HACER, DECIDIR...");
    }, 400);

    setTimeout(() => {
      setGenerationStep("3/3 Estructurando orientaciones metodológicas, recursos y criterios...");
    }, 800);

    setTimeout(() => {
      setIsGenerating(false);
      setAiGenerated(true);

      const isEnglish = materia.toLowerCase().includes("inglés") || materia.toLowerCase().includes("ingles");

      if (activeMode === "pdc") {
        updatePdcTemplate({
          nroPdc: `0${Math.floor(Math.random() * 8) + 1}/2026`,
          perfilesSalida: isEnglish
            ? `Comprende y produce textos orales y escritos en inglés nivel MCER sobre "${tema}", interactuando con fluidez en situaciones comunicativas reales (${grado}).`
            : `Demuestra dominio analítico y crítico sobre "${tema}" en ${materia} (${grado}), aplicando el enfoque sociocomunitario productivo.`,
          objetivoHolistico: isEnglish
            ? `Fortalecemos la empatía intercultural y confianza expresiva (SER), apropiándonos de estructuras gramaticales y vocabulario clave en torno a "${tema}" (SABER), mediante diálogos guiados, role-plays y redacción creativa (HACER), para comunicarnos de forma efectiva en contextos globales (DECIDIR).`
            : `Fortalecemos la conciencia crítica y comunitaria (SER), investigando a profundidad los aspectos fundamentales de "${tema}" (SABER), mediante la producción colaborativa de informes, mapas y esquemas explicativos (HACER), para transformar la realidad social de nuestro entorno escolar (DECIDIR).`,
          contenidos: isEnglish
            ? `1. Core Vocabulary & Contextual Expressions: ${tema}.\n2. Functional Grammar Structures in real-life dialogues.\n3. Listening & Reading comprehension workshop.\n4. Guided Speaking & Written production task.`
            : `1. Marco introductorio y conceptualización de ${tema}.\n2. Análisis de antecedentes, causas y contextos clave.\n3. Impacto y relevancia contemporánea en Bolivia y el mundo.\n4. Propuestas y conclusiones reflexivas del estudiantado.`,
          practica: isEnglish
            ? `• Warm-up comunicativo con tarjetas visuales y audio auténtico sobre "${tema}".\n• Lluvia de ideas en parejas activando vocabulario previo.`
            : `• Observación directa y diálogo comunitario problematizador sobre "${tema}".\n• Recuperación de saberes locales y formulación de hipótesis en equipo.`,
          teoria: isEnglish
            ? `• Sistematización guiada de reglas gramaticales y pronunciación en pizarra interactiva.\n• Análisis comparativo de modelos textuales auténticos.`
            : `• Conceptualización teórica sustentada en fuentes bibliográficas oficiales del SEP.\n• Sistematización colectiva de conceptos clave y cuadros comparativos.`,
          valoracion: `• Reflexión ética sobre el impacto personal, cultural y social de "${tema}".\n• Autoevaluación y coevaluación del trabajo colaborativo en aula.`,
          produccion: isEnglish
            ? `• Presentación oral grabada / diálogo escenificado y redacción de dossier ilustrado sobre "${tema}".`
            : `• Elaboración de producto final tangible: ensayo estructurado, infografía o panel mural sobre "${tema}".`,
          materialVida: "Experiencias cotidianas, artículos de prensa local y archivo comunitario.",
          materialDigital: "Fielding App, proyector multimedia, audios interactivos y recursos Google Workspace.",
          criterioSer: `Demuestra respeto, puntualidad y responsabilidad ética al debatir sobre "${tema}".`,
          criterioSaber: `Explica con precisión conceptual los fundamentos y estructura de "${tema}" en ${materia}.`,
          criterioHacer: `Produce evidencias prácticas originales aplicando metodologías activas y rigor formal.`,
          adaptacionCurricular: "Apoyos visuales escalonados, glosario ilustrado y tiempos flexibles de producción.",
          producto: `Portafolio temático y presentación demostrativa sobre "${tema}" (${mes} 2026).`,
          competencia: `Análisis crítico, resolución colaborativa y comunicación efectiva en ${materia}.`,
        });
      } else {
        updatePlanTemplate({
          claseNro: `${Math.floor(Math.random() * 20) + 10}`,
          objetivo: `Desarrollar el razonamiento reflexivo y práctico en ${materia} (${grado}) a través del estudio aplicado de "${tema}".`,
          competencia: `Aplica estrategias metodológicas activas para comprender, debatir y resolver consignas vinculadas a "${tema}".`,
          capacidades: `Comprensión analítica, síntesis visual, argumentación oral y trabajo colaborativo en ${materia}.`,
          actitudesSer: "Escucha activa, respeto por las ideas diversas, solidaridad y responsabilidad en el aula.",
          indicadoresSaber: `Identifica y relaciona los conceptos esenciales de "${tema}" con ejemplos contextualizados.`,
          indicadoresHacer: `Elabora una síntesis estructurada y expone sus hallazgos cumpliendo la rúbrica de clase.`,
          faseInicio: `Activación de conocimientos previos sobre "${tema}" mediante dinámica de preguntas detonantes y estímulo visual en pizarra (10 min).`,
          faseAdquisicion: `Exposición dialogada y lectura guiada de fuentes clave profundizando los conceptos centrales de "${tema}" (25 min).`,
          faseAplicacion: `Taller de producción práctica en equipos: resolución de guía de análisis y elaboración de organizador gráfico (35 min).`,
          faseEvaluacion: `Cierre metacognitivo, socialización de conclusiones y registro en cuaderno pedagógico (SER 10 / SABER 45 / HACER 40) (10 min).`,
          recursos: "Pizarra interactiva, fichas de trabajo impreso, plataforma Fielding App, cuadernos y marcadores.",
        });
      }
    }, 1200);
  };

  const handlePrint = () => {
    document.body.dataset.printMode = "curriculum";
    const cleanup = () => {
      delete document.body.dataset.printMode;
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* PANEL SUPERIOR DE CONTROLES (Oculto en Impresión) */}
      <div className="no-print bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveMode("pdc")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeMode === "pdc"
                  ? "bg-[#266b31] text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>PDC Mensual</span>
            </button>
            <button
              onClick={() => setActiveMode("planes")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeMode === "planes"
                  ? "bg-[#266b31] text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Plan de Clase</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-gradient-to-r from-[#d6a427] to-[#b88c22] hover:opacity-95 text-[#1b4e23] font-black px-4 py-2.5 rounded-xl text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generando con IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>✨ Generar con IA (Demo)</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-[#266b31] hover:bg-[#1b4e23] text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ Imprimir Formato Carta</span>
            </button>
          </div>
        </div>

        {/* Feedback visual durante la generación IA */}
        {isGenerating && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-xs text-amber-900 font-semibold animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-[#d6a427]" />
            <span>{generationStep}</span>
          </div>
        )}

        {aiGenerated && !isGenerating && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                ¡Documento pedagógico generado con IA y guardado automáticamente! Todos los campos
                son editables antes de imprimir.
              </span>
            </div>
            <button
              onClick={() => setAiGenerated(false)}
              className="text-[11px] text-emerald-700 underline font-semibold cursor-pointer"
            >
              Ocultar
            </button>
          </div>
        )}

        {/* Filtros por Asignatura, Grado, Mes y Tema */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Asignatura</label>
            <select
              value={materia}
              onChange={(e) => setFilter("materia", e.target.value)}
              className="w-full bg-[#FAFAF0] border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#266b31]"
            >
              <option value="Historia de Bolivia">Historia de Bolivia</option>
              <option value="Historia Universal">Historia Universal</option>
              <option value="Inglés (Nivel B1-A)">Inglés (Nivel B1-A)</option>
              <option value="Ciencias Sociales">Ciencias Sociales</option>
              <option value="Lenguaje y Comunicación">Lenguaje y Comunicación</option>
              <option value="Matemática">Matemática</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Grado / Año</label>
            <select
              value={grado}
              onChange={(e) => setFilter("grado", e.target.value)}
              className="w-full bg-[#FAFAF0] border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#266b31]"
            >
              <option value="1ro de Secundaria">1ro de Secundaria</option>
              <option value="2do de Secundaria">2do de Secundaria</option>
              <option value="3ro de Secundaria">3ro de Secundaria</option>
              <option value="4to de Secundaria">4to de Secundaria</option>
              <option value="4to de Primaria">4to de Primaria</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mes</label>
            <select
              value={mes}
              onChange={(e) => setFilter("mes", e.target.value)}
              className="w-full bg-[#FAFAF0] border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#266b31]"
            >
              {[
                "Febrero",
                "Marzo",
                "Abril",
                "Mayo",
                "Junio",
                "Julio",
                "Agosto",
                "Septiembre",
                "Octubre",
                "Noviembre",
              ].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tema Curricular</label>
            <input
              type="text"
              value={tema}
              onChange={(e) => setFilter("tema", e.target.value)}
              placeholder="Ej: La Guerra del Pacífico..."
              className="w-full bg-[#FAFAF0] border border-slate-300 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#266b31]"
            />
          </div>
        </div>
      </div>

      {/* DOCUMENTO PEDAGÓGICO FORMATEADO PARA IMPRESIÓN CARTA */}
      <div
        id="curriculum-print-container"
        className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm text-slate-900 space-y-5"
      >
        {/* MEMBRETE INSTITUCIONAL OFICIAL */}
        <div className="flex items-center justify-between border-b-2 border-[#266b31] pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center">
              <img
                src="https://i.imgur.com/wjibHTr.png"
                alt="Colegio Fielding Bolivia"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#266b31] tracking-wide uppercase">
                UNIDAD EDUCATIVA FIELDING BOLIVIA
              </h1>
              <p className="text-xs font-bold text-slate-600">
                SISTEMA EDUCATIVO PLURINACIONAL • VICEMINISTERIO DE EDUCACIÓN REGULAR
              </p>
              <p className="text-[11px] text-slate-500">
                Distrito Educativo Sucre • Departamento de Chuquisaca
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block bg-[#d6a427]/20 text-[#1b4e23] font-black text-xs px-2.5 py-1 rounded">
              GESTIÓN 2026
            </span>
            <p className="text-xs font-bold text-slate-700 mt-1">
              {activeMode === "pdc" ? "PLAN DE DESARROLLO CURRICULAR" : "PLAN DE CLASE DIARIO"}
            </p>
            <p className="text-[10px] text-slate-500">Documento Técnico Pedagógico</p>
          </div>
        </div>

        {/* MODO PDC MENSUAL */}
        {activeMode === "pdc" && (
          <div className="space-y-4 text-xs">
            <div className="text-center">
              <h2 className="text-base font-black tracking-wide text-slate-900 uppercase underline decoration-[#266b31] decoration-2">
                PLAN DE DESARROLLO CURRICULAR N° {pdcTemplate.nroPdc}
              </h2>
            </div>

            {/* TABLA REFERENCIAL */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#FAFAF0] p-3 rounded-lg border border-slate-200 text-[11px]">
              <div>
                <span className="font-bold text-slate-500 block">Distrito Educativo:</span>
                <span className="font-semibold text-slate-800">{pdcTemplate.distrito}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block">Maestro/a Encargado:</span>
                <span className="font-bold text-[#266b31]">{pdcTemplate.docente}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block">Asignatura:</span>
                <span className="font-bold text-slate-800">{materia}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block">Año de Escolaridad:</span>
                <span className="font-bold text-slate-800">{grado}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block">Unidad Educativa:</span>
                <span className="font-semibold text-slate-800">{pdcTemplate.unidadEducativa}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block">Mes:</span>
                <span className="font-semibold text-slate-800">{mes} 2026</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block">Director/a:</span>
                <span className="font-semibold text-slate-800">{pdcTemplate.director}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block">Nivel Educativo:</span>
                <span className="font-semibold text-slate-800">
                  {grado.includes("Primaria") ? "Primaria Vocacional" : "Secundaria Productiva"}
                </span>
              </div>
            </div>

            {/* PERFILES DE SALIDA Y OBJETIVO HOLÍSTICO */}
            <div className="border border-slate-800 rounded overflow-hidden">
              <div className="p-2.5 bg-slate-100 border-b border-slate-800 flex flex-col gap-1">
                <span className="font-black text-slate-900 uppercase text-[10px]">
                  PERFILES DE SALIDA:
                </span>
                <textarea
                  rows={2}
                  value={pdcTemplate.perfilesSalida}
                  onChange={(e) => updatePdcTemplate({ perfilesSalida: e.target.value })}
                  className="print:hidden w-full bg-transparent font-medium text-slate-800 border-none resize-y focus:outline-none focus:ring-1 focus:ring-[#266b31] rounded p-1 text-xs"
                />
                <p className="hidden print:block whitespace-pre-wrap font-medium text-slate-800 text-xs">
                  {pdcTemplate.perfilesSalida}
                </p>
              </div>
              <div className="p-2.5 bg-white flex flex-col gap-1">
                <span className="font-black text-[#266b31] uppercase text-[10px]">
                  OBJETIVO HOLÍSTICO:
                </span>
                <textarea
                  rows={3}
                  value={pdcTemplate.objetivoHolistico}
                  onChange={(e) => updatePdcTemplate({ objetivoHolistico: e.target.value })}
                  className="print:hidden w-full bg-transparent font-medium text-slate-800 border-none resize-y focus:outline-none focus:ring-1 focus:ring-[#266b31] rounded p-1 text-xs leading-relaxed"
                />
                <p className="hidden print:block whitespace-pre-wrap font-medium text-slate-800 text-xs leading-relaxed">
                  {pdcTemplate.objetivoHolistico}
                </p>
              </div>
            </div>

            {/* MATRIZ DE 4 COLUMNAS OFICIALES */}
            <div className="border border-slate-800 rounded overflow-hidden">
              <div className="grid grid-cols-12 bg-[#1b4e23] text-white font-bold text-[10px] uppercase text-center">
                <div className="col-span-3 p-2 border-r border-white/20">CONTENIDOS (25%)</div>
                <div className="col-span-4 p-2 border-r border-white/20">
                  ORIENTACIONES METODOLÓGICAS (30%)
                </div>
                <div className="col-span-2 p-2 border-r border-white/20">RECURSOS (20%)</div>
                <div className="col-span-3 p-2">CRITERIOS DE EVALUACIÓN (25%)</div>
              </div>

              <div className="grid grid-cols-12 text-slate-800 divide-x divide-slate-800 bg-white">
                {/* 1. CONTENIDOS */}
                <div className="col-span-3 p-2.5">
                  <textarea
                    rows={12}
                    value={pdcTemplate.contenidos}
                    onChange={(e) => updatePdcTemplate({ contenidos: e.target.value })}
                    className="print:hidden w-full h-full bg-transparent border-none resize-none focus:outline-none text-xs leading-relaxed"
                  />
                  <p className="hidden print:block whitespace-pre-wrap text-[11px] leading-relaxed">
                    {pdcTemplate.contenidos}
                  </p>
                </div>

                {/* 2. ORIENTACIONES METODOLÓGICAS */}
                <div className="col-span-4 p-2.5 space-y-2 text-[11px]">
                  {(
                    [
                      { key: "practica", label: "PRÁCTICA:" },
                      { key: "teoria", label: "TEORÍA:" },
                      { key: "valoracion", label: "VALORACIÓN:" },
                      { key: "produccion", label: "PRODUCCIÓN:" },
                    ] as const
                  ).map((item) => (
                    <div key={item.key}>
                      <span className="font-black text-slate-900 block text-[10px]">
                        {item.label}
                      </span>
                      <textarea
                        rows={2}
                        value={pdcTemplate[item.key]}
                        onChange={(e) => updatePdcTemplate({ [item.key]: e.target.value })}
                        className="print:hidden w-full bg-transparent border-none resize-y focus:outline-none text-[11px]"
                      />
                      <p className="hidden print:block whitespace-pre-wrap text-[10px]">
                        {pdcTemplate[item.key]}
                      </p>
                    </div>
                  ))}
                </div>

                {/* 3. RECURSOS */}
                <div className="col-span-2 p-2.5 space-y-2 text-[11px]">
                  <div>
                    <span className="font-black text-slate-900 block text-[10px]">
                      MATERIALES DE LA VIDA:
                    </span>
                    <textarea
                      rows={4}
                      value={pdcTemplate.materialVida}
                      onChange={(e) => updatePdcTemplate({ materialVida: e.target.value })}
                      className="print:hidden w-full bg-transparent border-none resize-y focus:outline-none text-[11px]"
                    />
                    <p className="hidden print:block whitespace-pre-wrap text-[10px]">
                      {pdcTemplate.materialVida}
                    </p>
                  </div>
                  <div>
                    <span className="font-black text-slate-900 block text-[10px]">
                      ANALÓGICOS / DIGITALES:
                    </span>
                    <textarea
                      rows={4}
                      value={pdcTemplate.materialDigital}
                      onChange={(e) => updatePdcTemplate({ materialDigital: e.target.value })}
                      className="print:hidden w-full bg-transparent border-none resize-y focus:outline-none text-[11px]"
                    />
                    <p className="hidden print:block whitespace-pre-wrap text-[10px]">
                      {pdcTemplate.materialDigital}
                    </p>
                  </div>
                </div>

                {/* 4. CRITERIOS DE EVALUACIÓN */}
                <div className="col-span-3 p-2.5 space-y-2 text-[11px]">
                  <div>
                    <span className="font-black text-emerald-800 block text-[10px]">
                      SER (10 pts):
                    </span>
                    <textarea
                      rows={2}
                      value={pdcTemplate.criterioSer}
                      onChange={(e) => updatePdcTemplate({ criterioSer: e.target.value })}
                      className="print:hidden w-full bg-transparent border-none resize-y focus:outline-none text-[11px]"
                    />
                    <p className="hidden print:block whitespace-pre-wrap text-[10px]">
                      {pdcTemplate.criterioSer}
                    </p>
                  </div>
                  <div>
                    <span className="font-black text-blue-800 block text-[10px]">
                      SABER (45 pts):
                    </span>
                    <textarea
                      rows={3}
                      value={pdcTemplate.criterioSaber}
                      onChange={(e) => updatePdcTemplate({ criterioSaber: e.target.value })}
                      className="print:hidden w-full bg-transparent border-none resize-y focus:outline-none text-[11px]"
                    />
                    <p className="hidden print:block whitespace-pre-wrap text-[10px]">
                      {pdcTemplate.criterioSaber}
                    </p>
                  </div>
                  <div>
                    <span className="font-black text-amber-800 block text-[10px]">
                      HACER (40 pts):
                    </span>
                    <textarea
                      rows={3}
                      value={pdcTemplate.criterioHacer}
                      onChange={(e) => updatePdcTemplate({ criterioHacer: e.target.value })}
                      className="print:hidden w-full bg-transparent border-none resize-y focus:outline-none text-[11px]"
                    />
                    <p className="hidden print:block whitespace-pre-wrap text-[10px]">
                      {pdcTemplate.criterioHacer}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* TABLA INFERIOR */}
            <div className="grid grid-cols-3 border border-slate-800 rounded divide-x divide-slate-800 text-[11px] bg-slate-50">
              <div className="p-2">
                <span className="font-black text-slate-900 block uppercase text-[10px]">
                  ADAPTACIÓN CURRICULAR:
                </span>
                <textarea
                  rows={2}
                  value={pdcTemplate.adaptacionCurricular}
                  onChange={(e) => updatePdcTemplate({ adaptacionCurricular: e.target.value })}
                  className="print:hidden w-full bg-transparent border-none resize-y focus:outline-none text-[11px]"
                />
                <p className="hidden print:block whitespace-pre-wrap text-[10px]">
                  {pdcTemplate.adaptacionCurricular}
                </p>
              </div>
              <div className="p-2">
                <span className="font-black text-slate-900 block uppercase text-[10px]">
                  PRODUCTO:
                </span>
                <textarea
                  rows={2}
                  value={pdcTemplate.producto}
                  onChange={(e) => updatePdcTemplate({ producto: e.target.value })}
                  className="print:hidden w-full bg-transparent border-none resize-y focus:outline-none text-[11px]"
                />
                <p className="hidden print:block whitespace-pre-wrap text-[10px]">
                  {pdcTemplate.producto}
                </p>
              </div>
              <div className="p-2">
                <span className="font-black text-slate-900 block uppercase text-[10px]">
                  COMPETENCIA:
                </span>
                <textarea
                  rows={2}
                  value={pdcTemplate.competencia}
                  onChange={(e) => updatePdcTemplate({ competencia: e.target.value })}
                  className="print:hidden w-full bg-transparent border-none resize-y focus:outline-none text-[11px]"
                />
                <p className="hidden print:block whitespace-pre-wrap text-[10px]">
                  {pdcTemplate.competencia}
                </p>
              </div>
            </div>

            {/* PIE DE PÁGINA Y FIRMAS */}
            <div className="pt-6">
              <p className="italic text-right text-slate-600 text-[10px] mb-8">
                Sucre,{" "}
                {new Date().toLocaleDateString("es-BO", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <div className="grid grid-cols-2 gap-16 text-center text-xs">
                <div className="border-t border-slate-500 pt-1">
                  <p className="font-bold text-slate-800">{pdcTemplate.docente}</p>
                  <p className="text-[10px] text-slate-500">FIRMA MAESTRO(A)</p>
                </div>
                <div className="border-t border-slate-500 pt-1">
                  <p className="font-bold text-slate-800">{pdcTemplate.director}</p>
                  <p className="text-[10px] text-slate-500">FIRMA DIRECTOR GENERAL</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODO PLAN DE CLASE */}
        {activeMode === "planes" && (
          <div className="space-y-4 text-xs">
            <div className="text-center">
              <h2 className="text-base font-black tracking-wide text-slate-900 uppercase underline decoration-[#266b31] decoration-2">
                PLAN DE CLASE N° {planTemplate.claseNro} - {materia.toUpperCase()}
              </h2>
            </div>

            {/* BLOQUE I: DATOS Y COMPETENCIAS */}
            <div className="border border-slate-800 rounded p-3 bg-[#FAFAF0] space-y-2.5">
              <span className="font-black text-slate-900 uppercase text-[11px] block border-b border-slate-300 pb-1">
                I. DATOS INFORMATIVOS Y COMPETENCIAS
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="font-bold text-slate-500 block">Docente:</span>
                  <span className="font-bold text-[#266b31]">{planTemplate.docente}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block">Grado / Nivel:</span>
                  <span className="font-semibold text-slate-800">{grado}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block">Mes:</span>
                  <span className="font-semibold text-slate-800">{mes}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block">Clase N°:</span>
                  <span className="font-bold text-slate-800">{planTemplate.claseNro}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="font-black text-[#266b31] block text-[10px]">
                    OBJETIVO HOLÍSTICO:
                  </span>
                  <textarea
                    rows={2}
                    value={planTemplate.objetivo}
                    onChange={(e) => updatePlanTemplate({ objetivo: e.target.value })}
                    className="print:hidden w-full bg-white border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-[#266b31]"
                  />
                  <p className="hidden print:block whitespace-pre-wrap text-[11px] bg-white p-1 rounded">
                    {planTemplate.objetivo}
                  </p>
                </div>
                <div>
                  <span className="font-black text-slate-800 block text-[10px]">COMPETENCIA:</span>
                  <textarea
                    rows={2}
                    value={planTemplate.competencia}
                    onChange={(e) => updatePlanTemplate({ competencia: e.target.value })}
                    className="print:hidden w-full bg-white border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-[#266b31]"
                  />
                  <p className="hidden print:block whitespace-pre-wrap text-[11px] bg-white p-1 rounded">
                    {planTemplate.competencia}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="font-black text-slate-800 block text-[10px]">CAPACIDADES:</span>
                  <textarea
                    rows={2}
                    value={planTemplate.capacidades}
                    onChange={(e) => updatePlanTemplate({ capacidades: e.target.value })}
                    className="print:hidden w-full bg-white border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-[#266b31]"
                  />
                  <p className="hidden print:block whitespace-pre-wrap text-[11px] bg-white p-1 rounded">
                    {planTemplate.capacidades}
                  </p>
                </div>
                <div>
                  <span className="font-black text-emerald-800 block text-[10px]">
                    ACTITUDES Y VALORES (SER - 10 pts):
                  </span>
                  <textarea
                    rows={2}
                    value={planTemplate.actitudesSer}
                    onChange={(e) => updatePlanTemplate({ actitudesSer: e.target.value })}
                    className="print:hidden w-full bg-white border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-[#266b31]"
                  />
                  <p className="hidden print:block whitespace-pre-wrap text-[11px] bg-white p-1 rounded">
                    {planTemplate.actitudesSer}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="font-black text-blue-800 block text-[10px]">
                    CRITERIOS SABER (45 pts):
                  </span>
                  <textarea
                    rows={2}
                    value={planTemplate.indicadoresSaber}
                    onChange={(e) => updatePlanTemplate({ indicadoresSaber: e.target.value })}
                    className="print:hidden w-full bg-white border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-[#266b31]"
                  />
                  <p className="hidden print:block whitespace-pre-wrap text-[11px] bg-white p-1 rounded">
                    {planTemplate.indicadoresSaber}
                  </p>
                </div>
                <div>
                  <span className="font-black text-amber-800 block text-[10px]">
                    CRITERIOS HACER (40 pts):
                  </span>
                  <textarea
                    rows={2}
                    value={planTemplate.indicadoresHacer}
                    onChange={(e) => updatePlanTemplate({ indicadoresHacer: e.target.value })}
                    className="print:hidden w-full bg-white border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-[#266b31]"
                  />
                  <p className="hidden print:block whitespace-pre-wrap text-[11px] bg-white p-1 rounded">
                    {planTemplate.indicadoresHacer}
                  </p>
                </div>
              </div>
            </div>

            {/* BLOQUE II: SECUENCIA DIDÁCTICA */}
            <div className="border border-slate-800 rounded overflow-hidden">
              <div className="bg-[#1b4e23] text-white font-bold text-[10px] uppercase p-2">
                II. SECUENCIA DIDÁCTICA ({tema.toUpperCase()})
              </div>

              <div className="divide-y divide-slate-800 bg-white text-[11px]">
                {(
                  [
                    { key: "faseInicio", label: "1. INICIO (10 min):" },
                    { key: "faseAdquisicion", label: "2. ADQUISICIÓN (25 min):" },
                    { key: "faseAplicacion", label: "3. APLICACIÓN (35 min):" },
                    { key: "faseEvaluacion", label: "4. EVALUACIÓN (10 min):" },
                  ] as const
                ).map((fase) => (
                  <div key={fase.key} className="grid grid-cols-12 p-2.5 gap-2">
                    <div className="col-span-3 font-bold text-[#1b4e23] uppercase text-[10px]">
                      {fase.label}
                    </div>
                    <div className="col-span-9">
                      <textarea
                        rows={2}
                        value={planTemplate[fase.key]}
                        onChange={(e) => updatePlanTemplate({ [fase.key]: e.target.value })}
                        className="print:hidden w-full bg-transparent border-none resize-y focus:outline-none text-[11px]"
                      />
                      <p className="hidden print:block whitespace-pre-wrap text-[11px]">
                        {planTemplate[fase.key]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RECURSOS */}
            <div className="p-2.5 border border-slate-800 rounded bg-slate-50 text-[11px]">
              <span className="font-bold text-slate-900 block uppercase text-[10px]">
                RECURSOS Y MATERIALES:
              </span>
              <input
                type="text"
                value={planTemplate.recursos}
                onChange={(e) => updatePlanTemplate({ recursos: e.target.value })}
                className="print:hidden w-full bg-transparent border-none focus:outline-none text-[11px] font-medium text-slate-800"
              />
              <p className="hidden print:block text-[11px] font-medium text-slate-800">
                {planTemplate.recursos}
              </p>
            </div>

            {/* FIRMA DOCENTE */}
            <div className="pt-6">
              <div className="max-w-xs mx-auto border-t border-slate-500 pt-1 text-center">
                <p className="font-bold text-slate-800 text-xs">{planTemplate.docente}</p>
                <p className="text-[10px] text-slate-500">DOCENTE DE ÁREA</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
