"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  BookOpen,
  Printer,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Search,
  ChevronRight,
  Info,
} from "lucide-react";
import { PDCRecord, ClaseRecord } from "@/app/api/curriculum/route";

export default function TeacherCurriculumHub() {
  const [activeMode, setActiveMode] = useState<"pdc" | "planes">("pdc");
  const [pdcs, setPdcs] = useState<PDCRecord[]>([]);
  const [planes, setPlanes] = useState<ClaseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------------------
  // FILTROS MODO PDC
  // -------------------------------------------------------------
  const [pdcMateria, setPdcMateria] = useState<string>("Historia de Bolivia");
  const [pdcAnio, setPdcAnio] = useState<string>("1ro de Secundaria");
  const [pdcMes, setPdcMes] = useState<string>("Febrero");

  // -------------------------------------------------------------
  // FILTROS MODO PLANES DE CLASE
  // -------------------------------------------------------------
  const [claseGrado, setClaseGrado] = useState<string>("1º de Secundaria");
  const [claseAsignatura, setClaseAsignatura] = useState<string>("Historia Universal");
  const [claseMes, setClaseMes] = useState<string>("Septiembre");
  const [claseViewMode, setClaseViewMode] = useState<string>("ALL");

  useEffect(() => {
    fetch("/api/curriculum")
      .then((res) => res.json())
      .then((data) => {
        if (data.pdcs && data.pdcs.length > 0) {
          setPdcs(data.pdcs);
          // Ajustar filtros iniciales basados en los datos
          setPdcMateria(data.pdcs[0].materia || "Historia de Bolivia");
          setPdcAnio(data.pdcs[0].anio_escolaridad || "1ro de Secundaria");
          setPdcMes(data.pdcs[0].mes || "Febrero");
        }
        if (data.planes && data.planes.length > 0) {
          setPlanes(data.planes);
          setClaseGrado(data.planes[0].GRADO || "1º de Secundaria");
          setClaseAsignatura(data.planes[0].ASIGNATURA || "Historia Universal");
          setClaseMes(data.planes[0].MES || "Septiembre");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar currículo:", err);
        setLoading(false);
      });
  }, []);

  // -------------------------------------------------------------
  // SELECTORES DINÁMICOS - PDCs
  // -------------------------------------------------------------
  const pdcMateriasDisponibles = useMemo(() => {
    const list = Array.from(new Set(pdcs.map((p) => p.materia).filter(Boolean)));
    return list.length > 0 ? list : ["Historia de Bolivia", "Historia Universal", "Inglés"];
  }, [pdcs]);

  const pdcAniosDisponibles = useMemo(() => {
    const filtered = pdcs.filter((p) => !pdcMateria || p.materia === pdcMateria);
    const list = Array.from(new Set(filtered.map((p) => p.anio_escolaridad).filter(Boolean)));
    return list.length > 0
      ? list
      : ["1ro de Secundaria", "2do de Secundaria", "3ro de Secundaria", "4to de Secundaria", "Nivel A2-B", "Nivel B1-A"];
  }, [pdcs, pdcMateria]);

  const pdcMesesDisponibles = useMemo(() => {
    const filtered = pdcs.filter(
      (p) => (!pdcMateria || p.materia === pdcMateria) && (!pdcAnio || p.anio_escolaridad === pdcAnio)
    );
    const list = Array.from(new Set(filtered.map((p) => p.mes).filter(Boolean)));
    return list.length > 0
      ? list
      : ["Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre"];
  }, [pdcs, pdcMateria, pdcAnio]);

  // PDC Seleccionado activo
  const selectedPDC = useMemo(() => {
    return (
      pdcs.find(
        (p) =>
          p.materia === pdcMateria &&
          p.anio_escolaridad === pdcAnio &&
          p.mes.toLowerCase() === pdcMes.toLowerCase()
      ) ||
      pdcs.find((p) => p.materia === pdcMateria && p.anio_escolaridad === pdcAnio) ||
      pdcs[0] ||
      null
    );
  }, [pdcs, pdcMateria, pdcAnio, pdcMes]);

  // -------------------------------------------------------------
  // SELECTORES DINÁMICOS - PLANES DE CLASE
  // -------------------------------------------------------------
  const claseGradosDisponibles = useMemo(() => {
    const list = Array.from(new Set(planes.map((p) => p.GRADO).filter(Boolean)));
    return list.length > 0
      ? list
      : ["1º de Secundaria", "2º de Secundaria", "3º de Secundaria", "4º de Secundaria", "Inglés Nivel A2", "Inglés Nivel B1"];
  }, [planes]);

  const claseAsignaturasDisponibles = useMemo(() => {
    const filtered = planes.filter((p) => !claseGrado || p.GRADO === claseGrado);
    const list = Array.from(new Set(filtered.map((p) => p.ASIGNATURA).filter(Boolean)));
    return list.length > 0 ? list : ["Historia Universal", "Historia de Bolivia", "Inglés"];
  }, [planes, claseGrado]);

  const claseMesesDisponibles = useMemo(() => {
    const filtered = planes.filter(
      (p) => (!claseGrado || p.GRADO === claseGrado) && (!claseAsignatura || p.ASIGNATURA === claseAsignatura)
    );
    const list = Array.from(new Set(filtered.map((p) => p.MES).filter(Boolean)));
    return list.length > 0 ? list : ["Septiembre", "Octubre", "Noviembre"];
  }, [planes, claseGrado, claseAsignatura]);

  const matchingClases = useMemo(() => {
    return planes.filter(
      (p) =>
        (!claseGrado || p.GRADO === claseGrado) &&
        (!claseAsignatura || p.ASIGNATURA === claseAsignatura) &&
        (!claseMes || p.MES.toLowerCase() === claseMes.toLowerCase())
    );
  }, [planes, claseGrado, claseAsignatura, claseMes]);

  const displayClases = useMemo(() => {
    if (claseViewMode === "ALL") return matchingClases;
    return matchingClases.filter((c) => String(c.CLASE_NUM) === String(claseViewMode));
  }, [matchingClases, claseViewMode]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ESTILOS DE IMPRESIÓN ESTRICTOS FORMATO CARTA */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #curriculum-printable,
          #curriculum-printable * {
            visibility: visible;
          }
          #curriculum-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white !important;
            font-family: Arial, Helvetica, sans-serif !important;
            color: #000 !important;
          }
          .print-hidden {
            display: none !important;
          }
          @page {
            size: letter portrait;
            margin: 1.2cm 1cm 1.2cm 1cm;
          }
          .pdc-doc-container {
            page-break-inside: auto;
          }
          .clase-item-break {
            page-break-inside: avoid;
            break-inside: avoid;
            margin-bottom: 2rem;
          }
        }
      `}</style>

      {/* BARRA SUPERIOR DE CONTROL (NO IMPRIMIBLE) */}
      <div className="print-hidden bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#266b31] text-white text-[10px] font-bold rounded uppercase tracking-wider">
                Gestión Curricular SEP
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Docente: Lic. Ivan Ezequiel Mancilla Copa
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1 uppercase tracking-tight">
              Planificación Curricular e Impresión Oficial
            </h2>
            <p className="text-xs text-slate-500">
              Genera e imprime Planes de Desarrollo Curricular (PDC) y Planes de Clase en tamaño Carta.
            </p>
          </div>

          {/* Botón de Impresión */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#d6a427] hover:bg-[#b88c1f] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>🖨️ Imprimir Documento (Formato Carta)</span>
          </button>
        </div>

        {/* SELECTOR DE MODO */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveMode("pdc")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeMode === "pdc"
                ? "bg-[#1b4e23] text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <FileText className="w-4 h-4 text-[#d6a427]" />
            <span>📄 Generador de PDC Mensual</span>
            <span className="px-1.5 py-0.2 bg-white/20 rounded text-[10px]">
              {pdcs.length} PDCs
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("planes")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeMode === "planes"
                ? "bg-[#1b4e23] text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#d6a427]" />
            <span>📚 Generador de Planes de Clase</span>
            <span className="px-1.5 py-0.2 bg-white/20 rounded text-[10px]">
              {planes.length} Clases
            </span>
          </button>
        </div>

        {/* FILTROS EN CASCADA MODO PDC */}
        {activeMode === "pdc" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                1. Asignatura / Materia
              </label>
              <select
                value={pdcMateria}
                onChange={(e) => setPdcMateria(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 uppercase focus:ring-2 focus:ring-[#266b31]"
              >
                {pdcMateriasDisponibles.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                2. Año de Escolaridad / Grado
              </label>
              <select
                value={pdcAnio}
                onChange={(e) => setPdcAnio(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 uppercase focus:ring-2 focus:ring-[#266b31]"
              >
                {pdcAniosDisponibles.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                3. Mes Planificado
              </label>
              <select
                value={pdcMes}
                onChange={(e) => setPdcMes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 uppercase focus:ring-2 focus:ring-[#266b31]"
              >
                {pdcMesesDisponibles.map((mes) => (
                  <option key={mes} value={mes}>
                    {mes}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* FILTROS EN CASCADA MODO PLANES DE CLASE */}
        {activeMode === "planes" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                1. Grado / Nivel
              </label>
              <select
                value={claseGrado}
                onChange={(e) => setClaseGrado(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 uppercase focus:ring-2 focus:ring-[#266b31]"
              >
                {claseGradosDisponibles.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                2. Asignatura
              </label>
              <select
                value={claseAsignatura}
                onChange={(e) => setClaseAsignatura(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 uppercase focus:ring-2 focus:ring-[#266b31]"
              >
                {claseAsignaturasDisponibles.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                3. Mes
              </label>
              <select
                value={claseMes}
                onChange={(e) => setClaseMes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 uppercase focus:ring-2 focus:ring-[#266b31]"
              >
                {claseMesesDisponibles.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                4. Visualización / Impresión
              </label>
              <select
                value={claseViewMode}
                onChange={(e) => setClaseViewMode(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-black text-[#1b4e23] uppercase focus:ring-2 focus:ring-[#266b31]"
              >
                <option value="ALL">📚 TODAS LAS CLASES DEL MES ({matchingClases.length})</option>
                {matchingClases.map((c) => (
                  <option key={c.CLASE_NUM} value={c.CLASE_NUM}>
                    Solo Clase Nro. {c.CLASE_NUM}: {c.TEMA ? c.TEMA.slice(0, 28) + "..." : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CONTENEDOR DE IMPRESIÓN OFICIAL TAMAÑO CARTA                    */}
      {/* ------------------------------------------------------------- */}
      <div
        id="curriculum-printable"
        className="bg-white rounded-2xl shadow-xl border border-slate-300 p-6 sm:p-10 text-slate-900 font-sans print:p-0 print:border-none print:shadow-none print:rounded-none"
        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
      >
        {/* ============================================================= */}
        {/* VISTA A: PLAN DE DESARROLLO CURRICULAR (PDC)                 */}
        {/* ============================================================= */}
        {activeMode === "pdc" && (
          <div className="pdc-doc-container space-y-4 text-xs leading-normal text-black">
            {selectedPDC ? (
              <>
                {/* 1. MEMBRETE CENTRADO */}
                <div className="text-center mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://i.imgur.com/wjibHTr.png"
                    alt="Membrete Oficial"
                    className="mx-auto max-h-[110px] object-contain"
                  />
                </div>

                {/* 2. TÍTULO CENTRADO SUBRAYADO */}
                <div className="text-center my-3">
                  <h2 className="text-base sm:text-lg font-bold underline uppercase tracking-wider text-black">
                    PLAN DE DESARROLLO CURRICULAR N° {selectedPDC.nro_pdc || "1"}
                  </h2>
                </div>

                {/* 3. TABLA REFERENCIAL SIN BORDES VISIBLES */}
                <table className="w-full border-collapse text-[11px] mb-3 border-none">
                  <tbody>
                    <tr>
                      <td className="py-1 pr-2 w-1/2">
                        <strong>Distrito:</strong> {selectedPDC.distrito}
                      </td>
                      <td className="py-1 pl-2 w-1/2">
                        <strong>Unidad Educativa:</strong> {selectedPDC.unidad_educativa}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-2">
                        <strong>Maestro/a encargado:</strong> {selectedPDC.maestro}
                      </td>
                      <td className="py-1 pl-2">
                        <strong>Mes:</strong> {selectedPDC.mes}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-2">
                        <strong>Nivel Educativo:</strong> {selectedPDC.nivel}
                      </td>
                      <td className="py-1 pl-2">
                        <strong>Director/a:</strong> {selectedPDC.director}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-2">
                        <strong>Asignatura:</strong> {selectedPDC.asignatura}
                      </td>
                      <td className="py-1 pl-2">
                        <strong>Año de escolaridad:</strong> {selectedPDC.anio_escolaridad}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* 4. TABLA CON BORDES NEGROS: PERFILES DE SALIDA Y OBJETIVO */}
                <table
                  className="w-full border-collapse text-[11px] mb-3"
                  style={{ border: "1px solid #000" }}
                >
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #000" }}>
                      <td
                        className="p-2 font-bold uppercase w-1/4 align-top"
                        style={{ borderRight: "1px solid #000", backgroundColor: "#f8fafc" }}
                      >
                        PERFILES DE SALIDA:
                      </td>
                      <td className="p-2 align-top text-justify">
                        {selectedPDC.perfiles_salida}
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="p-2 font-bold uppercase w-1/4 align-top"
                        style={{ borderRight: "1px solid #000", backgroundColor: "#f8fafc" }}
                      >
                        OBJETIVO:
                      </td>
                      <td className="p-2 align-top text-justify">
                        {selectedPDC.objetivo_holistico}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* 5. TABLA MATRIZ DE 4 COLUMNAS CON BORDES NEGROS */}
                <table
                  className="w-full border-collapse text-[11px] mb-3"
                  style={{ border: "1px solid #000" }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#f1f5f9", borderBottom: "1px solid #000" }}>
                      <th
                        className="p-2 font-bold text-center uppercase"
                        style={{ width: "25%", borderRight: "1px solid #000" }}
                      >
                        CONTENIDOS A DESARROLLAR
                      </th>
                      <th
                        className="p-2 font-bold text-center uppercase"
                        style={{ width: "30%", borderRight: "1px solid #000" }}
                      >
                        ORIENTACIONES METODOLÓGICAS
                      </th>
                      <th
                        className="p-2 font-bold text-center uppercase"
                        style={{ width: "20%", borderRight: "1px solid #000" }}
                      >
                        RECURSOS
                      </th>
                      <th
                        className="p-2 font-bold text-center uppercase"
                        style={{ width: "25%" }}
                      >
                        CRITERIOS DE EVALUACIÓN
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {/* CONTENIDOS (25%) */}
                      <td
                        className="p-2 align-top text-justify"
                        style={{ borderRight: "1px solid #000" }}
                      >
                        {selectedPDC.contenidos}
                      </td>

                      {/* ORIENTACIONES METODOLÓGICAS (30%) */}
                      <td
                        className="p-2 align-top space-y-2 text-justify"
                        style={{ borderRight: "1px solid #000" }}
                      >
                        {selectedPDC.practica && (
                          <div>
                            <strong>PRÁCTICA:</strong> {selectedPDC.practica}
                          </div>
                        )}
                        {selectedPDC.teoria && (
                          <div className="mt-1">
                            <strong>TEORÍA:</strong> {selectedPDC.teoria}
                          </div>
                        )}
                        {selectedPDC.valoracion && (
                          <div className="mt-1">
                            <strong>VALORACIÓN:</strong> {selectedPDC.valoracion}
                          </div>
                        )}
                        {selectedPDC.produccion && (
                          <div className="mt-1">
                            <strong>PRODUCCIÓN:</strong> {selectedPDC.produccion}
                          </div>
                        )}
                      </td>

                      {/* RECURSOS (20%) */}
                      <td
                        className="p-2 align-top space-y-2 text-justify"
                        style={{ borderRight: "1px solid #000" }}
                      >
                        {selectedPDC.materiales_vida && (
                          <div>
                            <strong>MATERIALES DE LA VIDA:</strong> {selectedPDC.materiales_vida}
                          </div>
                        )}
                        {selectedPDC.materiales_analogicos && (
                          <div className="mt-1">
                            <strong>MATERIALES ANALÓGICOS/DIGITALES:</strong>{" "}
                            {selectedPDC.materiales_analogicos}
                          </div>
                        )}
                      </td>

                      {/* CRITERIOS DE EVALUACIÓN (25%) */}
                      <td className="p-2 align-top space-y-2 text-justify">
                        {selectedPDC.ser && (
                          <div>
                            <strong>SER:</strong> {selectedPDC.ser}
                          </div>
                        )}
                        {selectedPDC.saber && (
                          <div className="mt-1">
                            <strong>SABER:</strong> {selectedPDC.saber}
                          </div>
                        )}
                        {selectedPDC.hacer && (
                          <div className="mt-1">
                            <strong>HACER:</strong> {selectedPDC.hacer}
                          </div>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* 6. TABLA INFERIOR CON BORDES NEGROS */}
                <table
                  className="w-full border-collapse text-[11px] mb-6"
                  style={{ border: "1px solid #000" }}
                >
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #000" }}>
                      <td
                        className="p-2 font-bold uppercase w-1/4 align-top"
                        style={{ borderRight: "1px solid #000", backgroundColor: "#f8fafc" }}
                      >
                        ADAPTACIÓN CURRICULAR:
                      </td>
                      <td className="p-2 align-top text-justify">
                        {selectedPDC.adaptacion_curricular || "No requerida"}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #000" }}>
                      <td
                        className="p-2 font-bold uppercase w-1/4 align-top"
                        style={{ borderRight: "1px solid #000", backgroundColor: "#f8fafc" }}
                      >
                        PRODUCTO:
                      </td>
                      <td className="p-2 align-top text-justify">{selectedPDC.producto}</td>
                    </tr>
                    <tr>
                      <td
                        className="p-2 font-bold uppercase w-1/4 align-top"
                        style={{ borderRight: "1px solid #000", backgroundColor: "#f8fafc" }}
                      >
                        COMPETENCIA:
                      </td>
                      <td className="p-2 align-top text-justify">{selectedPDC.competencia}</td>
                    </tr>
                  </tbody>
                </table>

                {/* 7. PIE DE PÁGINA: FECHA Y FIRMAS */}
                <div className="pt-4">
                  <p className="italic text-right text-[11px] mb-12">
                    Sucre, {selectedPDC.fecha_emision || "02/02/2026"}
                  </p>

                  <div className="grid grid-cols-2 gap-12 text-center text-xs">
                    <div>
                      <div className="w-56 mx-auto border-t border-black pt-1">
                        <p className="font-bold uppercase tracking-wider">FIRMA MAESTRA (O)</p>
                        <p className="text-[10px] text-slate-700">{selectedPDC.maestro}</p>
                      </div>
                    </div>
                    <div>
                      <div className="w-56 mx-auto border-t border-black pt-1">
                        <p className="font-bold uppercase tracking-wider">FIRMA DIRECTOR</p>
                        <p className="text-[10px] text-slate-700">{selectedPDC.director}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-400">
                No se encontraron PDCs que coincidan con los filtros seleccionados.
              </div>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* VISTA B: PLANES DE CLASE                                     */}
        {/* ============================================================= */}
        {activeMode === "planes" && (
          <div className="space-y-8 text-black">
            {displayClases.length > 0 ? (
              displayClases.map((clase, idx) => (
                <div key={clase.CLASE_NUM || idx} className="clase-item-break space-y-4">
                  {/* Encabezado de la Clase */}
                  <div className="border-b-2 border-black pb-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm sm:text-base uppercase tracking-wide">
                        I. DATOS Y COMPETENCIAS - CLASE NRO. {clase.CLASE_NUM}
                      </h3>
                      <p className="text-[11px] text-slate-800">
                        <strong>Docente:</strong> {clase.DOCENTE} • <strong>Asignatura:</strong>{" "}
                        {clase.ASIGNATURA} • <strong>Nivel:</strong> {clase.GRADO} •{" "}
                        <strong>Mes:</strong> {clase.MES}
                      </p>
                    </div>
                    <div className="text-right text-[11px]">
                      <span className="font-bold uppercase">Fielding Bolivia</span>
                      <p className="text-slate-500">Gestión {clase.ANO || "2026"}</p>
                    </div>
                  </div>

                  {/* Bloque I: Objetivo, Competencia, Grillas */}
                  <div className="space-y-2 text-[11px]">
                    <div className="p-2.5 bg-slate-50 rounded border border-black/40 text-justify">
                      <strong className="block uppercase text-[10px] text-slate-700">
                        Objetivo Holístico:
                      </strong>
                      <span>{clase.OBJETIVO_HOLISTICO}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded border border-black/40 text-justify">
                      <strong className="block uppercase text-[10px] text-slate-700">
                        Competencia:
                      </strong>
                      <span>{clase.COMPETENCIA}</span>
                    </div>

                    {/* Grilla 1: Capacidades y Actitudes (SER) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="p-2.5 bg-white border border-black rounded text-justify">
                        <strong className="block uppercase text-[10px] mb-1">Capacidades:</strong>
                        <div className="whitespace-pre-line">{clase.CAPACIDADES}</div>
                      </div>
                      <div className="p-2.5 bg-white border border-black rounded text-justify">
                        <strong className="block uppercase text-[10px] mb-1">
                          Actitudes y Valores (Ser):
                        </strong>
                        <div className="whitespace-pre-line">{clase.ACTITUDES_SER}</div>
                      </div>
                    </div>

                    {/* Grilla 2: Saber y Hacer */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="p-2.5 bg-white border border-black rounded text-justify">
                        <strong className="block uppercase text-[10px] mb-1">
                          Indicadores Saber:
                        </strong>
                        <div>{clase.INDICADORES_SABER}</div>
                      </div>
                      <div className="p-2.5 bg-white border border-black rounded text-justify">
                        <strong className="block uppercase text-[10px] mb-1">
                          Indicadores Hacer:
                        </strong>
                        <div>{clase.INDICADORES_HACER}</div>
                      </div>
                    </div>
                  </div>

                  {/* Bloque II: Secuencia Didáctica */}
                  <div className="space-y-2 pt-2">
                    <h4 className="font-bold text-xs uppercase tracking-wide border-b border-black pb-1">
                      II. SECUENCIA DIDÁCTICA: {clase.TEMA}
                    </h4>

                    <table
                      className="w-full border-collapse text-[11px]"
                      style={{ border: "1px solid #000" }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: "#f1f5f9", borderBottom: "1px solid #000" }}>
                          <th
                            className="p-2 text-center font-bold uppercase"
                            style={{ width: "12%", borderRight: "1px solid #000" }}
                          >
                            Fase
                          </th>
                          <th
                            className="p-2 text-center font-bold uppercase"
                            style={{ width: "53%", borderRight: "1px solid #000" }}
                          >
                            Actividades y Estrategias
                          </th>
                          <th
                            className="p-2 text-center font-bold uppercase"
                            style={{ width: "35%" }}
                          >
                            Recursos y Evaluación
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Fila 1: INICIO */}
                        <tr style={{ borderBottom: "1px solid #000" }}>
                          <td
                            className="p-2 font-bold text-center uppercase align-top"
                            style={{ borderRight: "1px solid #000", backgroundColor: "#f8fafc" }}
                          >
                            INICIO
                          </td>
                          <td
                            className="p-2 align-top text-justify"
                            style={{ borderRight: "1px solid #000" }}
                          >
                            {clase.FASE_INICIO}
                          </td>
                          {/* Columna 3 con rowSpan={4} */}
                          <td
                            rowSpan={4}
                            className="p-2.5 align-top space-y-2 text-justify"
                            style={{ backgroundColor: "#fafaf9" }}
                          >
                            {clase.RECURSOS && (
                              <div>
                                <strong className="block uppercase text-[10px]">Recursos:</strong>
                                <span>{clase.RECURSOS}</span>
                              </div>
                            )}
                            {clase.INSTRUMENTOS_EVALUACION && (
                              <div className="mt-2">
                                <strong className="block uppercase text-[10px]">
                                  Instrumentos:
                                </strong>
                                <span>{clase.INSTRUMENTOS_EVALUACION}</span>
                              </div>
                            )}
                            {clase.EVALUACION_DETALLE && (
                              <div className="mt-2">
                                <strong className="block uppercase text-[10px]">
                                  Evaluación D.:
                                </strong>
                                <span>{clase.EVALUACION_DETALLE}</span>
                              </div>
                            )}
                            {clase.ADAPTACIONES && (
                              <div className="mt-2">
                                <strong className="block uppercase text-[10px]">
                                  Adaptaciones:
                                </strong>
                                <span>{clase.ADAPTACIONES}</span>
                              </div>
                            )}
                          </td>
                        </tr>

                        {/* Fila 2: ADQUISICIÓN */}
                        <tr style={{ borderBottom: "1px solid #000" }}>
                          <td
                            className="p-2 font-bold text-center uppercase align-top"
                            style={{ borderRight: "1px solid #000", backgroundColor: "#f8fafc" }}
                          >
                            ADQUISICIÓN
                          </td>
                          <td
                            className="p-2 align-top text-justify"
                            style={{ borderRight: "1px solid #000" }}
                          >
                            {clase.FASE_ADQUISICION}
                          </td>
                        </tr>

                        {/* Fila 3: APLICACIÓN */}
                        <tr style={{ borderBottom: "1px solid #000" }}>
                          <td
                            className="p-2 font-bold text-center uppercase align-top"
                            style={{ borderRight: "1px solid #000", backgroundColor: "#f8fafc" }}
                          >
                            APLICACIÓN
                          </td>
                          <td
                            className="p-2 align-top text-justify"
                            style={{ borderRight: "1px solid #000" }}
                          >
                            {clase.FASE_APLICACION}
                          </td>
                        </tr>

                        {/* Fila 4: EVALUACIÓN */}
                        <tr>
                          <td
                            className="p-2 font-bold text-center uppercase align-top"
                            style={{ borderRight: "1px solid #000", backgroundColor: "#f8fafc" }}
                          >
                            EVALUACIÓN
                          </td>
                          <td
                            className="p-2 align-top text-justify"
                            style={{ borderRight: "1px solid #000" }}
                          >
                            {clase.FASE_EVALUACION}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Separador entre clases al imprimir todas */}
                  {claseViewMode === "ALL" && idx < displayClases.length - 1 && (
                    <div className="border-t-2 border-dashed border-slate-400 my-6 print:border-black print:my-8" />
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                No se encontraron Planes de Clase que coincidan con los filtros seleccionados.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
