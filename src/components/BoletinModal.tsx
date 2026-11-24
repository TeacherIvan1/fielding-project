"use client";

import React, { useMemo } from "react";
import { Printer, X, Award, CheckCircle2, AlertTriangle } from "lucide-react";
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
  const structuredData = useMemo(() => {
    const tree: Record<
      string,
      Record<
        string,
        Array<{
          nombre: string;
          profesor: string;
          t1: StudentGradeDetail;
          t2: StudentGradeDetail;
          t3: StudentGradeDetail;
          final: number | string;
          estado: string;
        }>
      >
    > = {};

    if (!student) return tree;

    ORDER_CAMPOS.forEach((c) => {
      tree[c] = {};
    });

    Object.entries(student.grades || {}).forEach(([matName, g]) => {
      const { campo, area, materia } = getClasificacionCurricular(matName, student.course);
      if (!tree[campo]) tree[campo] = {};
      if (!tree[campo][area]) tree[campo][area] = [];

      tree[campo][area].push({
        nombre: materia,
        profesor: g.profesor || "Docente Asignado",
        t1: g.t1 || {},
        t2: g.t2 || {},
        t3: g.t3 || {},
        final: g.final !== undefined ? g.final : "-",
        estado: g.estado || "REGISTRADO",
      });
    });

    return tree;
  }, [student]);

  const overallStats = useMemo(() => {
    if (!student) return { average: 0, approved: false, totalSubjects: 0 };
    let sum = 0;
    let count = 0;
    Object.values(student.grades || {}).forEach((g) => {
      if (g.final !== undefined && g.final !== null && g.final !== "" && g.final !== "-") {
        const val =
          typeof g.final === "number" ? g.final : parseFloat(String(g.final).replace(",", "."));
        if (!isNaN(val)) {
          sum += val;
          count++;
        }
      }
    });
    const avg = count > 0 ? Math.round(sum / count) : 0;
    return {
      average: avg,
      approved: avg >= 51,
      totalSubjects: count,
    };
  }, [student]);

  if (!student) return null;

  const isSec = String(student.course || "").toUpperCase().includes("SEC");

  const handlePrint = () => {
    document.body.dataset.printMode = "boletin";
    const cleanup = () => {
      delete document.body.dataset.printMode;
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        id="boletin-print-container"
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 text-slate-900 my-8 transition-all"
      >
        {/* Barra superior de acciones (Oculta en impresión) */}
        <div className="no-print bg-[#266b31] px-6 py-4 flex items-center justify-between text-white border-b border-[#1b4e23]">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-[#d6a427]" />
            <div>
              <h2 className="text-lg font-bold">Boletín Oficial de Calificaciones</h2>
              <p className="text-xs text-white/80">
                Formato Carta • Conforme a normativa SIGED Bolivia
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-[#d6a427] hover:bg-[#b88c22] text-[#1b4e23] font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENIDO DEL BOLETÍN IMPRIMIBLE */}
        <div className="p-6 md:p-8 space-y-5">
          {/* Encabezado Institucional */}
          <div className="flex items-center justify-between border-b-2 border-[#266b31] pb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 flex-shrink-0 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center">
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
                <h1 className="text-xl md:text-2xl font-black tracking-wide text-[#266b31] uppercase">
                  UNIDAD EDUCATIVA FIELDING BOLIVIA
                </h1>
                <p className="text-xs font-semibold text-slate-600 tracking-wider">
                  SISTEMA DE GESTIÓN EDUCATIVA Y CONTROL DE CALIFICACIONES (SIGED)
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Resolución Ministerial N° 458/2014 • Sucre, Bolivia
                </p>
              </div>
            </div>

            <div className="text-right border-l-2 border-slate-200 pl-4">
              <span className="inline-block bg-[#d6a427]/20 text-[#1b4e23] font-black text-xs px-2.5 py-1 rounded-md mb-1">
                GESTIÓN 2026
              </span>
              <p className="text-xs font-bold text-slate-700">BOLETÍN CENTRALIZADOR</p>
              <p className="text-[10px] text-slate-500">
                Emisión: {new Date().toLocaleDateString("es-BO")}
              </p>
            </div>
          </div>

          {/* Ficha Informativa del Estudiante */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAFAF0] p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase">
                Estudiante
              </span>
              <span className="font-extrabold text-slate-900">{student.full_name}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase">
                Curso / Nivel
              </span>
              <span className="font-bold text-[#266b31]">
                {student.course} (
                {isSec ? "Secundaria Comunitaria Productiva" : "Primaria Comunitaria Vocacional"})
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase">
                Código RUDE
              </span>
              <span className="font-mono font-semibold text-slate-800">
                {student.rude_code || "80730012020261A"}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase">
                Nivel Lengua Extranjera
              </span>
              <span className="inline-block bg-[#266b31]/10 text-[#266b31] font-bold px-2 py-0.5 rounded text-[11px]">
                {student.english_level || "MCER B1"}
              </span>
            </div>
          </div>

          {/* TABLA JERÁRQUICA: CAMPO -> ÁREA -> MATERIA */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#1b4e23] text-white font-bold text-[11px] uppercase tracking-wider text-center">
                  <th className="py-2 px-3 text-left w-[36%]">Campos / Áreas y Asignaturas</th>
                  <th className="py-2 px-1 border-l border-white/20 w-[9%]">Docente</th>
                  <th className="py-2 px-1 border-l border-white/20 w-[11%]">1T</th>
                  <th className="py-2 px-1 border-l border-white/20 w-[11%]">2T</th>
                  <th className="py-2 px-1 border-l border-white/20 w-[11%]">3T</th>
                  <th className="py-2 px-1 border-l border-white/20 w-[11%]">Promedio</th>
                  <th className="py-2 px-2 border-l border-white/20 w-[11%]">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ORDER_CAMPOS.map((campoName) => {
                  const areasInCampo = structuredData[campoName] || {};
                  const areaKeys = Object.keys(areasInCampo);
                  if (areaKeys.length === 0) return null;

                  return (
                    <React.Fragment key={campoName}>
                      <tr className="bg-slate-100 font-extrabold text-[#1b4e23] uppercase text-[10px] tracking-wide border-t-2 border-slate-300">
                        <td colSpan={7} className="py-1 px-3 bg-slate-200/70">
                          CAMPO: {campoName}
                        </td>
                      </tr>

                      {areaKeys.map((areaName) => {
                        const materias = areasInCampo[areaName];

                        let areaFinalSum = 0;
                        let areaCount = 0;
                        materias.forEach((m) => {
                          const val =
                            typeof m.final === "number"
                              ? m.final
                              : parseFloat(String(m.final).replace(",", "."));
                          if (!isNaN(val)) {
                            areaFinalSum += val;
                            areaCount++;
                          }
                        });
                        const areaAverage =
                          areaCount > 0 ? Math.round(areaFinalSum / areaCount) : null;

                        return (
                          <React.Fragment key={areaName}>
                            <tr className="bg-slate-50 font-bold text-slate-700 text-[10px] border-b border-slate-200">
                              <td colSpan={7} className="py-0.5 px-5 text-[#266b31] italic">
                                • ÁREA: {areaName}
                              </td>
                            </tr>

                            {materias.map((mat, idx) => {
                              const t1Val = mat.t1?.total ?? "-";
                              const t2Val = mat.t2?.total ?? "-";
                              const t3Val = mat.t3?.total ?? "-";
                              const finVal = mat.final ?? "-";

                              return (
                                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="py-1.5 px-6 font-medium text-slate-800 text-[11px]">
                                    {mat.nombre}
                                  </td>
                                  <td className="py-1.5 px-1 text-[9px] text-slate-500 text-center truncate max-w-[90px]">
                                    {mat.profesor.split(" ")[0]} {mat.profesor.split(" ")[1] || ""}
                                  </td>
                                  <td className="py-1.5 px-1 text-center font-bold">
                                    <span
                                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${getGradeColorClass(
                                        t1Val
                                      )}`}
                                    >
                                      {t1Val}
                                    </span>
                                  </td>
                                  <td className="py-1.5 px-1 text-center font-bold">
                                    <span
                                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${getGradeColorClass(
                                        t2Val
                                      )}`}
                                    >
                                      {t2Val}
                                    </span>
                                  </td>
                                  <td className="py-1.5 px-1 text-center font-bold">
                                    <span
                                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${getGradeColorClass(
                                        t3Val
                                      )}`}
                                    >
                                      {t3Val}
                                    </span>
                                  </td>
                                  <td className="py-1.5 px-1 text-center font-black">
                                    <span
                                      className={`inline-block px-2 py-0.5 rounded text-[11px] ${getGradeColorClass(
                                        finVal
                                      )}`}
                                    >
                                      {finVal}
                                    </span>
                                  </td>
                                  <td className="py-1.5 px-2 text-center text-[10px] font-bold">
                                    {finVal !== "-" && Number(finVal) >= 51 ? (
                                      <span className="text-emerald-700">APROBADO</span>
                                    ) : finVal !== "-" ? (
                                      <span className="text-red-600">REPROBADO</span>
                                    ) : (
                                      <span className="text-slate-400">EN CURSO</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}

                            {materias.length > 1 && areaAverage !== null && (
                              <tr className="bg-slate-100/60 font-semibold text-[10px] text-slate-600 border-t border-slate-200">
                                <td colSpan={5} className="py-1 px-6 text-right uppercase tracking-wider">
                                  Promedio Área ({areaName}):
                                </td>
                                <td className="py-1 px-1 text-center font-bold">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-[10px] ${getGradeColorClass(
                                      areaAverage
                                    )}`}
                                  >
                                    {areaAverage}
                                  </span>
                                </td>
                                <td className="py-1 px-2 text-center text-[9px] text-slate-500">
                                  {areaAverage >= 51 ? "ÁREA APROBADA" : "ÁREA EN RIESGO"}
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

          {/* RESUMEN FINAL Y FIRMAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-[#FAFAF0] p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-600 uppercase">
                  PROMEDIO ANUAL GENERAL
                </span>
                <p className="text-[11px] text-slate-500">
                  Evaluado sobre 100 puntos en las 4 dimensiones
                </p>
                <span className="inline-block mt-1 text-[11px] font-semibold text-[#266b31]">
                  Total materias computadas: {overallStats.totalSubjects}
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`text-2xl font-black px-3 py-1 rounded-lg ${getGradeColorClass(
                    overallStats.average
                  )}`}
                >
                  {overallStats.average}
                </span>
                <div className="mt-1 flex items-center justify-end gap-1 text-[11px] font-bold">
                  {overallStats.approved ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ESTUDIANTE PROMOVIDO
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> RETENIDO / REFORZAMIENTO
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[10px] flex flex-col justify-center space-y-1">
              <span className="font-bold text-slate-700 uppercase">
                Escala de Valoración Ministerial:
              </span>
              <div className="grid grid-cols-3 gap-1 text-center font-semibold">
                <div className="bg-red-50 text-red-700 border border-red-200 rounded p-1">
                  1 - 50: Insuficiente
                </div>
                <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded p-1">
                  51 - 65: Regular
                </div>
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded p-1">
                  90 - 100: Excelente
                </div>
              </div>
            </div>
          </div>

          {/* Bloques de Firmas Formales para Impresión */}
          <div className="pt-10 grid grid-cols-3 gap-6 text-center text-xs">
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-800">Lic. Ivan Ezequiel Mancilla Copa</p>
              <p className="text-[10px] text-slate-500">Profesor Asesor / Tutor</p>
            </div>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-800">Ing. José Mariano Pinaya</p>
              <p className="text-[10px] text-slate-500">Director General Fielding</p>
            </div>
            <div className="border-t border-slate-400 pt-1 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full border border-dashed border-slate-400 flex items-center justify-center text-[9px] text-slate-400 font-bold mb-1">
                SELLO
              </div>
              <p className="text-[10px] text-slate-500">Secretaría Académica</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
