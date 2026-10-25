"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  BookOpen,
  Calendar,
  Bell,
  MessageSquare,
  Award,
  RefreshCw,
  FileSpreadsheet,
  Printer,
  Send,
  PlusCircle,
  CheckCircle2,
  Users,
  GraduationCap,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Clock,
  LogOut,
  SlidersHorizontal,
  ChevronRight,
  Zap,
  FileText,
  UserCheck,
} from "lucide-react";
import { getGradeColorClass, getClasificacionCurricular } from "@/lib/siged";
import BoletinModal, { StudentData } from "@/components/BoletinModal";
import TeacherCurriculumHub from "@/components/TeacherCurriculumHub";

type Role = "parent" | "student" | "teacher" | "admin";
type PeriodKey = "t1" | "t2" | "t3" | "final";

// SEMILLA DE RESPALDO INTEGRADA (FALLBACK_SEED) PARA 1RO-SEC
const FALLBACK_SEED = {
  stats: { teachers: 2, students: 3 },
  teachers: [
    {
      id: "TCH-1",
      full_name: "Lic. Ivan Ezequiel Mancilla Copa",
      username: "prof_ivan.mancilla",
      assignments: [
        {
          course: "1RO-SEC",
          subject: "HISTORIA DE BOLIVIA",
          drive_url: "https://docs.google.com/spreadsheets/d/1historia_bolivia_1sec_fielding/edit",
        },
        {
          course: "1RO-SEC",
          subject: "HISTORIA UNIVERSAL",
          drive_url: "https://docs.google.com/spreadsheets/d/1historia_universal_1sec_fielding/edit",
        },
        {
          course: "1RO-SEC",
          subject: "LENGUA EXTRANJERA",
          drive_url: "https://docs.google.com/spreadsheets/d/1ingles_1sec_fielding/edit",
        },
      ],
    },
    {
      id: "TCH-2",
      full_name: "Pacheco Rendon Jose Adrian",
      username: "prof_pacheco.rendon",
      assignments: [
        {
          course: "1RO-SEC",
          subject: "QUÍMICA",
          drive_url: "https://docs.google.com/spreadsheets/d/1dUFGC3ti6h1zKa_5mQbvJ2_YMROBk9AXyGQIHPKeZTQ/edit",
        },
      ],
    },
  ],
  students: [
    {
      id: "STU-1",
      full_name: "ALIAGA RAMOS YUSUF ADEL",
      student_username: "est_aliaga.ramos",
      parent_username: "fam_aliaga.ramos",
      course: "1RO-SEC",
      english_level: "B1-A",
      rude_code: "807300222026101",
      grades: {
        QUÍMICA: {
          profesor: "Pacheco Rendon Jose Adrian",
          campo: "VIDA TIERRA TERRITORIO",
          area: "CIENCIAS NATURALES",
          t1: { ser: "10", saber: "42", hacer: "39", auto: "5", total: "96" },
          t2: { ser: "10", saber: "45", hacer: "35", auto: "5", total: "95" },
          t3: { ser: "10", saber: "43", hacer: "38", auto: "5", total: "96" },
          final: "96",
          estado: "APROBADO",
        },
        "HISTORIA DE BOLIVIA": {
          profesor: "Lic. Ivan Ezequiel Mancilla Copa",
          campo: "COMUNIDAD Y SOCIEDAD",
          area: "CIENCIAS SOCIALES",
          t1: { ser: "10", saber: "43", hacer: "38", auto: "5", total: "96" },
          t2: { ser: "10", saber: "44", hacer: "39", auto: "5", total: "98" },
          t3: { ser: "10", saber: "45", hacer: "40", auto: "5", total: "100" },
          final: "98",
          estado: "APROBADO",
        },
        "HISTORIA UNIVERSAL": {
          profesor: "Lic. Ivan Ezequiel Mancilla Copa",
          campo: "COMUNIDAD Y SOCIEDAD",
          area: "CIENCIAS SOCIALES",
          t1: { ser: "9", saber: "42", hacer: "38", auto: "5", total: "94" },
          t2: { ser: "10", saber: "43", hacer: "39", auto: "5", total: "97" },
          t3: { ser: "10", saber: "44", hacer: "38", auto: "5", total: "97" },
          final: "96",
          estado: "APROBADO",
        },
        "LENGUA EXTRANJERA": {
          profesor: "Lic. Ivan Ezequiel Mancilla Copa (B1-A)",
          campo: "COMUNIDAD Y SOCIEDAD",
          area: "COMUNICACIÓN Y LENGUAJES",
          t1: { ser: "10", saber: "41", hacer: "38", auto: "5", total: "94" },
          t2: { ser: "9", saber: "42", hacer: "37", auto: "5", total: "93" },
          t3: { ser: "10", saber: "44", hacer: "39", auto: "5", total: "98" },
          final: "95",
          estado: "APROBADO",
        },
      },
    },
  ],
};

export default function FieldingDashboard() {
  const [role, setRole] = useState<Role>("teacher");
  const [currentUser, setCurrentUser] = useState<string>("prof_ivan.mancilla");
  const [currentName, setCurrentName] = useState<string>("Lic. Ivan Ezequiel Mancilla Copa");

  const [seedData, setSeedData] = useState<any>(FALLBACK_SEED);
  const [loading, setLoading] = useState(true);

  // Sub-pestañas para la vista de Docente (Teacher)
  const [teacherSubTab, setTeacherSubTab] = useState<"curriculum" | "drive" | "agenda">("curriculum");

  // Estados de navegación móvil (Padres / Estudiantes)
  const [mobileTab, setMobileTab] = useState<"notas" | "calendario" | "avisos" | "chat">("notas");
  const [selectedStudentIdx, setSelectedStudentIdx] = useState(0);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodKey>("final");

  // Estados de Dirección (Matriz Centralizadora)
  const [adminCategory, setAdminCategory] = useState<"PRIMARIA" | "SECUNDARIA" | "SIGED" | "HONOR">("SECUNDARIA");
  const [selectedCourse, setSelectedCourse] = useState<string>("1RO-SEC");
  const [searchStudent, setSearchStudent] = useState("");
  const [boletinStudent, setBoletinStudent] = useState<StudentData | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>("Conectado en tiempo real (< 45ms)");
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Calendario de Tareas y Exámenes
  const [events, setEvents] = useState([
    {
      id: 1,
      course: "1RO-SEC",
      subject: "HISTORIA DE BOLIVIA",
      type: "TAREA",
      title: "Montaje y Fichas Descriptivas del Museo Familiar",
      date: "2026-10-25",
      teacher: "Lic. Ivan Ezequiel Mancilla Copa",
    },
    {
      id: 2,
      course: "1RO-SEC",
      subject: "HISTORIA UNIVERSAL",
      type: "EXAMEN",
      title: "Evaluación Oral: Feudalismo y Régimen de Vasallaje",
      date: "2026-10-28",
      teacher: "Lic. Ivan Ezequiel Mancilla Copa",
    },
    {
      id: 3,
      course: "1RO-SEC",
      subject: "LENGUA EXTRANJERA",
      type: "PROYECTO",
      title: "Speaking Project Unit 6: Historical Heritage",
      date: "2026-10-30",
      teacher: "Lic. Ivan Ezequiel Mancilla Copa",
    },
  ]);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventSubject, setNewEventSubject] = useState("HISTORIA DE BOLIVIA");
  const [newEventType, setNewEventType] = useState<"TAREA" | "EXAMEN" | "PROYECTO">("TAREA");
  const [newEventDate, setNewEventDate] = useState("2026-10-29");

  // Avisos Institucionales
  const [announcements] = useState([
    {
      id: 1,
      title: "Publicación de Planes de Clase y PDCs Gestión 2026",
      body: "Los Planes de Desarrollo Curricular (PDCs) y secuencias didácticas de clases ya están disponibles para su impresión oficial.",
      priority: "IMPORTANTE",
      date: "Hoy, 08:30 AM",
    },
    {
      id: 2,
      title: "Sincronización Instantánea de Cuadernos Pedagógicos",
      body: "Las notas de las 4 dimensiones (Ser, Saber, Hacer, Decidir/Auto) se encuentran actualizadas en vivo desde Google Sheets.",
      priority: "NORMAL",
      date: "Ayer",
    },
  ]);

  // Mensajería Directa Padre <-> Profesor
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Lic. Ivan Ezequiel Mancilla Copa (Historia)",
      isTeacher: true,
      text: "Estimada familia Aliaga Ramos, Yusuf ha tenido una destacada participación en el análisis de fuentes históricas.",
      time: "09:15 AM",
    },
    {
      id: 2,
      sender: "Familia Aliaga Ramos",
      isTeacher: false,
      text: "Muchas gracias profesor Mancilla, Yusuf ya tiene listo el material para la exposición del Museo Familiar.",
      time: "10:30 AM",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  // Cargar parámetros de la URL: role, user, name
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get("role") as Role;
      const urlUser = params.get("user");
      const urlName = params.get("name");

      if (urlRole && ["parent", "student", "teacher", "admin"].includes(urlRole)) {
        setRole(urlRole);
      }
      if (urlUser) {
        setCurrentUser(urlUser);
      }
      if (urlName) {
        setCurrentName(decodeURIComponent(urlName));
      } else {
        // Asignar nombre predeterminado según rol
        if (urlRole === "admin") setCurrentName("Ing. José Mariano Pinaya");
        else if (urlRole === "teacher") setCurrentName("Lic. Ivan Ezequiel Mancilla Copa");
        else if (urlRole === "parent") setCurrentName("Familia Aliaga Ramos");
        else if (urlRole === "student") setCurrentName("Aliaga Ramos Yusuf Adel");
      }
    }

    loadDataFromApi(false).finally(() => setLoading(false));
  }, []);

  // Función para cargar datos desde /api/seed
  const loadDataFromApi = async (isManualSync = false) => {
    const t0 = performance.now();
    try {
      if (isManualSync) {
        setIsSyncing(true);
        setSyncStatus("Sincronizando con Google Sheets...");

        try {
          await fetch("/api/sync-drive", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              secret: "80f145381e",
              course: selectedCourse,
              subject: "GLOBAL",
            }),
          });
        } catch (e) {
          console.warn("Fallo secundario en webhook sync-drive", e);
        }
      }

      const res = await fetch("/api/seed", {
        cache: "no-store",
        headers: {
          Pragma: "no-cache",
          "Cache-Control": "no-cache",
        },
      });

      if (!res.ok) throw new Error("Respuesta no OK de /api/seed");
      const json = await res.json();
      const t1 = performance.now();
      const latency = Math.round(t1 - t0);

      if (json?.students && json.students.length > 0) {
        setSeedData(json);
        if (!selectedCourse) {
          setSelectedCourse(json.students[0].course || "1RO-SEC");
        }
      }

      setLastLatencyMs(latency);
      setSyncStatus(`Sincronizado en ${latency}ms • En vivo`);
      setIsSyncing(false);
      return latency;
    } catch (err) {
      const t1 = performance.now();
      const latency = Math.round(t1 - t0);
      setLastLatencyMs(latency);
      setSyncStatus(`Modo Local Activo (${latency}ms)`);
      setIsSyncing(false);
      return latency;
    }
  };

  const handleSyncDrive = async () => {
    await loadDataFromApi(true);
  };

  // Determinar si el usuario tiene privilegios de Director para cambiar de rol
  const canSwitchRole = currentUser === "admin_direccion" || role === "admin";

  const currentStudent =
    seedData.students && seedData.students.length > 0
      ? seedData.students[selectedStudentIdx] || seedData.students[0]
      : FALLBACK_SEED.students[0];

  // Agrupación de cursos disponibles
  const coursesByLevel = useMemo(() => {
    const prim = new Set<string>();
    const sec = new Set<string>();
    (seedData.students || []).forEach((s: any) => {
      const c = String(s.course || "").toUpperCase();
      if (c.includes("PRIM")) prim.add(s.course);
      else if (c.includes("SEC")) sec.add(s.course);
    });
    return {
      PRIMARIA: Array.from(prim).sort(),
      SECUNDARIA: Array.from(sec).sort(),
    };
  }, [seedData]);

  // Estudiantes del curso activo para la Matriz Centralizadora
  const courseStudents = useMemo(() => {
    return (seedData.students || [])
      .filter((s: any) => s.course === selectedCourse)
      .filter((s: any) =>
        s.full_name.toLowerCase().includes(searchStudent.toLowerCase())
      )
      .sort((a: any, b: any) => a.full_name.localeCompare(b.full_name));
  }, [seedData, selectedCourse, searchStudent]);

  // Materias o Áreas del curso activo
  const courseSubjects = useMemo(() => {
    const set = new Set<string>();
    (courseStudents || []).forEach((s: any) => {
      Object.keys(s.grades || {}).forEach((m) => {
        if (adminCategory === "SIGED") {
          const cl = getClasificacionCurricular(m, selectedCourse);
          set.add(cl.area);
        } else {
          set.add(m);
        }
      });
    });
    return Array.from(set).sort();
  }, [courseStudents, adminCategory, selectedCourse]);

  // Cuadro de Honor Top 5 del Colegio
  const honorRollSchool = useMemo(() => {
    const list = (seedData.students || []).map((s: any) => {
      const vals = Object.values(s.grades || {})
        .map((g: any) => {
          const v = period === "final" ? g?.final : g?.[period]?.total;
          return parseFloat(String(v ?? "").replace(",", "."));
        })
        .filter((n: number) => !isNaN(n));
      const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      return { ...s, avg: avg.toFixed(1), numAvg: avg };
    });
    return list.sort((a: any, b: any) => b.numAvg - a.numAvg).slice(0, 5);
  }, [seedData, period]);

  // Promedio General del Estudiante Actual (Padre / Estudiante)
  const currentStudentAverage = useMemo(() => {
    const vals = Object.values(currentStudent.grades || {})
      .map((g: any) => {
        const v = period === "final" ? g?.final : g?.[period]?.total;
        return parseFloat(String(v ?? "").replace(",", "."));
      })
      .filter((n: number) => !isNaN(n));
    return vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "0.0";
  }, [currentStudent, period]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: role === "teacher" ? currentName : `Familia ${currentStudent.full_name}`,
      isTeacher: role === "teacher",
      text: chatInput,
      time: "Ahora",
    };

    setMessages((prev) => [...prev, newMsg]);
    setChatInput("");
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const ev = {
      id: Date.now(),
      course: "1RO-SEC",
      subject: newEventSubject,
      type: newEventType,
      title: newEventTitle,
      date: newEventDate,
      teacher: currentName,
    };

    setEvents((prev) => [ev, ...prev]);
    setNewEventTitle("");
    alert("¡Actividad programada exitosamente en el calendario institucional!");
  };

  return (
    <div className="min-h-screen bg-[#FAFAF0] text-slate-800 font-sans pb-16">
      {/* 1. BARRA INSTITUCIONAL SUPERIOR */}
      <header className="sticky top-0 z-40 bg-[#1b4e23] border-b-4 border-[#d6a427] text-white shadow-lg print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Logo y Nombre */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FAFAF0] rounded-xl flex items-center justify-center text-[#1b4e23] shadow-md border border-[#d6a427]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-sm sm:text-base uppercase tracking-wider text-white">
                Colegio Fielding Bolivia
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] text-[#9ac29d] font-semibold tracking-wide flex items-center gap-1">
                  {lastLatencyMs !== null && <Zap className="w-3 h-3 text-[#d6a427]" />}
                  {syncStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Selector de los 4 Roles: EXCLUSIVO PARA ADMINISTRADOR / DIRECTOR */}
          {canSwitchRole ? (
            <div className="flex items-center bg-[#123617] p-1 rounded-xl border border-emerald-900/40">
              <span className="text-[10px] font-bold text-slate-300 uppercase px-2 hidden md:inline">
                Cambiar Rol:
              </span>
              {(
                [
                  { id: "parent", label: "Padres", icon: Users },
                  { id: "student", label: "Estudiante", icon: GraduationCap },
                  { id: "teacher", label: "Profesor", icon: BookOpen },
                  { id: "admin", label: "Dirección", icon: ShieldCheck },
                ] as const
              ).map((item) => {
                const Icon = item.icon;
                const isActive = role === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#d6a427] text-slate-950 shadow-md scale-102"
                        : "text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Badge de Perfil Restringido para Docentes, Padres y Estudiantes */
            <div className="flex items-center gap-2 bg-[#123617] px-3.5 py-1.5 rounded-xl border border-emerald-900/40">
              <UserCheck className="w-4 h-4 text-[#d6a427]" />
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold text-[#9ac29d] block leading-tight">
                  Sesión activa ({role.toUpperCase()})
                </span>
                <span className="text-xs font-black text-white uppercase truncate block max-w-[200px] sm:max-w-[280px]">
                  {currentName}
                </span>
              </div>
            </div>
          )}

          {/* Salir / Cerrar Sesión */}
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-[#d6a427] font-bold uppercase transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:inline">Salir</span>
          </a>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL SEGÚN EL ROL AUTENTICADO */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ========================================================================= */}
        {/* VISTA 1 & 2: PADRE DE FAMILIA / ESTUDIANTE (MOBILE-FIRST)                  */}
        {/* ========================================================================= */}
        {(role === "parent" || role === "student") && (
          <div className="max-w-2xl mx-auto space-y-5">
            {/* Selector de Estudiante */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#266b31]/10 text-[#266b31] flex items-center justify-center font-black text-lg border border-[#266b31]/20">
                  {currentStudent.full_name.charAt(0)}
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                    {role === "parent" ? "Estudiante Vinculado:" : "Estudiante:"}
                  </span>
                  <h2 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase">
                    {currentStudent.full_name}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-2 py-0.5 bg-[#266b31] text-white text-[10px] font-bold rounded-md uppercase">
                      {currentStudent.course}
                    </span>
                    {currentStudent.english_level && (
                      <span className="px-2 py-0.5 bg-[#dcfce7] text-[#15803d] text-[10px] font-bold rounded-md uppercase">
                        Inglés: {currentStudent.english_level}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón Descargar Boletín Oficial */}
              <button
                type="button"
                onClick={() => setBoletinStudent(currentStudent)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#d6a427] hover:bg-[#b88c1f] text-slate-900 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer ml-auto"
              >
                <Printer className="w-4 h-4" />
                <span>Boletín Oficial</span>
              </button>
            </div>

            {/* Sub-Pestañas Móviles */}
            <div className="grid grid-cols-4 bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
              {[
                { id: "notas", label: "Notas", icon: BookOpen },
                { id: "calendario", label: "Agenda", icon: Calendar },
                { id: "avisos", label: "Avisos", icon: Bell },
                { id: "chat", label: "Mensajes", icon: MessageSquare },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = mobileTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setMobileTab(t.id as any)}
                    className={`py-2.5 flex flex-col items-center gap-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#266b31] text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* CONTENIDO PESTAÑA 1: NOTAS / CALIFICACIONES */}
            {mobileTab === "notas" && (
              <div className="space-y-4">
                {/* Selector de Período / Trimestre */}
                <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200">
                  {(
                    [
                      { id: "t1", label: "1T" },
                      { id: "t2", label: "2T" },
                      { id: "t3", label: "3T" },
                      { id: "final", label: "Anual" },
                    ] as const
                  ).map((p) => {
                    const isSelected = period === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPeriod(p.id)}
                        className={`flex-1 py-1.5 mx-1 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer text-center ${
                          isSelected
                            ? "bg-[#1b4e23] text-white shadow"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                {/* Banner de Promedio General del Trimestre Seleccionado */}
                <div className="bg-gradient-to-r from-[#266b31] to-[#1b4e23] text-white p-5 rounded-2xl shadow-md border-b-4 border-[#d6a427] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#9ac29d] tracking-wider block">
                      Promedio ({period.toUpperCase()})
                    </span>
                    <h3 className="text-3xl font-black mt-0.5">{currentStudentAverage}</h3>
                    <span className="text-[11px] text-white/80">
                      Escala Oficial Sistema Educativo Boliviano
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-lg font-black text-xs uppercase tracking-wider ${
                        Number(currentStudentAverage) >= 51
                          ? "bg-[#dcfce7] text-[#15803d]"
                          : "bg-[#fee2e2] text-[#b91c1c]"
                      }`}
                    >
                      {Number(currentStudentAverage) >= 51 ? "Aprobado" : "En Riesgo"}
                    </span>
                  </div>
                </div>

                {/* Listado de Materias Desplegables con las 4 Dimensiones */}
                <div className="space-y-3">
                  {Object.entries(currentStudent.grades || {}).map(([matKey, grade]: [string, any]) => {
                    const isExpanded = expandedSubject === matKey;
                    const periodGrade = period === "final" ? grade?.final : grade?.[period]?.total;
                    const dim = period === "final" ? grade?.t3 || {} : grade?.[period] || {};

                    return (
                      <div
                        key={matKey}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all"
                      >
                        {/* Cabecera de la materia (Click para desplegar) */}
                        <button
                          type="button"
                          onClick={() => setExpandedSubject(isExpanded ? null : matKey)}
                          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <div className="flex-1 pr-3">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                              {grade?.area || "ÁREA CURRICULAR"}
                            </span>
                            <h4 className="font-extrabold text-sm uppercase text-slate-900">
                              {matKey}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {grade?.profesor || "Docente Asignado"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1.5 rounded-xl font-black text-sm font-mono ${getGradeColorClass(
                                periodGrade
                              )}`}
                            >
                              {periodGrade ?? "-"}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </button>

                        {/* Desglose de las 4 Dimensiones Bolivianas */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 bg-slate-50/80 border-t border-slate-100">
                            <p className="text-[10px] font-extrabold uppercase text-[#266b31] tracking-wider mb-2.5">
                              Desglose de Dimensiones ({period.toUpperCase()}):
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {/* SER (10 pts) */}
                              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                                <span className="text-[9px] font-extrabold uppercase text-slate-400 block">
                                  SER (10)
                                </span>
                                <span className="text-base font-black text-slate-800">
                                  {dim?.ser ?? "-"}
                                </span>
                              </div>
                              {/* SABER (45 pts) */}
                              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                                <span className="text-[9px] font-extrabold uppercase text-slate-400 block">
                                  SABER (45)
                                </span>
                                <span className="text-base font-black text-slate-800">
                                  {dim?.saber ?? "-"}
                                </span>
                              </div>
                              {/* HACER (40 pts) */}
                              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                                <span className="text-[9px] font-extrabold uppercase text-slate-400 block">
                                  HACER (40)
                                </span>
                                <span className="text-base font-black text-slate-800">
                                  {dim?.hacer ?? "-"}
                                </span>
                              </div>
                              {/* AUTOEVALUACIÓN (5 pts) */}
                              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                                <span className="text-[9px] font-extrabold uppercase text-slate-400 block">
                                  AUTO (5)
                                </span>
                                <span className="text-base font-black text-slate-800">
                                  {dim?.auto ?? "-"}
                                </span>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                              <span>Total Trimestral:</span>
                              <strong className="text-slate-900 font-bold">
                                {dim?.total ?? periodGrade ?? "-"} / 100 pts
                              </strong>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CONTENIDO PESTAÑA 2: AGENDA Y CALENDARIO */}
            {mobileTab === "calendario" && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-extrabold text-sm uppercase text-slate-900 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#266b31]" />
                    <span>Tareas y Evaluaciones Programadas</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calendario oficial del curso {currentStudent.course}
                  </p>
                </div>

                <div className="space-y-3">
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              ev.type === "EXAMEN"
                                ? "bg-red-100 text-red-700"
                                : ev.type === "TAREA"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {ev.type}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {ev.subject}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">{ev.title}</h4>
                        <p className="text-xs text-slate-500">Profesor: {ev.teacher}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Fecha Límite:
                        </span>
                        <span className="text-xs font-black text-[#1b4e23]">{ev.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONTENIDO PESTAÑA 3: AVISOS INSTITUCIONALES */}
            {mobileTab === "avisos" && (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div
                    key={a.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          a.priority === "URGENTE"
                            ? "bg-red-100 text-red-700 border border-red-300"
                            : a.priority === "IMPORTANTE"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {a.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{a.date}</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">{a.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{a.body}</p>
                  </div>
                ))}
              </div>
            )}

            {/* CONTENIDO PESTAÑA 4: CHAT DIRECTO CON PROFESORES */}
            {mobileTab === "chat" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[460px]">
                <div className="bg-[#1b4e23] p-3.5 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#d6a427]" />
                    <span className="font-bold text-xs uppercase">
                      Mensajería Directa Fielding
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-700/80 px-2 py-0.5 rounded font-mono">
                    Canal Seguro
                  </span>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col max-w-[80%] ${
                        m.isTeacher ? "mr-auto items-start" : "ml-auto items-end"
                      }`}
                    >
                      <span className="text-[9px] font-bold text-slate-400 mb-0.5">
                        {m.sender} • {m.time}
                      </span>
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          m.isTeacher
                            ? "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200"
                            : "bg-[#266b31] text-white rounded-tr-none shadow-sm"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-slate-50 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Escribe un mensaje al docente..."
                    className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#266b31]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#266b31] hover:bg-[#1b4e23] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 3: PROFESOR / DOCENTE (CON SUB-PESTAÑAS)                              */}
        {/* ========================================================================= */}
        {role === "teacher" && (
          <div className="space-y-6">
            {/* Header del Docente con Nombre y Especialidad */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#266b31] tracking-wider block">
                  Panel de Gestión Docente
                </span>
                <h2 className="text-xl font-black text-slate-900 uppercase">
                  {currentName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Especialidad: Ciencias Sociales (Historia Universal, Historia de Bolivia) e Inglés
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSyncDrive}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#1b4e23] hover:bg-[#143d1a] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{isSyncing ? "Sincronizando..." : "Sincronizar Drive"}</span>
                </button>
              </div>
            </div>

            {/* Sub-Pestañas Internas del Docente */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setTeacherSubTab("curriculum")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  teacherSubTab === "curriculum"
                    ? "bg-[#266b31] text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <FileText className="w-4 h-4 text-[#d6a427]" />
                <span>1. Planificación Curricular (PDC y Planes de Clase)</span>
              </button>

              <button
                type="button"
                onClick={() => setTeacherSubTab("drive")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  teacherSubTab === "drive"
                    ? "bg-[#266b31] text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-[#d6a427]" />
                <span>2. Mis Cuadernos Pedagógicos (Drive)</span>
              </button>

              <button
                type="button"
                onClick={() => setTeacherSubTab("agenda")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  teacherSubTab === "agenda"
                    ? "bg-[#266b31] text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Calendar className="w-4 h-4 text-[#d6a427]" />
                <span>3. Agenda de Tareas/Exámenes y Mensajes</span>
              </button>
            </div>

            {/* PESTAÑA 1 DOCENTE: PLANIFICACIÓN CURRICULAR (PDC Y PLANES DE CLASE) */}
            {teacherSubTab === "curriculum" && <TeacherCurriculumHub />}

            {/* PESTAÑA 2 DOCENTE: CUADERNOS PEDAGÓGICOS EN DRIVE */}
            {teacherSubTab === "drive" && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm uppercase text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#266b31]" />
                  <span>Cuadernos Pedagógicos Vinculados (Google Sheets)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      course: "1RO-SEC",
                      subject: "HISTORIA DE BOLIVIA",
                      sheetId: "1historia_bolivia_1sec_fielding_2026",
                      url: "https://docs.google.com/spreadsheets/",
                      studentsCount: 28,
                    },
                    {
                      course: "1RO-SEC",
                      subject: "HISTORIA UNIVERSAL",
                      sheetId: "1historia_universal_1sec_fielding_2026",
                      url: "https://docs.google.com/spreadsheets/",
                      studentsCount: 28,
                    },
                    {
                      course: "1RO-SEC",
                      subject: "LENGUA EXTRANJERA (INGLÉS B1-A)",
                      sheetId: "1ingles_b1_fielding_2026",
                      url: "https://docs.google.com/spreadsheets/",
                      studentsCount: 22,
                    },
                  ].map((cuaderno, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2.5 py-0.5 bg-[#266b31] text-white font-bold text-[10px] rounded uppercase">
                            {cuaderno.course}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Auto-Sync
                          </span>
                        </div>
                        <h4 className="font-extrabold text-base text-slate-900 uppercase">
                          {cuaderno.subject}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {cuaderno.studentsCount} Estudiantes registrados
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                          ID: {cuaderno.sheetId}
                        </p>
                      </div>

                      <a
                        href={cuaderno.url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        <span>Abrir en Google Drive</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PESTAÑA 3 DOCENTE: AGENDA DE TAREAS Y MENSAJES */}
            {teacherSubTab === "agenda" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Formulario para Publicar en Calendario */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm uppercase text-slate-900 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-[#266b31]" />
                    <span>Publicar Tarea o Examen en Calendario</span>
                  </h3>

                  <form onSubmit={handleAddEvent} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                        Materia y Curso
                      </label>
                      <select
                        value={newEventSubject}
                        onChange={(e) => setNewEventSubject(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#266b31]"
                      >
                        <option value="HISTORIA DE BOLIVIA">HISTORIA DE BOLIVIA - 1RO SECUNDARIA</option>
                        <option value="HISTORIA UNIVERSAL">HISTORIA UNIVERSAL - 1RO SECUNDARIA</option>
                        <option value="LENGUA EXTRANJERA">LENGUA EXTRANJERA (INGLÉS) - 1RO SEC</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                        Tipo de Actividad
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {(["TAREA", "EXAMEN", "PROYECTO"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setNewEventType(t)}
                            className={`py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                              newEventType === t
                                ? "bg-[#266b31] text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                        Título de la Actividad
                      </label>
                      <input
                        type="text"
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        placeholder="ej. Informe de Fuentes Históricas"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#266b31]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                        Fecha Límite
                      </label>
                      <input
                        type="date"
                        value={newEventDate}
                        onChange={(e) => setNewEventDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#266b31]"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#266b31] hover:bg-[#1b4e23] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer"
                    >
                      Publicar en Agenda del Curso
                    </button>
                  </form>
                </div>

                {/* Mensajería Directa */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm uppercase text-slate-900 flex items-center gap-2 mb-3">
                      <MessageSquare className="w-4 h-4 text-[#266b31]" />
                      <span>Mensajes con Familias y Tutores</span>
                    </h3>

                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {messages.map((m) => (
                        <div
                          key={m.id}
                          className={`p-3 rounded-xl text-xs space-y-1 ${
                            m.isTeacher ? "bg-emerald-50 border border-emerald-200" : "bg-slate-50 border border-slate-200"
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                            <span>{m.sender}</span>
                            <span>{m.time}</span>
                          </div>
                          <p className="text-slate-800">{m.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Responder a padres de familia..."
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#266b31]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#266b31] text-white font-bold text-xs rounded-xl hover:bg-[#1b4e23]"
                    >
                      Enviar
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 4: DIRECCIÓN / ADMINISTRATIVO (MATRIZ CENTRALIZADORA SIGED)          */}
        {/* ========================================================================= */}
        {role === "admin" && (
          <div className="space-y-6">
            {/* Header Administrativo */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#266b31] tracking-wider block">
                  Dirección General y Académica
                </span>
                <h2 className="text-xl font-black text-slate-900 uppercase">
                  {currentName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Matriz Centralizadora Instantánea y Auditoría Curricular • Gestión 2026
                </p>
              </div>

              {/* Botón Sincronizar Todo con medición de latencia */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncDrive}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1b4e23] hover:bg-[#143d1a] disabled:opacity-60 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{isSyncing ? "Sincronizando..." : "Sincronizar Todo"}</span>
                </button>
              </div>
            </div>

            {/* Selector de Categorías (PRIMARIA, SECUNDARIA, SIGED, HONOR) */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-1.5">
                {(["PRIMARIA", "SECUNDARIA", "SIGED", "HONOR"] as const).map((cat) => {
                  const isSelected = adminCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setAdminCategory(cat);
                        if (cat === "PRIMARIA") setSelectedCourse("1RO-PRIM");
                        if (cat === "SECUNDARIA" || cat === "SIGED") setSelectedCourse("1RO-SEC");
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#266b31] text-white shadow-md"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat === "HONOR" ? "🏆 Cuadro de Honor" : cat}
                    </button>
                  );
                })}
              </div>

              {/* Selector de Cursos (si no es HONOR) */}
              {adminCategory !== "HONOR" && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500">
                    Curso:
                  </span>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 uppercase focus:ring-2 focus:ring-[#266b31]"
                  >
                    {(adminCategory === "PRIMARIA"
                      ? coursesByLevel.PRIMARIA.length > 0
                        ? coursesByLevel.PRIMARIA
                        : ["1RO-PRIM", "2DO-PRIM", "3RO-PRIM", "4TO-PRIM", "5TO-PRIM", "6TO-PRIM"]
                      : coursesByLevel.SECUNDARIA.length > 0
                      ? coursesByLevel.SECUNDARIA
                      : ["1RO-SEC", "2DO-SEC", "3RO-SEC", "4TO-SEC", "5TO-SEC", "6TO-SEC"]
                    ).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* SECCIÓN CUADRO DE HONOR TOP 5 */}
            {adminCategory === "HONOR" ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="font-extrabold text-base uppercase text-[#1b4e23] flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#d6a427]" />
                      <span>Cuadro de Honor Institucional • Top 5 Fielding</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Estudiantes con los mejores promedios generales de la gestión 2026
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    {(["t1", "t2", "t3", "final"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPeriod(p)}
                        className={`px-2.5 py-1 rounded text-[10px] font-black uppercase cursor-pointer ${
                          period === p ? "bg-[#266b31] text-white" : "text-slate-600"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
                  {honorRollSchool.map((st: any, idx: number) => {
                    const medals = ["🥇", "🥈", "🥉", "🏅", "🏅"];
                    return (
                      <div
                        key={st.id || idx}
                        className={`p-4 rounded-2xl border text-center space-y-2 flex flex-col justify-between ${
                          idx === 0
                            ? "bg-amber-50/70 border-[#d6a427] shadow-md"
                            : "bg-slate-50/60 border-slate-200"
                        }`}
                      >
                        <div className="text-3xl">{medals[idx]}</div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-[#266b31] block">
                            Puesto #{idx + 1} • {st.course}
                          </span>
                          <h4 className="font-extrabold text-xs text-slate-900 uppercase mt-1 line-clamp-2">
                            {st.full_name}
                          </h4>
                        </div>
                        <div className="pt-2 border-t border-slate-200">
                          <span className="text-2xl font-black text-[#1b4e23]">{st.avg}</span>
                          <span className="text-[10px] text-slate-400 font-bold block">
                            Promedio / 100
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBoletinStudent(st)}
                          className="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-700 transition-colors cursor-pointer"
                        >
                          Ver Boletín
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* TABLA CENTRALIZADORA DE NOTAS */
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Barra de Filtro de la Matriz */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      placeholder="Buscar estudiante en la matriz..."
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#266b31]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-slate-500">
                      Período de Notas:
                    </span>
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-300">
                      {(["t1", "t2", "t3", "final"] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPeriod(p)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase cursor-pointer ${
                            period === p
                              ? "bg-[#1b4e23] text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {p.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tabla de la Matriz Centralizadora */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#1b4e23] text-white uppercase text-[10px] font-extrabold tracking-wider">
                        <th className="py-3 px-3 w-10 text-center border-r border-green-900">#</th>
                        <th className="py-3 px-4 min-w-[220px] border-r border-green-900">
                          Estudiante
                        </th>
                        <th className="py-3 px-2 text-center w-16 border-r border-green-900">
                          Inglés
                        </th>
                        {courseSubjects.map((sub) => (
                          <th
                            key={sub}
                            className="py-3 px-2 text-center min-w-[90px] border-r border-green-900"
                          >
                            <span className="block truncate max-w-[120px]" title={sub}>
                              {sub}
                            </span>
                          </th>
                        ))}
                        <th className="py-3 px-3 text-center w-20 border-r border-green-900">
                          Promedio
                        </th>
                        <th className="py-3 px-3 text-center w-24">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {courseStudents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={courseSubjects.length + 5}
                            className="text-center py-8 text-slate-400"
                          >
                            No hay estudiantes encontrados para este curso o criterio de búsqueda.
                          </td>
                        </tr>
                      ) : (
                        courseStudents.map((st: any, idx: number) => {
                          const rowVals: number[] = [];

                          return (
                            <tr key={st.id || idx} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2.5 px-3 text-center font-bold text-slate-400 border-r border-slate-200">
                                {idx + 1}
                              </td>
                              <td className="py-2.5 px-4 font-bold text-slate-800 uppercase border-r border-slate-200">
                                {st.full_name}
                              </td>
                              <td className="py-2.5 px-2 text-center border-r border-slate-200 font-bold text-[10px] text-amber-700">
                                {st.english_level || "-"}
                              </td>

                              {/* Calificación por cada Materia o Área */}
                              {courseSubjects.map((sub) => {
                                let gradeVal: any = "-";

                                if (adminCategory === "SIGED") {
                                  const areaScores: number[] = [];
                                  Object.entries(st.grades || {}).forEach(([mKey, gObj]: [string, any]) => {
                                    const cl = getClasificacionCurricular(mKey, selectedCourse);
                                    if (cl.area === sub) {
                                      const rawVal = period === "final" ? gObj?.final : gObj?.[period]?.total;
                                      const n = parseFloat(String(rawVal ?? "").replace(",", "."));
                                      if (!isNaN(n)) areaScores.push(n);
                                    }
                                  });
                                  if (areaScores.length > 0) {
                                    gradeVal = Math.round(
                                      areaScores.reduce((a, b) => a + b, 0) / areaScores.length
                                    );
                                  }
                                } else {
                                  const gObj = st.grades?.[sub];
                                  gradeVal = period === "final" ? gObj?.final : gObj?.[period]?.total;
                                }

                                const parsed = parseFloat(String(gradeVal ?? "").replace(",", "."));
                                if (!isNaN(parsed)) rowVals.push(parsed);

                                return (
                                  <td
                                    key={sub}
                                    className="py-2.5 px-2 text-center border-r border-slate-200 font-mono text-xs"
                                  >
                                    <span
                                      className={`inline-block px-1.5 py-0.5 rounded font-bold ${getGradeColorClass(
                                        gradeVal
                                      )}`}
                                    >
                                      {gradeVal ?? "-"}
                                    </span>
                                  </td>
                                );
                              })}

                              {/* Promedio del Estudiante */}
                              <td className="py-2.5 px-3 text-center font-mono font-black text-xs border-r border-slate-200 text-[#1b4e23]">
                                {rowVals.length > 0
                                  ? (rowVals.reduce((a, b) => a + b, 0) / rowVals.length).toFixed(1)
                                  : "-"}
                              </td>

                              {/* Botón Boletín Oficial */}
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => setBoletinStudent(st)}
                                  className="px-2.5 py-1 bg-[#d6a427] hover:bg-[#b88c1f] text-slate-950 font-bold text-[10px] uppercase rounded-lg transition-colors cursor-pointer"
                                >
                                  Boletín
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL DE BOLETÍN OFICIAL DE CALIFICACIONES (TAMAÑO CARTA IMPRIMIBLE) */}
      {boletinStudent && (
        <BoletinModal
          student={boletinStudent}
          onClose={() => setBoletinStudent(null)}
        />
      )}
    </div>
  );
}
