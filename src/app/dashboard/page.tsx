"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Award,
  Bell,
  Calendar,
  MessageSquare,
  Video,
  FileSpreadsheet,
  Printer,
  Send,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
  Sparkles,
  RefreshCw,
  LogOut,
  ChevronDown,
  ChevronUp,
  Clock,
  X,
  Plus,
  Layers,
  Lock,
} from "lucide-react";

import { useDemoStore, SubjectGrade } from "@/lib/demoStore";
import { getGradeColorClass, getClasificacionCurricular } from "@/lib/siged";
import BoletinModal, { StudentData } from "@/components/BoletinModal";
import TeacherCurriculumHub from "@/components/TeacherCurriculumHub";

type Role = "parent" | "student" | "teacher" | "admin";
type ParentStudentTab = "notas" | "agenda" | "avisos" | "chat" | "meet";
type TeacherTab = "cuadernos" | "curriculum" | "agenda_meet" | "chat";
type AdminTab = "centralizador" | "vigilancia" | "comunicados" | "supervision_meet";
type TrimesterKey = "t1" | "t2" | "t3" | "final";
type AdminViewMode = "ALL" | "SIGED" | "HONOR";

const ROLE_PROFILES: Record<Role, { name: string; title: string; initials: string }> = {
  parent: {
    name: "Familia Aliaga Ramos",
    title: "Padre / Tutor • 1RO-SEC",
    initials: "FA",
  },
  student: {
    name: "Aliaga Ramos Yusuf Adel",
    title: "Estudiante • 1RO-SEC",
    initials: "YA",
  },
  teacher: {
    name: "Lic. Ivan Ezequiel Mancilla Copa",
    title: "Docente Titular",
    initials: "IM",
  },
  admin: {
    name: "Ing. José Mariano Pinaya",
    title: "Dirección General",
    initials: "JP",
  },
};

const SIGED_CAMPOS = [
  { key: "COMUNIDAD Y SOCIEDAD", short: "Comunidad y Soc." },
  { key: "CIENCIA TECNOLOGÍA Y PRODUCCIÓN", short: "Ciencia y Prod." },
  { key: "VIDA TIERRA TERRITORIO", short: "Vida Tierra Terr." },
  { key: "COSMOS Y PENSAMIENTOS", short: "Cosmos y Pens." },
] as const;

function computeSubjectFinalDimensions(g: SubjectGrade) {
  const dims = [g.t1, g.t2, g.t3];
  const avgField = (field: "ser" | "saber" | "hacer" | "auto") => {
    const vals = dims
      .map((d) => Number(d?.[field]))
      .filter((v) => !isNaN(v) && v > 0);
    if (vals.length === 0) return "-";
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  };
  return {
    ser: avgField("ser"),
    saber: avgField("saber"),
    hacer: avgField("hacer"),
    auto: avgField("auto"),
    total: g.final,
  };
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roleParam = searchParams.get("role") as Role | null;
  const validRole: Role =
    roleParam && ["parent", "student", "teacher", "admin"].includes(roleParam)
      ? roleParam
      : "parent";

  const [currentRole, setCurrentRole] = useState<Role>(validRole);

  useEffect(() => {
    setCurrentRole(validRole);
  }, [validRole]);

  // Store centralizado persistido en localStorage
  const {
    students,
    assignments,
    tasks,
    announcements,
    messages,
    interviews,
    alertKeywords,
    lastSync,
    addMessage,
    addAlertKeyword,
    removeAlertKeyword,
    addTask,
    addMeetInterview,
    updateMeetStatus,
    addAnnouncement,
    deleteAnnouncement,
    syncDrive,
    resetToDefault,
  } = useDemoStore();

  // Pestañas activas por rol
  const [parentTab, setParentTab] = useState<ParentStudentTab>("notas");
  const [teacherTab, setTeacherTab] = useState<TeacherTab>("cuadernos");
  const [adminTab, setAdminTab] = useState<AdminTab>("centralizador");

  // Estados vista Padres / Estudiantes
  const [selectedTrimester, setSelectedTrimester] = useState<TrimesterKey>("final");
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [boletinStudent, setBoletinStudent] = useState<StudentData | null>(null);

  const currentStudent = useMemo(() => {
    return students.find((s) => s.id === "STU-1") || students[0];
  }, [students]);

  // Sincronización Drive
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3500);
  };

  // Chat states
  const [chatInput, setChatInput] = useState("");
  const [teacherSelectedThread, setTeacherSelectedThread] = useState<string>("TH-ALIAGA-MANCILLA");
  const [teacherReplyInput, setTeacherReplyInput] = useState("");

  // Formularios Teacher / Parent Meet
  const [newTaskCourse, setNewTaskCourse] = useState("1RO-SEC");
  const [newTaskSubject, setNewTaskSubject] = useState("HISTORIA DE BOLIVIA");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("2026-11-30");
  const [newTaskType, setNewTaskType] = useState<"TAREA" | "EXAMEN" | "EVENTO">("TAREA");

  const [showParentMeetModal, setShowParentMeetModal] = useState(false);
  const [newMeetParent, setNewMeetParent] = useState("Familia Aliaga Ramos");
  const [newMeetStudent, setNewMeetStudent] = useState("Aliaga Ramos Yusuf Adel");
  const [newMeetCourse, setNewMeetCourse] = useState("1RO-SEC");
  const [newMeetDate, setNewMeetDate] = useState("2026-11-28");
  const [newMeetTime, setNewMeetTime] = useState("16:00");
  const [newMeetReason, setNewMeetReason] = useState(
    "Seguimiento de aprovechamiento académico y plan de reforzamiento"
  );

  // Modal Comunicado Admin
  const [showNewAnnouncementModal, setShowNewAnnouncementModal] = useState(false);
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnContent, setNewAnnContent] = useState("");
  const [newAnnPriority, setNewAnnPriority] = useState<"ALTA" | "MEDIA" | "GENERAL">("MEDIA");
  const [newAnnTarget, setNewAnnTarget] = useState<"TODOS" | "PADRES" | "DOCENTES">("TODOS");

  // Filtros Admin
  const [adminCourseFilter, setAdminCourseFilter] = useState<string>("ALL");
  const [adminSearch, setAdminSearch] = useState<string>("");
  const [adminViewMode, setAdminViewMode] = useState<AdminViewMode>("ALL");

  // Filtros Vigilancia Chats (Admin)
  const [auditKeywordFilter, setAuditKeywordFilter] = useState<string>("");
  const [auditTeacherFilter, setAuditTeacherFilter] = useState<string>("ALL");
  const [auditCourseFilter, setAuditCourseFilter] = useState<string>("ALL");
  const [auditOnlyAlerts, setAuditOnlyAlerts] = useState<boolean>(false);
  const [newAlertWord, setNewAlertWord] = useState<string>("");

  const activeProfile = ROLE_PROFILES[currentRole];

  const handleSwitchRole = (role: Role) => {
    setCurrentRole(role);
    router.replace(`/dashboard?role=${role}`);
  };

  const handleDriveSync = (courseSubject?: string) => {
    setIsSyncingDrive(true);
    setSyncFeedback(null);
    const t0 = performance.now();
    setTimeout(() => {
      syncDrive(courseSubject);
      const elapsed = Math.max(18, Math.min(44, Math.round(performance.now() - t0 - 380)));
      setIsSyncingDrive(false);
      setSyncFeedback(
        courseSubject
          ? `Cuaderno "${courseSubject}" sincronizado con Google Drive en ${elapsed}ms`
          : `Todos los Cuadernos Pedagógicos sincronizados con Google Drive en ${elapsed}ms`
      );
      setTimeout(() => setSyncFeedback(null), 4000);
    }, 420);
  };

  const handleSendParentMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    addMessage({
      threadId: "TH-ALIAGA-MANCILLA",
      senderRole: currentRole === "parent" ? "parent" : "student",
      senderName: currentRole === "parent" ? "Familia Aliaga Ramos" : "Aliaga Ramos Yusuf Adel",
      recipientName: "Lic. Ivan Ezequiel Mancilla Copa",
      teacherName: "Lic. Ivan Ezequiel Mancilla Copa",
      course: currentStudent.course,
      text: chatInput.trim(),
    });

    setChatInput("");
  };

  const handleSendTeacherReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherReplyInput.trim()) return;

    const recipient =
      teacherSelectedThread === "TH-ALIAGA-MANCILLA"
        ? "Familia Aliaga Ramos"
        : "Familia Benavides Castro";

    addMessage({
      threadId: teacherSelectedThread,
      senderRole: "teacher",
      senderName: "Lic. Ivan Ezequiel Mancilla Copa",
      recipientName: recipient,
      teacherName: "Lic. Ivan Ezequiel Mancilla Copa",
      course: "1RO-SEC",
      text: teacherReplyInput.trim(),
    });

    setTeacherReplyInput("");
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      course: newTaskCourse,
      subject: newTaskSubject,
      teacher: "Lic. Ivan Ezequiel Mancilla Copa",
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || "Revisar instrucciones en cuaderno de materia.",
      dueDate: newTaskDueDate,
      type: newTaskType,
    });

    setNewTaskTitle("");
    setNewTaskDesc("");
    showToast(`¡${newTaskType} publicado! Ya es visible en la Agenda de ${newTaskCourse}.`);
  };

  const handleCreateMeet = (e: React.FormEvent, fromParentModal = false) => {
    e.preventDefault();
    const created = addMeetInterview({
      teacherName: "Lic. Ivan Ezequiel Mancilla Copa",
      parentName: fromParentModal ? "Familia Aliaga Ramos" : newMeetParent,
      studentName: fromParentModal ? currentStudent.full_name : newMeetStudent,
      course: fromParentModal ? currentStudent.course : newMeetCourse,
      date: newMeetDate,
      time: newMeetTime,
      reason: newMeetReason.trim() || "Entrevista de seguimiento pedagógico",
    });

    setShowParentMeetModal(false);
    showToast(`Entrevista agendada • Sala generada: ${created.meetCode}`);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim()) return;

    addAnnouncement({
      title: newAnnTitle.trim(),
      content: newAnnContent.trim(),
      priority: newAnnPriority,
      author: "Dirección General - Ing. José Mariano Pinaya",
      targetRole: newAnnTarget,
    });

    setNewAnnTitle("");
    setNewAnnContent("");
    setShowNewAnnouncementModal(false);
    showToast("Comunicado institucional publicado en tiempo real para los perfiles seleccionados.");
  };

  const handleAddAlertKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertWord.trim()) return;
    addAlertKeyword(newAlertWord.trim());
    setNewAlertWord("");
  };

  // Promedio del estudiante actual
  const studentAverage = useMemo(() => {
    if (!currentStudent || !currentStudent.grades) return 0;
    let sum = 0;
    let count = 0;
    Object.values(currentStudent.grades).forEach((g) => {
      const val = Number(g.final);
      if (!isNaN(val) && val > 0) {
        sum += val;
        count++;
      }
    });
    return count > 0 ? Math.round(sum / count) : 0;
  }, [currentStudent]);

  // Avisos visibles para padres/estudiantes
  const parentAnnouncements = useMemo(() => {
    return announcements.filter((a) => a.targetRole === "TODOS" || a.targetRole === "PADRES");
  }, [announcements]);

  // Centralizador Maestro (con cálculo por Campos SIGED + Promedio General)
  const processedAdminStudents = useMemo(() => {
    let list = [...students];

    if (adminCourseFilter !== "ALL") {
      list = list.filter((s) => s.course.includes(adminCourseFilter));
    }

    if (adminSearch.trim()) {
      const q = adminSearch.toLowerCase();
      list = list.filter(
        (s) =>
          s.full_name.toLowerCase().includes(q) ||
          s.course.toLowerCase().includes(q) ||
          s.rude_code.toLowerCase().includes(q)
      );
    }

    const withStats = list.map((s) => {
      let sum = 0;
      let count = 0;
      const campoBuckets: Record<string, number[]> = {};

      Object.entries(s.grades || {}).forEach(([matName, g]) => {
        const val = Number(g.final);
        if (!isNaN(val) && val > 0) {
          sum += val;
          count++;
          const { campo } = getClasificacionCurricular(matName, s.course);
          if (!campoBuckets[campo]) campoBuckets[campo] = [];
          campoBuckets[campo].push(val);
        }
      });

      const campoAvgs: Record<string, number | string> = {};
      SIGED_CAMPOS.forEach(({ key }) => {
        const arr = campoBuckets[key] || [];
        campoAvgs[key] =
          arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : "-";
      });

      const avg = count > 0 ? Math.round(sum / count) : 0;
      return { ...s, calculatedAvg: avg, campoAvgs };
    });

    if (adminViewMode === "HONOR") {
      return withStats.sort((a, b) => b.calculatedAvg - a.calculatedAvg).slice(0, 5);
    }

    return withStats.sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [students, adminCourseFilter, adminSearch, adminViewMode]);

  // Docentes y cursos únicos para filtros de vigilancia
  const auditTeachers = useMemo(() => {
    return Array.from(new Set(messages.map((m) => m.teacherName).filter(Boolean)));
  }, [messages]);

  const auditCourses = useMemo(() => {
    return Array.from(new Set(messages.map((m) => m.course).filter(Boolean)));
  }, [messages]);

  const totalAlertsCount = useMemo(() => {
    return messages.filter((m) => m.hasAlert).length;
  }, [messages]);

  const filteredAuditMessages = useMemo(() => {
    let list = [...messages];

    if (auditTeacherFilter !== "ALL") {
      list = list.filter((m) => m.teacherName === auditTeacherFilter);
    }
    if (auditCourseFilter !== "ALL") {
      list = list.filter((m) => m.course === auditCourseFilter);
    }
    if (auditOnlyAlerts) {
      list = list.filter((m) => m.hasAlert);
    }
    if (auditKeywordFilter.trim()) {
      const q = auditKeywordFilter.toLowerCase();
      list = list.filter(
        (m) =>
          m.text.toLowerCase().includes(q) ||
          m.senderName.toLowerCase().includes(q) ||
          m.recipientName.toLowerCase().includes(q) ||
          m.course.toLowerCase().includes(q) ||
          (m.alertKeyword && m.alertKeyword.toLowerCase().includes(q))
      );
    }

    return list.reverse();
  }, [messages, auditTeacherFilter, auditCourseFilter, auditOnlyAlerts, auditKeywordFilter]);

  return (
    <div className="min-h-screen bg-[#FAFAF0] text-slate-800 pb-24 md:pb-12">
      {/* ============================================================= */}
      {/* BARRA SUPERIOR INSTITUCIONAL CON CONMUTADOR DEMO              */}
      {/* ============================================================= */}
      <header className="no-print sticky top-0 z-40 bg-white/95 border-b border-slate-200/90 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo y Nombre Institucional */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl p-1 flex items-center justify-center shadow-sm flex-shrink-0">
              <img
                src="https://i.imgur.com/wjibHTr.png"
                alt="Fielding Bolivia"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div className="hidden md:block truncate">
              <h1 className="text-sm font-black text-[#266b31] tracking-tight uppercase leading-none">
                FIELDING APP
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                Colegio Fielding Bolivia • SIGED
              </p>
            </div>
          </div>

          {/* CONMUTADOR RÁPIDO DE ROLES DEMO */}
          <div className="flex items-center gap-1 p-1 bg-[#FAFAF0] border border-slate-200 rounded-2xl shadow-inner">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase px-2 hidden xl:inline-block">
              DEMO VIVO:
            </span>
            {(
              [
                { id: "parent", label: "Padre", icon: Users },
                { id: "student", label: "Estudiante", icon: GraduationCap },
                { id: "teacher", label: "Docente", icon: BookOpen },
                { id: "admin", label: "Dirección", icon: ShieldCheck },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const isActive = currentRole === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSwitchRole(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#266b31] text-white shadow-md scale-[1.02]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* INDICADOR DE LATENCIA, USUARIO ACTIVO & ACCIONES */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Tiempo real • &lt;45ms</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-[#FAFAF0] border border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-[#266b31] text-white flex items-center justify-center text-[10px] font-black">
                {activeProfile.initials}
              </div>
              <div className="leading-tight hidden xl:block">
                <p className="text-[11px] font-extrabold text-slate-800 max-w-[140px] truncate">
                  {activeProfile.name}
                </p>
                <p className="text-[9px] font-semibold text-slate-500">{activeProfile.title}</p>
              </div>
            </div>

            <button
              onClick={() => {
                if (confirm("¿Deseas restaurar los datos iniciales de demostración?")) {
                  resetToDefault();
                  showToast("Datos de demostración restablecidos.");
                }
              }}
              className="p-2 text-slate-400 hover:text-[#266b31] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Restablecer Datos Demo"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => router.push("/")}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* TOAST DE CONFIRMACIÓN GLOBAL */}
      {actionToast && (
        <div className="no-print fixed top-20 right-4 z-50 bg-[#1b4e23] text-white px-4 py-3 rounded-2xl shadow-xl border border-[#d6a427]/50 flex items-center gap-2.5 text-xs font-bold max-w-sm">
          <CheckCircle2 className="w-4 h-4 text-[#d6a427] flex-shrink-0" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ============================================================= */}
        {/* VISTA 1 & 2: PADRE DE FAMILIA / ESTUDIANTE (MOBILE-FIRST)     */}
        {/* ============================================================= */}
        {(currentRole === "parent" || currentRole === "student") && (
          <div className="space-y-6">
            {/* Tarjeta de Perfil del Estudiante */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#266b31] to-[#1b4e23] text-white flex items-center justify-center font-black text-xl shadow-md">
                  YA
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">
                      {currentStudent.full_name}
                    </h2>
                    <span className="bg-[#d6a427]/20 text-[#1b4e23] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                      {currentStudent.course}
                    </span>
                    <span className="bg-[#9ac29d]/30 text-[#1b4e23] font-bold text-[10px] px-2 py-0.5 rounded-full">
                      {currentRole === "parent" ? "Vista Tutor / Familia" : "Vista Estudiante"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    RUDE: {currentStudent.rude_code} • Nivel Inglés:{" "}
                    <span className="font-bold text-[#266b31]">
                      {currentStudent.english_level}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">
                    Promedio General
                  </span>
                  <span
                    className={`text-xl font-black px-2.5 py-0.5 rounded-lg ${getGradeColorClass(
                      studentAverage
                    )}`}
                  >
                    {studentAverage} / 100
                  </span>
                </div>

                <button
                  onClick={() => setBoletinStudent(currentStudent)}
                  className="flex items-center gap-2 bg-[#266b31] hover:bg-[#1b4e23] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#d6a427]" />
                  <span>Boletín Oficial (Carta)</span>
                </button>
              </div>
            </div>

            {/* SECCIÓN 1: NOTAS EN TIEMPO REAL */}
            {parentTab === "notas" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#266b31]" />
                    <span>Calificaciones en Tiempo Real (4 Dimensiones SEP Bolivia)</span>
                  </h3>

                  <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold">
                    {(
                      [
                        { id: "t1", label: "1T" },
                        { id: "t2", label: "2T" },
                        { id: "t3", label: "3T" },
                        { id: "final", label: "Final" },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTrimester(t.id)}
                        className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                          selectedTrimester === t.id
                            ? "bg-[#266b31] text-white shadow-sm"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tarjetas Acordeón Desplegables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(currentStudent.grades).map(([matKey, g]) => {
                    const isExpanded = expandedSubject === matKey;
                    const dim =
                      selectedTrimester === "final"
                        ? computeSubjectFinalDimensions(g)
                        : g[selectedTrimester];

                    return (
                      <div
                        key={matKey}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all hover:border-[#266b31]/40"
                      >
                        <div
                          onClick={() => setExpandedSubject(isExpanded ? null : matKey)}
                          className="p-4 flex items-center justify-between cursor-pointer select-none"
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-extrabold text-sm text-slate-900">
                                {matKey}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500">
                                • {g.area}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{g.profesor}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`text-base font-black px-2.5 py-1 rounded-xl ${getGradeColorClass(
                                dim.total
                              )}`}
                            >
                              {dim.total}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-[#FAFAF0]/70 space-y-3">
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                              Desglose Oficial ({selectedTrimester === "final" ? "Promedio Anual" : selectedTrimester.toUpperCase()} • Sobre 100 pts):
                            </span>

                            <div className="grid grid-cols-4 gap-2 text-center text-xs">
                              <div className="bg-white p-2 rounded-xl border border-slate-200">
                                <span className="block text-[10px] font-bold text-emerald-800">
                                  SER (10)
                                </span>
                                <span className="text-base font-black text-slate-900">
                                  {dim.ser}
                                </span>
                              </div>
                              <div className="bg-white p-2 rounded-xl border border-slate-200">
                                <span className="block text-[10px] font-bold text-blue-800">
                                  SABER (45)
                                </span>
                                <span className="text-base font-black text-slate-900">
                                  {dim.saber}
                                </span>
                              </div>
                              <div className="bg-white p-2 rounded-xl border border-slate-200">
                                <span className="block text-[10px] font-bold text-amber-800">
                                  HACER (40)
                                </span>
                                <span className="text-base font-black text-slate-900">
                                  {dim.hacer}
                                </span>
                              </div>
                              <div className="bg-white p-2 rounded-xl border border-slate-200">
                                <span className="block text-[10px] font-bold text-purple-800">
                                  AUTO (5)
                                </span>
                                <span className="text-base font-black text-slate-900">
                                  {dim.auto}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                              <span>
                                Estado:{" "}
                                <strong
                                  className={
                                    Number(dim.total) >= 51 ? "text-emerald-700" : "text-red-600"
                                  }
                                >
                                  {Number(dim.total) >= 51 ? "Aprobado" : "En Reforzamiento"}
                                </strong>
                              </span>
                              <span className="text-slate-400">Campo: {g.campo}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECCIÓN 2: AGENDA ESCOLAR */}
            {parentTab === "agenda" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#266b31]" />
                    <span>Agenda Escolar • Curso {currentStudent.course}</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-500">
                    {tasks.filter((t) => t.course === currentStudent.course).length} actividades
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tasks
                    .filter((t) => t.course === currentStudent.course)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                              item.type === "EXAMEN"
                                ? "bg-red-100 text-red-700"
                                : item.type === "EVENTO"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {item.type}
                          </span>
                          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Entrega: {item.dueDate}
                          </span>
                        </div>

                        <h4 className="text-sm font-extrabold text-slate-900">{item.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold text-[#266b31]">{item.subject}</span>
                          <span>{item.teacher}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* SECCIÓN 3: AVISOS */}
            {parentTab === "avisos" && (
              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#d6a427]" />
                  <span>Comunicados y Avisos Oficiales</span>
                </h3>

                <div className="space-y-3">
                  {parentAnnouncements.map((ann) => (
                    <div
                      key={ann.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                            ann.priority === "ALTA"
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : ann.priority === "MEDIA"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          PRIORIDAD {ann.priority}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">{ann.date}</span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900">{ann.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                        <span>Emitido por: {ann.author}</span>
                        <span className="bg-[#FAFAF0] px-2 py-0.5 rounded font-bold text-[#266b31]">
                          Dirigido a: {ann.targetRole}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECCIÓN 4: CHAT DIRECTO CON DOCENTE */}
            {parentTab === "chat" && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[520px]">
                <div className="bg-[#266b31] p-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white text-[#266b31] font-black flex items-center justify-center text-sm">
                      IM
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold">Lic. Ivan Ezequiel Mancilla Copa</h4>
                      <p className="text-[11px] text-white/80">
                        Docente Titular • Historia Universal e Inglés
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-[#d6a427] text-[#1b4e23] px-2.5 py-1 rounded-full">
                    Canal Seguro Auditado
                  </span>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAFAF0]/60">
                  {messages
                    .filter((m) => m.threadId === "TH-ALIAGA-MANCILLA")
                    .map((msg) => {
                      const isMe = msg.senderRole === "parent" || msg.senderRole === "student";
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-sm leading-relaxed ${
                              isMe
                                ? "bg-[#266b31] text-white rounded-tr-xs"
                                : "bg-white text-slate-800 border border-slate-200 rounded-tl-xs"
                            }`}
                          >
                            <span className="block text-[10px] font-bold opacity-80 mb-0.5">
                              {msg.senderName}
                            </span>
                            <p>{msg.text}</p>
                            <span className="block text-[9px] opacity-70 text-right mt-1">
                              {msg.timestamp}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>

                <form
                  onSubmit={handleSendParentMessage}
                  className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Escribe tu consulta al profesor (prueba escribir 'urgente' o 'reclamo' para ver alerta en Dirección)..."
                    className="flex-1 bg-[#FAFAF0] border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#266b31]"
                  />
                  <button
                    type="submit"
                    className="bg-[#266b31] hover:bg-[#1b4e23] text-white p-2.5 rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* SECCIÓN 5: ENTREVISTAS GOOGLE MEET */}
            {parentTab === "meet" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Video className="w-5 h-5 text-[#266b31]" />
                    <span>Entrevistas Pedagógicas Virtuales (Google Meet)</span>
                  </h3>
                  <button
                    onClick={() => setShowParentMeetModal(true)}
                    className="flex items-center gap-1.5 bg-[#266b31] hover:bg-[#1b4e23] text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Solicitar Nueva Cita</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {interviews
                    .filter((m) => m.parentName.includes("Aliaga"))
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                              item.status === "PROGRAMADA"
                                ? "bg-emerald-100 text-emerald-800"
                                : item.status === "COMPLETADA"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.status}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            {item.date} • {item.time}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">
                            Reunión con: {item.teacherName}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1">Motivo: {item.reason}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {item.meetCode}
                          </span>
                          <a
                            href={item.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors shadow-sm"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Unirse a Google Meet</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* BARRA DE NAVEGACIÓN INFERIOR FIJA (MOBILE-FIRST) */}
            <nav className="no-print fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around max-w-lg mx-auto sm:rounded-t-2xl">
              {(
                [
                  { id: "notas", label: "Notas", icon: Award },
                  { id: "agenda", label: "Agenda", icon: Calendar },
                  { id: "avisos", label: "Avisos", icon: Bell },
                  { id: "chat", label: "Chat", icon: MessageSquare },
                  { id: "meet", label: "Meet", icon: Video },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const isActive = parentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setParentTab(tab.id)}
                    className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? "text-[#266b31] font-black scale-105"
                        : "text-slate-400 hover:text-slate-600 font-medium"
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-0.5" />
                    <span className="text-[10px]">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* ============================================================= */}
        {/* VISTA 3: DOCENTE (role = teacher)                             */}
        {/* ============================================================= */}
        {currentRole === "teacher" && (
          <div className="space-y-6">
            {/* Cabecera del Docente */}
            <div className="no-print bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#266b31] text-white flex items-center justify-center font-black text-xl shadow-md">
                  IM
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Lic. Ivan Ezequiel Mancilla Copa
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Docente Titular • Historia de Bolivia, Historia Universal e Inglés MCER B1-A
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500">Último Sync: {lastSync}</span>
                <button
                  onClick={() => handleDriveSync()}
                  disabled={isSyncingDrive}
                  className="flex items-center gap-2 bg-[#d6a427] hover:bg-[#b88c22] text-[#1b4e23] font-black px-4 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingDrive ? "animate-spin" : ""}`} />
                  <span>{isSyncingDrive ? "Sincronizando..." : "Sincronizar con Drive"}</span>
                </button>
              </div>
            </div>

            {syncFeedback && (
              <div className="no-print p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{syncFeedback}</span>
              </div>
            )}

            {/* Pestañas del Docente */}
            <div className="no-print flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
              {(
                [
                  {
                    id: "cuadernos",
                    label: "Cuadernos Pedagógicos (Drive)",
                    icon: FileSpreadsheet,
                  },
                  {
                    id: "curriculum",
                    label: "Generador IA (PDCs y Planes)",
                    icon: Sparkles,
                  },
                  {
                    id: "agenda_meet",
                    label: "Tareas y Google Meet",
                    icon: Calendar,
                  },
                  {
                    id: "chat",
                    label: "Chat con Familias",
                    icon: MessageSquare,
                  },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const isActive = teacherTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setTeacherTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-[#266b31] text-white shadow-md"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* PESTAÑA 1: CUADERNOS DRIVE */}
            {teacherTab === "cuadernos" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {assignments.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black bg-[#266b31]/10 text-[#266b31] px-2.5 py-0.5 rounded-full">
                            {item.course}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Sincronizado
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 mt-2">
                          {item.subject}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.students_count} Estudiantes Inscritos
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-400">{item.last_sync}</span>
                        <button
                          onClick={() => handleDriveSync(`${item.course} ${item.subject}`)}
                          className="text-[#266b31] hover:text-[#1b4e23] font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Sync</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tabla de seguimiento */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <h4 className="text-sm font-black text-slate-900">
                    Estudiantes en Seguimiento • Curso 1RO-SEC (Historia e Inglés)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                          <th className="p-2.5">Estudiante</th>
                          <th className="p-2.5">Historia Bolivia</th>
                          <th className="p-2.5">Historia Universal</th>
                          <th className="p-2.5">Inglés B1</th>
                          <th className="p-2.5 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students
                          .filter((s) => s.course === "1RO-SEC")
                          .map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-slate-800">{s.full_name}</td>
                              <td className="p-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded font-black text-[11px] ${getGradeColorClass(
                                    s.grades["HISTORIA DE BOLIVIA"]?.final
                                  )}`}
                                >
                                  {s.grades["HISTORIA DE BOLIVIA"]?.final || "-"}
                                </span>
                              </td>
                              <td className="p-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded font-black text-[11px] ${getGradeColorClass(
                                    s.grades["HISTORIA UNIVERSAL"]?.final
                                  )}`}
                                >
                                  {s.grades["HISTORIA UNIVERSAL"]?.final || "-"}
                                </span>
                              </td>
                              <td className="p-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded font-black text-[11px] ${getGradeColorClass(
                                    s.grades["LENGUA EXTRANJERA"]?.final
                                  )}`}
                                >
                                  {s.grades["LENGUA EXTRANJERA"]?.final || "-"}
                                </span>
                              </td>
                              <td className="p-2.5 text-right">
                                <button
                                  onClick={() => setBoletinStudent(s)}
                                  className="text-[#266b31] hover:underline font-bold text-xs cursor-pointer"
                                >
                                  Boletín
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA 2: GENERADOR IA DE PDCs Y PLANES */}
            {teacherTab === "curriculum" && <TeacherCurriculumHub />}

            {/* PESTAÑA 3: TAREAS Y GOOGLE MEET */}
            {teacherTab === "agenda_meet" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Formulario de Nueva Tarea */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <PlusCircle className="w-4 h-4 text-[#266b31]" />
                        <span>Publicar Tarea o Examen en la Agenda</span>
                      </h3>
                    </div>

                    <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-600 mb-1">Curso</label>
                          <select
                            value={newTaskCourse}
                            onChange={(e) => setNewTaskCourse(e.target.value)}
                            className="w-full bg-[#FAFAF0] border border-slate-200 rounded-xl p-2 font-semibold"
                          >
                            <option value="1RO-SEC">1RO-SEC</option>
                            <option value="2DO-SEC">2DO-SEC</option>
                            <option value="4TO-PRIM">4TO-PRIM</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-600 mb-1">Materia</label>
                          <select
                            value={newTaskSubject}
                            onChange={(e) => setNewTaskSubject(e.target.value)}
                            className="w-full bg-[#FAFAF0] border border-slate-200 rounded-xl p-2 font-semibold"
                          >
                            <option value="HISTORIA DE BOLIVIA">Historia de Bolivia</option>
                            <option value="HISTORIA UNIVERSAL">Historia Universal</option>
                            <option value="INGLÉS B1-A">Inglés B1-A</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-600 mb-1">
                          Título de la Actividad
                        </label>
                        <input
                          type="text"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="Ej: Análisis de fuentes históricas"
                          className="w-full bg-[#FAFAF0] border border-slate-200 rounded-xl p-2.5 font-medium"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-600 mb-1">
                          Descripción e Instrucciones
                        </label>
                        <textarea
                          rows={2}
                          value={newTaskDesc}
                          onChange={(e) => setNewTaskDesc(e.target.value)}
                          placeholder="Detallar criterios de evaluación..."
                          className="w-full bg-[#FAFAF0] border border-slate-200 rounded-xl p-2 font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-600 mb-1">Fecha Límite</label>
                          <input
                            type="date"
                            value={newTaskDueDate}
                            onChange={(e) => setNewTaskDueDate(e.target.value)}
                            className="w-full bg-[#FAFAF0] border border-slate-200 rounded-xl p-2 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-600 mb-1">
                            Tipo de Actividad
                          </label>
                          <select
                            value={newTaskType}
                            onChange={(e) =>
                              setNewTaskType(e.target.value as "TAREA" | "EXAMEN" | "EVENTO")
                            }
                            className="w-full bg-[#FAFAF0] border border-slate-200 rounded-xl p-2 font-semibold"
                          >
                            <option value="TAREA">Tarea / Trabajo Práctico</option>
                            <option value="EXAMEN">Examen Escrito / Oral</option>
                            <option value="EVENTO">Evento Institucional</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#266b31] hover:bg-[#1b4e23] text-white font-bold py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        Publicar Inmediatamente
                      </button>
                    </form>
                  </div>

                  {/* Formulario de Agendar Google Meet */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <Video className="w-4 h-4 text-blue-600" />
                        <span>Agendar Entrevista Pedagógica (Google Meet)</span>
                      </h3>
                    </div>

                    <form onSubmit={(e) => handleCreateMeet(e, false)} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">
                          Familia / Tutor Destinatario
                        </label>
                        <select
                          value={newMeetParent}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewMeetParent(val);
                            const matched = students.find((s) => s.parent_name === val);
                            if (matched) {
                              setNewMeetStudent(matched.full_name);
                              setNewMeetCourse(matched.course);
                            }
                          }}
                          className="w-full bg-[#FAFAF0] border border-slate-200 rounded-xl p-2 font-semibold"
                        >
                          {students.map((s) => (
                            <option key={s.id} value={s.parent_name}>
                              {s.parent_name} ({s.full_name} • {s.course})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-600 mb-1">Fecha</label>
                          <input
                            type="date"
                            value={newMeetDate}
                            onChange={(e) => setNewMeetDate(e.target.value)}
                            className="w-full bg-[#FAFAF0] border border-slate-200 rounded-xl p-2 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-600 mb-1">Hora</label>
                          <input
                            type="time"
                            value={newMeetTime}
                            onChange={(e) => setNewMeetTime(e.target.value)}
                            className="w-full bg-[#FAFAF0] border border-slate-200 rounded-xl p-2 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-600 mb-1">
                          Motivo de la Entrevista
                        </label>
                        <textarea
                          rows={2}
                          value={newMeetReason}
                          onChange={(e) => setNewMeetReason(e.target.value)}
                          placeholder="Indicar puntos a tratar..."
                          className="w-full bg-[#FAFAF0] border border-slate-200 rounded-xl p-2 font-medium"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Video className="w-4 h-4" />
                        <span>Generar Código Meet (fld-xxxx-xxx) y Notificar</span>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Lista en vivo de entrevistas agendadas por el docente */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <h4 className="text-sm font-black text-slate-900">
                    Entrevistas Google Meet Programadas ({interviews.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {interviews.map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-[#FAFAF0]/60 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-extrabold text-slate-900">{m.parentName}</p>
                          <p className="text-[11px] text-slate-600">
                            {m.date} • {m.time} • {m.course}
                          </p>
                          <p className="text-[10px] font-mono text-blue-700 mt-1">{m.meetCode}</p>
                        </div>
                        <a
                          href={m.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1 flex-shrink-0"
                        >
                          <span>Abrir</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA 4: CHAT CON FAMILIAS */}
            {teacherTab === "chat" && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[540px]">
                <div className="md:col-span-4 border-r border-slate-200 p-3 space-y-2 bg-[#FAFAF0]/40 overflow-y-auto">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase px-2 block">
                    Familias y Tutorías:
                  </span>

                  {[
                    {
                      id: "TH-ALIAGA-MANCILLA",
                      name: "Familia Aliaga Ramos",
                      student: "Yusuf Adel (1RO-SEC)",
                      badge: "Al día",
                    },
                    {
                      id: "TH-BENAVIDES-MANCILLA",
                      name: "Familia Benavides Castro",
                      student: "Mateo (1RO-SEC)",
                      badge: "Prioritario",
                    },
                  ].map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setTeacherSelectedThread(conv.id)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                        teacherSelectedThread === conv.id
                          ? "bg-white border-[#266b31] shadow-sm"
                          : "bg-transparent border-transparent hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">{conv.name}</h4>
                        <span className="text-[9px] font-bold bg-[#266b31]/10 text-[#266b31] px-2 py-0.5 rounded-full">
                          {conv.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{conv.student}</p>
                    </div>
                  ))}
                </div>

                <div className="md:col-span-8 flex flex-col h-full">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>
                      Conversación activa:{" "}
                      {teacherSelectedThread === "TH-ALIAGA-MANCILLA"
                        ? "Familia Aliaga Ramos"
                        : "Familia Benavides Castro"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Sincronizado con Vigilancia de Dirección
                    </span>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAFAF0]/40">
                    {messages
                      .filter((m) => m.threadId === teacherSelectedThread)
                      .map((msg) => {
                        const isTeacher = msg.senderRole === "teacher";
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isTeacher ? "items-end" : "items-start"}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                                isTeacher
                                  ? "bg-[#266b31] text-white rounded-tr-xs"
                                  : "bg-white text-slate-800 border border-slate-200 rounded-tl-xs"
                              }`}
                            >
                              <span className="block text-[10px] font-bold opacity-80 mb-0.5">
                                {msg.senderName}
                              </span>
                              <p>{msg.text}</p>
                              <span className="block text-[9px] opacity-70 text-right mt-1">
                                {msg.timestamp}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <form
                    onSubmit={handleSendTeacherReply}
                    className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={teacherReplyInput}
                      onChange={(e) => setTeacherReplyInput(e.target.value)}
                      placeholder="Escribe tu respuesta a la familia..."
                      className="flex-1 bg-[#FAFAF0] border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#266b31]"
                    />
                    <button
                      type="submit"
                      className="bg-[#266b31] hover:bg-[#1b4e23] text-white p-2.5 rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* VISTA 4: DIRECCIÓN GENERAL (role = admin)                     */}
        {/* ============================================================= */}
        {currentRole === "admin" && (
          <div className="space-y-6">
            {/* Cabecera de Dirección */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#1b4e23] text-[#d6a427] flex items-center justify-center font-black text-xl shadow-md border border-[#d6a427]/30">
                  JP
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Ing. José Mariano Pinaya</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Director General • Unidad Educativa Fielding Bolivia
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {totalAlertsCount > 0 && (
                  <button
                    onClick={() => {
                      setAdminTab("vigilancia");
                      setAuditOnlyAlerts(true);
                    }}
                    className="flex items-center gap-1.5 text-xs font-black bg-red-600 text-white px-3 py-1.5 rounded-xl shadow-sm animate-pulse cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{totalAlertsCount} Alerta(s) en Chats</span>
                  </button>
                )}
                <span className="text-xs font-bold bg-[#1b4e23] text-white px-3 py-1.5 rounded-xl shadow-xs">
                  Consola Estratégica Dirección
                </span>
              </div>
            </div>

            {/* Pestañas de Dirección */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
              {(
                [
                  {
                    id: "centralizador",
                    label: "Centralizador Maestro SIGED",
                    icon: FileSpreadsheet,
                  },
                  {
                    id: "vigilancia",
                    label: `Vigilancia de Chats (${totalAlertsCount})`,
                    icon: ShieldCheck,
                  },
                  {
                    id: "comunicados",
                    label: "Comunicados Institucionales",
                    icon: Bell,
                  },
                  {
                    id: "supervision_meet",
                    label: "Supervisión Entrevistas Meet",
                    icon: Video,
                  },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const isActive = adminTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-[#1b4e23] text-white shadow-md"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#d6a427]" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 1. CENTRALIZADOR MAESTRO */}
            {adminTab === "centralizador" && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setAdminViewMode("ALL")}
                      className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                        adminViewMode === "ALL"
                          ? "bg-[#266b31] text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      General
                    </button>
                    <button
                      onClick={() => setAdminViewMode("SIGED")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                        adminViewMode === "SIGED"
                          ? "bg-[#1b4e23] text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-[#d6a427]" />
                      <span>Vista SIGED (4 Campos)</span>
                    </button>
                    <button
                      onClick={() => setAdminViewMode("HONOR")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                        adminViewMode === "HONOR"
                          ? "bg-[#d6a427] text-[#1b4e23] shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Cuadro de Honor (Top 5)</span>
                    </button>

                    <span className="text-slate-300">|</span>

                    <select
                      value={adminCourseFilter}
                      onChange={(e) => setAdminCourseFilter(e.target.value)}
                      className="bg-[#FAFAF0] border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-700"
                    >
                      <option value="ALL">Todos los Niveles</option>
                      <option value="PRIM">PRIMARIA</option>
                      <option value="SEC">SECUNDARIA</option>
                      <option value="1RO-SEC">1RO-SEC</option>
                      <option value="2DO-SEC">2DO-SEC</option>
                      <option value="4TO-PRIM">4TO-PRIM</option>
                    </select>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      placeholder="Buscar por estudiante o RUDE..."
                      className="pl-8 pr-3 py-1.5 bg-[#FAFAF0] border border-slate-300 rounded-xl text-xs font-medium w-56 focus:outline-none focus:ring-1 focus:ring-[#266b31]"
                    />
                  </div>
                </div>

                {/* Tabla Centralizadora */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-[#1b4e23] text-white font-bold uppercase text-[10px] tracking-wider">
                          <th className="p-3">#</th>
                          <th className="p-3">Estudiante</th>
                          <th className="p-3">Curso</th>
                          {adminViewMode === "SIGED" ? (
                            <>
                              {SIGED_CAMPOS.map((c) => (
                                <th key={c.key} className="p-3 text-center">
                                  {c.short}
                                </th>
                              ))}
                            </>
                          ) : (
                            <>
                              <th className="p-3">RUDE</th>
                              <th className="p-3">Nivel Inglés</th>
                            </>
                          )}
                          <th className="p-3 text-center">Promedio</th>
                          <th className="p-3 text-center">Estado</th>
                          <th className="p-3 text-right">Boletín</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {processedAdminStudents.map((s, idx) => (
                          <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-mono font-bold text-slate-400">
                              {adminViewMode === "HONOR" ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-black">
                                  {idx + 1}
                                </span>
                              ) : (
                                idx + 1
                              )}
                            </td>
                            <td className="p-3 font-extrabold text-slate-900">{s.full_name}</td>
                            <td className="p-3 font-semibold text-[#266b31]">{s.course}</td>

                            {adminViewMode === "SIGED" ? (
                              <>
                                {SIGED_CAMPOS.map((c) => (
                                  <td key={c.key} className="p-3 text-center">
                                    <span
                                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${getGradeColorClass(
                                        s.campoAvgs[c.key]
                                      )}`}
                                    >
                                      {s.campoAvgs[c.key]}
                                    </span>
                                  </td>
                                ))}
                              </>
                            ) : (
                              <>
                                <td className="p-3 font-mono text-[11px] text-slate-500">
                                  {s.rude_code}
                                </td>
                                <td className="p-3">
                                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                    {s.english_level}
                                  </span>
                                </td>
                              </>
                            )}

                            <td className="p-3 text-center">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-black ${getGradeColorClass(
                                  s.calculatedAvg
                                )}`}
                              >
                                {s.calculatedAvg}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              {s.calculatedAvg >= 51 ? (
                                <span className="text-emerald-700 font-bold text-[10px]">
                                  PROMOVIDO
                                </span>
                              ) : (
                                <span className="text-red-600 font-bold text-[10px]">RETENIDO</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setBoletinStudent(s)}
                                className="inline-flex items-center gap-1.5 bg-[#266b31] hover:bg-[#1b4e23] text-white px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer shadow-xs active:scale-95"
                              >
                                <Printer className="w-3 h-3 text-[#d6a427]" />
                                <span>🖨️ Boletín PDF</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PANEL DE VIGILANCIA Y AUDITORÍA DE CHATS (EN VIVO) */}
            {adminTab === "vigilancia" && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Consola de Vigilancia y Auditoría de Chats</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Registro inalterable de todas las conversaciones entre docentes, padres y
                        estudiantes. Los mensajes no pueden ser eliminados.
                      </p>
                    </div>

                    <span className="flex items-center gap-1.5 text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                      <Lock className="w-3 h-3" />
                      <span>En vivo • Auditoría Inmutable</span>
                    </span>
                  </div>

                  {/* Filtros por Docente, Curso, Palabra Clave y Solo Alertas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
                    <select
                      value={auditTeacherFilter}
                      onChange={(e) => setAuditTeacherFilter(e.target.value)}
                      className="bg-[#FAFAF0] border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-700"
                    >
                      <option value="ALL">Todos los Docentes</option>
                      {auditTeachers.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>

                    <select
                      value={auditCourseFilter}
                      onChange={(e) => setAuditCourseFilter(e.target.value)}
                      className="bg-[#FAFAF0] border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-700"
                    >
                      <option value="ALL">Todos los Cursos</option>
                      {auditCourses.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={auditKeywordFilter}
                        onChange={(e) => setAuditKeywordFilter(e.target.value)}
                        placeholder="Filtrar por palabra clave..."
                        className="w-full pl-8 pr-3 py-2 bg-[#FAFAF0] border border-slate-300 rounded-xl text-xs font-medium focus:ring-1 focus:ring-[#266b31]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setAuditOnlyAlerts(!auditOnlyAlerts)}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                        auditOnlyAlerts
                          ? "bg-red-600 text-white border-red-600 shadow-sm"
                          : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>
                        {auditOnlyAlerts
                          ? `Mostrando solo Alertas (${totalAlertsCount})`
                          : `Filtrar Alertas (${totalAlertsCount})`}
                      </span>
                    </button>
                  </div>

                  {/* Palabras de Alerta Configurables */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
                        Palabras Clave de Alerta Automática (Configurables):
                      </span>
                      <form onSubmit={handleAddAlertKeyword} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={newAlertWord}
                          onChange={(e) => setNewAlertWord(e.target.value)}
                          placeholder="Agregar palabra..."
                          className="px-2.5 py-1 bg-[#FAFAF0] border border-slate-300 rounded-lg text-[11px] font-medium w-36"
                        />
                        <button
                          type="submit"
                          className="bg-[#266b31] hover:bg-[#1b4e23] text-white px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Añadir</span>
                        </button>
                      </form>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {alertKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                        >
                          <span>{kw}</span>
                          <button
                            type="button"
                            onClick={() => removeAlertKeyword(kw)}
                            className="hover:text-red-900 cursor-pointer"
                            title="Quitar palabra de alerta"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lista de Mensajes Auditados (SIN botón de borrado) */}
                <div className="space-y-2.5">
                  {filteredAuditMessages.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-xs text-slate-500">
                      No se encontraron mensajes con los filtros seleccionados.
                    </div>
                  ) : (
                    filteredAuditMessages.map((m) => (
                      <div
                        key={m.id}
                        className={`bg-white rounded-2xl p-4 border transition-all shadow-xs ${
                          m.hasAlert ? "border-red-400 bg-red-50/40" : "border-slate-200"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-slate-900">{m.senderName}</span>
                            <span className="text-slate-400">➔</span>
                            <span className="font-semibold text-slate-700">{m.recipientName}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded">
                              {m.course}
                            </span>
                            <span className="text-[10px] bg-[#266b31]/10 text-[#266b31] font-bold px-2 py-0.5 rounded">
                              {m.teacherName}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {m.hasAlert && (
                              <span className="flex items-center gap-1 bg-red-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full animate-pulse">
                                <AlertTriangle className="w-3 h-3" />
                                <span>ALERTA: {m.alertKeyword}</span>
                              </span>
                            )}
                            <span className="text-[10px] font-semibold text-slate-400">
                              {m.timestamp}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-800 mt-2 font-medium bg-[#FAFAF0] p-2.5 rounded-xl border border-slate-100">
                          &ldquo;{m.text}&rdquo;
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 3. COMUNICADOS INSTITUCIONALES */}
            {adminTab === "comunicados" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#d6a427]" />
                    <span>Gestión de Comunicados Oficiales de Dirección</span>
                  </h3>

                  <button
                    onClick={() => setShowNewAnnouncementModal(true)}
                    className="flex items-center gap-1.5 bg-[#266b31] hover:bg-[#1b4e23] text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Emitir Nuevo Comunicado</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                              ann.priority === "ALTA"
                                ? "bg-red-100 text-red-800"
                                : ann.priority === "MEDIA"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            PRIORIDAD {ann.priority}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">{ann.date}</span>
                          <span className="text-[10px] font-bold text-[#266b31] bg-[#266b31]/10 px-2 py-0.5 rounded">
                            {ann.targetRole}
                          </span>
                        </div>

                        <h4 className="text-sm font-extrabold text-slate-900">{ann.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                      </div>

                      <button
                        onClick={() => deleteAnnouncement(ann.id)}
                        className="text-slate-400 hover:text-red-600 p-2 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar comunicado"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. SUPERVISIÓN DE ENTREVISTAS MEET */}
            {adminTab === "supervision_meet" && (
              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  <span>Registro y Supervisión Central de Entrevistas Meet</span>
                </h3>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                          <th className="p-3">Docente</th>
                          <th className="p-3">Familia / Estudiante</th>
                          <th className="p-3">Curso</th>
                          <th className="p-3">Fecha y Hora</th>
                          <th className="p-3">Código Sala</th>
                          <th className="p-3">Estado</th>
                          <th className="p-3 text-right">Acceso</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {interviews.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-800">{m.teacherName}</td>
                            <td className="p-3">
                              <p className="font-semibold text-slate-800">{m.parentName}</p>
                              <p className="text-[10px] text-slate-500">{m.studentName}</p>
                            </td>
                            <td className="p-3 text-[#266b31] font-bold">{m.course}</td>
                            <td className="p-3 text-slate-500 font-mono">
                              {m.date} {m.time}
                            </td>
                            <td className="p-3 font-mono text-[11px] text-blue-700">
                              {m.meetCode}
                            </td>
                            <td className="p-3">
                              <select
                                value={m.status}
                                onChange={(e) =>
                                  updateMeetStatus(
                                    m.id,
                                    e.target.value as "PROGRAMADA" | "COMPLETADA" | "CANCELADA"
                                  )
                                }
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                                  m.status === "COMPLETADA"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : m.status === "CANCELADA"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-blue-50 text-blue-800 border-blue-200"
                                }`}
                              >
                                <option value="PROGRAMADA">PROGRAMADA</option>
                                <option value="COMPLETADA">COMPLETADA</option>
                                <option value="CANCELADA">CANCELADA</option>
                              </select>
                            </td>
                            <td className="p-3 text-right">
                              <a
                                href={m.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-bold inline-flex items-center gap-1"
                              >
                                <span>Entrar</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL PARA SOLICITAR NUEVA CITA MEET (PADRES / ESTUDIANTES) */}
      {showParentMeetModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-600" />
                <span>Solicitar Nueva Entrevista Google Meet</span>
              </h3>
              <button
                onClick={() => setShowParentMeetModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => handleCreateMeet(e, true)} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Docente Titular</label>
                <input
                  type="text"
                  value="Lic. Ivan Ezequiel Mancilla Copa"
                  readOnly
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Fecha Sugerida</label>
                  <input
                    type="date"
                    value={newMeetDate}
                    onChange={(e) => setNewMeetDate(e.target.value)}
                    className="w-full bg-[#FAFAF0] border border-slate-300 rounded-xl p-2 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Hora Sugerida</label>
                  <input
                    type="time"
                    value={newMeetTime}
                    onChange={(e) => setNewMeetTime(e.target.value)}
                    className="w-full bg-[#FAFAF0] border border-slate-300 rounded-xl p-2 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  Motivo de la Entrevista
                </label>
                <textarea
                  rows={3}
                  value={newMeetReason}
                  onChange={(e) => setNewMeetReason(e.target.value)}
                  placeholder="Indique los temas a conversar con el docente..."
                  className="w-full bg-[#FAFAF0] border border-slate-300 rounded-xl p-2.5 font-medium"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowParentMeetModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-600 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#266b31] hover:bg-[#1b4e23] text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Confirmar Solicitud Meet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PARA EMITIR COMUNICADO (ADMIN) */}
      {showNewAnnouncementModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                Emitir Comunicado Institucional
              </h3>
              <button
                onClick={() => setShowNewAnnouncementModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  Título del Comunicado
                </label>
                <input
                  type="text"
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  placeholder="Ej: Suspensión de actividades por feriado"
                  className="w-full bg-[#FAFAF0] border border-slate-300 rounded-xl p-2.5 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Prioridad</label>
                  <select
                    value={newAnnPriority}
                    onChange={(e) =>
                      setNewAnnPriority(e.target.value as "ALTA" | "MEDIA" | "GENERAL")
                    }
                    className="w-full bg-[#FAFAF0] border border-slate-300 rounded-xl p-2 font-semibold"
                  >
                    <option value="GENERAL">General</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta (Urgente)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Público Objetivo</label>
                  <select
                    value={newAnnTarget}
                    onChange={(e) =>
                      setNewAnnTarget(e.target.value as "TODOS" | "PADRES" | "DOCENTES")
                    }
                    className="w-full bg-[#FAFAF0] border border-slate-300 rounded-xl p-2 font-semibold"
                  >
                    <option value="TODOS">Todos</option>
                    <option value="PADRES">Padres</option>
                    <option value="DOCENTES">Docentes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Contenido Detallado</label>
                <textarea
                  rows={4}
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  placeholder="Escriba el comunicado..."
                  className="w-full bg-[#FAFAF0] border border-slate-300 rounded-xl p-2.5 font-medium"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewAnnouncementModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-600 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#266b31] hover:bg-[#1b4e23] text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Publicar Ahora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BOLETÍN CARTA OFICIAL */}
      {boletinStudent && (
        <BoletinModal student={boletinStudent} onClose={() => setBoletinStudent(null)} />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAF0] flex items-center justify-center text-sm font-bold text-[#266b31]">
          Cargando Fielding App...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
