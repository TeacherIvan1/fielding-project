"use client";

import React, { useMemo } from "react";
import { Printer, X, Award, CheckCircle2, AlertTriangle, BookOpen } from "lucide-react";
import { getClasificacionCurricular, getGradeColorClass } from "@/lib/siged";

export interface StudentGradeDetail {
  ser?: string | number;
  saber?: string | number;
  hacer?: string | number;
  auto?: string | number;
  total?: string | number;
}

export interface StudentGradeSubject {
  profesor?: string;
  campo?: string;
  area?: string;
  t1?: StudentGradeDetail;
  t2?: StudentGradeDetail;
  t3?: StudentGradeDetail;
  final?: string | number;
  estado?: string;
}

export interface StudentData {
  id?: string;
  full_name: string;
  course: string;
  english_level?: string | null;
  rude_code?: string;
  grades?: Record<string, StudentGradeSubject>;
}

interface BoletinModalProps {
  student: StudentData | null;
  onClose: () => void;
}

const ORDER_CAMPOS = [
  "COMUNIDAD Y SOCIEDAD",
  "CIENCIA TECNOLOGÍA Y PRODUCCIÓN",
  "VIDA TIERRA TERRITORIO",
  "COSMOS Y PENSAMIENTOS",
];

export default function BoletinModal({ student, onClose }: BoletinModalProps) {
  if (!student) return null;

  const isSec = String(student.course || "").toUpperCase().includes("SEC");
  const nivelTexto = isSec
    ? "EDUCACIÓN SECUNDARIA COMUNITARIA PRODUCTIVA"
    : "EDUCACIÓN PRIMARIA COMUNITARIA VOCACIONAL";

  // Agrupación jerárquica por Campo -> Área -> Materias
  const hierarchy = useMemo(() => {
    const map: Record<string, Record<string, Array<{ name: string; grade: StudentGradeSubject }>>> = {};

    ORDER_CAMPOS.forEach((c) => {
      map[c] = {};
    });

    Object.entries(student.grades || {}).forEach(([matKey, gradeObj]) => {
      const cl = getClasificacionCurricular(matKey, student.course);
      const campo = cl.campo;
      const area = cl.area;
      const materiaName = cl.materia;

      if (!map[campo]) map[campo] = {};
      if (!map[campo][area]) map[campo][area] = [];

      map[campo][area].push({
        name: materiaName,
        grade: gradeObj || {},
      });
    });

    return map;
  }, [student]);

  // Cálculo del Promedio General
  const generalStats = useMemo(() => {
    let sumFinal = 0;
    let countFinal = 0;
    let hasFailed = false;

    Object.values(student.grades || {}).forEach((g) => {
      const num = parseFloat(String(g?.final ?? "").replace(",", "."));
      if (!isNaN(num)) {
        sumFinal += num;
        countFinal++;
        if (num < 51) hasFailed = true;
      }
    });

    const average = countFinal > 0 ? (sumFinal / countFinal).toFixed(1) : "0.0";
    const numAvg = parseFloat(average);

    let escala = "EN DESARROLLO (ED)";
    if (numAvg >= 90) escala = "DESARROLLO PLENO (DP)";
    else if (numAvg >= 66) escala = "DESARROLLO ACEPTABLE (DA)";
    else if (numAvg >= 51) escala = "DESARROLLO ÓPTIMO (DO)";

    return {
      average,
      numAvg,
      countFinal,
      hasFailed,
      status: numAvg >= 51 ? "PROMOVIDO" : "RETENIDO",
      escala,
    };
  }, [student]);

  const handlePrint = () => {
    window.print();
  };

  const parseScore = (val: any): number | null => {
    if (val === null || val === undefined || val === "" || val === "-") return null;
    const n = parseFloat(String(val).replace(",", "."));
    return isNaN(n) ? null : n;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #boletin-print-area,
          #boletin-print-area * {
            visibility: visible;
          }
          #boletin-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: letter portrait;
            margin: 0.8cm;
          }
        }
      `}</style>

      {/* CONTENEDOR PRINCIPAL */}
      <div
        id="boletin-print-area"
        className="w-full max-w-4xl bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden print:rounded-none print:shadow-none print:border-none"
      >
        {/* BARRA DE ACCIÓN SUPERIOR (NO PRINT) */}
        <div className="no-print bg-[#1b4e23] px-6 py-3.5 flex items-center justify-between text-white border-b-4 border-[#d6a427]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#d6a427]" />
            <span className="font-bold text-sm tracking-wide uppercase">
              Boletín Oficial de Calificaciones • SIGED Bolivia
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-[#d6a427] hover:bg-[#b88c1f] text-slate-900 font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir (Carta)
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-2 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CUERPO DEL BOLETÍN IMPRIMIBLE */}
        <div className="p-6 sm:p-8 print:p-4 text-xs font-sans">
          {/* ENCABEZADO OFICIAL */}
          <div className="text-center pb-4 mb-4 border-b-2 border-slate-800">
            <p className="text-[10px] tracking-widest uppercase font-semibold text-slate-500">
              ESTADO PLURINACIONAL DE BOLIVIA • MINISTERIO DE EDUCACIÓN
            </p>
            <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wide text-[#1b4e23] mt-1">
              UNIDAD EDUCATIVA FIELDING BOLIVIA
            </h1>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-0.5">
              {nivelTexto}
            </p>
            <div className="inline-block mt-2 px-3 py-1 bg-[#FAFAF0] border border-[#d6a427] rounded text-[11px] font-bold text-[#1b4e23] uppercase">
              Boletín Centralizador Anual de Calificaciones • Gestión 2026
            </div>
          </div>

          {/* DATOS DEL ESTUDIANTE */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#FAFAF0] p-3 rounded-lg border border-slate-200 mb-5 text-[11px]">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Estudiante:</span>
              <span className="font-extrabold text-slate-900 uppercase">{student.full_name}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Curso Oficial:</span>
              <span className="font-bold text-[#1b4e23] uppercase">{student.course}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Nivel de Inglés (MCER):</span>
              <span className="font-bold text-[#b45309] uppercase">
                {student.english_level ? student.english_level : "Regular"}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Código Estudiante / RUDE:</span>
              <span className="font-mono text-slate-700">{student.rude_code || student.id || "FLD-2026-REG"}</span>
            </div>
          </div>

          {/* TABLA JERÁRQUICA DE MATERIAS POR CAMPOS Y ÁREAS */}
          <div className="border border-slate-300 rounded-lg overflow-hidden mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1b4e23] text-white text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2.5 px-3 border-r border-green-800">Campos / Áreas / Áreas Curriculares</th>
                  <th className="py-2.5 px-2 text-center w-14 border-r border-green-800">1T (100)</th>
                  <th className="py-2.5 px-2 text-center w-14 border-r border-green-800">2T (100)</th>
                  <th className="py-2.5 px-2 text-center w-14 border-r border-green-800">3T (100)</th>
                  <th className="py-2.5 px-2 text-center w-20 border-r border-green-800">Prom. Final</th>
                  <th className="py-2.5 px-2 text-center w-20">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {ORDER_CAMPOS.map((campoName) => {
                  const areasInCampo = hierarchy[campoName] || {};
                  const areaEntries = Object.entries(areasInCampo).filter(([_, mats]) => mats.length > 0);
                  if (areaEntries.length === 0) return null;

                  return (
                    <React.Fragment key={campoName}>
                      {/* ENCABEZADO DE CAMPO */}
                      <tr className="bg-slate-100 font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">
                        <td colSpan={6} className="py-1.5 px-3 bg-[#e2e8f0] text-[#1b4e23] border-y border-slate-300">
                          CAMPO: {campoName}
                        </td>
                      </tr>

                      {/* LISTADO DE ÁREAS */}
                      {areaEntries.map(([areaName, materias]) => {
                        // Calcular promedios de área si tiene más de 1 materia
                        const hasMultiple = materias.length > 1;
                        let sumT1 = 0, countT1 = 0;
                        let sumT2 = 0, countT2 = 0;
                        let sumT3 = 0, countT3 = 0;
                        let sumFinal = 0, countFinal = 0;

                        if (hasMultiple) {
                          materias.forEach(({ grade }) => {
                            const p1 = parseScore(grade?.t1?.total);
                            if (p1 !== null) { sumT1 += p1; countT1++; }
                            const p2 = parseScore(grade?.t2?.total);
                            if (p2 !== null) { sumT2 += p2; countT2++; }
                            const p3 = parseScore(grade?.t3?.total);
                            if (p3 !== null) { sumT3 += p3; countT3++; }
                            const pf = parseScore(grade?.final);
                            if (pf !== null) { sumFinal += pf; countFinal++; }
                          });
                        }

                        const avgT1 = countT1 > 0 ? Math.round(sumT1 / countT1) : "-";
                        const avgT2 = countT2 > 0 ? Math.round(sumT2 / countT2) : "-";
                        const avgT3 = countT3 > 0 ? Math.round(sumT3 / countT3) : "-";
                        const avgFinal = countFinal > 0 ? Math.round(sumFinal / countFinal) : "-";

                        return (
                          <React.Fragment key={areaName}>
                            {/* MATERIAS DENTRO DEL ÁREA */}
                            {materias.map(({ name, grade }, mIdx) => {
                              const t1Val = grade?.t1?.total ?? "-";
                              const t2Val = grade?.t2?.total ?? "-";
                              const t3Val = grade?.t3?.total ?? "-";
                              const finalVal = grade?.final ?? "-";
                              const numFinal = parseScore(finalVal);
                              const estado = numFinal !== null
                                ? numFinal >= 51
                                  ? "APROBADO"
                                  : "REPROBADO"
                                : grade?.estado || "-";

                              return (
                                <tr key={mIdx} className="hover:bg-slate-50 transition-colors">
                                  <td className="py-1.5 px-3 pl-6 border-r border-slate-200">
                                    <span className="font-semibold text-slate-700 uppercase">{name}</span>
                                    {name === "LENGUA EXTRANJERA" && student.english_level && (
                                      <span className="ml-2 text-[9px] px-1.5 py-0.2 bg-[#dcfce7] text-[#15803d] font-bold rounded">
                                        Nivel {student.english_level}
                                      </span>
                                    )}
                                    <span className="block text-[9px] text-slate-400 font-normal">
                                      Área: {areaName} {grade?.profesor ? `• ${grade.profesor}` : ""}
                                    </span>
                                  </td>
                                  <td className="py-1.5 px-2 text-center border-r border-slate-200 font-mono">
                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${getGradeColorClass(t1Val)}`}>
                                      {t1Val}
                                    </span>
                                  </td>
                                  <td className="py-1.5 px-2 text-center border-r border-slate-200 font-mono">
                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${getGradeColorClass(t2Val)}`}>
                                      {t2Val}
                                    </span>
                                  </td>
                                  <td className="py-1.5 px-2 text-center border-r border-slate-200 font-mono">
                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${getGradeColorClass(t3Val)}`}>
                                      {t3Val}
                                    </span>
                                  </td>
                                  <td className="py-1.5 px-2 text-center border-r border-slate-200 font-mono">
                                    <span className={`inline-block px-2 py-0.5 rounded font-extrabold text-[11px] ${getGradeColorClass(finalVal)}`}>
                                      {finalVal}
                                    </span>
                                  </td>
                                  <td className="py-1.5 px-2 text-center text-[10px] font-bold">
                                    <span
                                      className={
                                        estado === "APROBADO"
                                          ? "text-[#15803d]"
                                          : estado === "REPROBADO"
                                          ? "text-[#b91c1c]"
                                          : "text-slate-500"
                                      }
                                    >
                                      {estado}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}

                            {/* FILA DE PROMEDIO DE ÁREA (CUANDO TIENE MÁS DE 1 MATERIA) */}
                            {hasMultiple && (
                              <tr className="bg-[#fefce8] border-b-2 border-slate-200 font-bold text-[10px]">
                                <td className="py-1 px-3 pl-8 text-[#b45309] uppercase border-r border-slate-200">
                                  » PROMEDIO DE ÁREA: {areaName}
                                </td>
                                <td className="py-1 px-2 text-center border-r border-slate-200 font-mono text-[#b45309]">
                                  {avgT1}
                                </td>
                                <td className="py-1 px-2 text-center border-r border-slate-200 font-mono text-[#b45309]">
                                  {avgT2}
                                </td>
                                <td className="py-1 px-2 text-center border-r border-slate-200 font-mono text-[#b45309]">
                                  {avgT3}
                                </td>
                                <td className="py-1 px-2 text-center border-r border-slate-200 font-mono font-extrabold text-[#b45309]">
                                  {avgFinal}
                                </td>
                                <td className="py-1 px-2 text-center text-[9px] uppercase font-bold text-[#b45309]">
                                  {avgFinal !== "-" && Number(avgFinal) >= 51 ? "APROBADO" : "REPROBADO"}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* RESUMEN FINAL Y PROMEDIO ANUAL GENERAL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAFAF0] p-4 rounded-xl border-2 border-[#d6a427] mb-8">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Valoración Cualitativa Institucional:
              </span>
              <p className="font-extrabold text-sm text-[#1b4e23]">{generalStats.escala}</p>
              <p className="text-[10px] text-slate-600">
                Escala Plurinacional: 90-100 (DP), 66-89 (DA), 51-65 (DO), 1-50 (ED).
              </p>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-6 sm:border-l sm:border-slate-300 sm:pl-6">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Promedio Anual General
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#1b4e23] tracking-tight">
                  {generalStats.average}
                </span>
                <span className="text-xs font-bold text-slate-500"> / 100</span>
              </div>
              <div
                className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider flex items-center gap-1.5 ${
                  generalStats.status === "PROMOVIDO"
                    ? "bg-[#dcfce7] text-[#15803d] border border-[#15803d]"
                    : "bg-[#fee2e2] text-[#b91c1c] border border-[#b91c1c]"
                }`}
              >
                {generalStats.status === "PROMOVIDO" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                {generalStats.status}
              </div>
            </div>
          </div>

          {/* SECCIÓN DE FIRMAS Y SELLOS OFICIALES */}
          <div className="grid grid-cols-3 gap-8 pt-8 mt-4 text-center text-[10px] text-slate-600">
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold uppercase text-slate-800">Dirección General</p>
              <p className="text-[9px] text-slate-500">Colegio Fielding Bolivia</p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold uppercase text-slate-800">Comisión Pedagógica</p>
              <p className="text-[9px] text-slate-500">Gestión Académica 2026</p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold uppercase text-slate-800">Secretaría y Kardex</p>
              <p className="text-[9px] text-slate-500">Sello Oficial de Registro</p>
            </div>
          </div>

          <div className="text-center text-[8px] text-slate-400 mt-6 pt-2 border-t border-slate-200">
            Documento emitido por la Plataforma Digital Fielding Bolivia bajo la normativa del Sistema Educativo Plurinacional.
          </div>
        </div>
      </div>
    </div>
  );
}
