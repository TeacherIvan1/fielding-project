"use client";

import React, { useState } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";

type Role = "PARENT" | "STUDENT" | "TEACHER" | "ADMIN";

interface DemoAccount {
  role: "admin" | "teacher" | "parent" | "student";
  roleType: Role;
  label: string;
  sublabel: string;
  username: string;
  password: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "admin",
    roleType: "ADMIN",
    label: "Director",
    sublabel: "Matriz Centralizadora SIGED",
    username: "admin_direccion",
    password: "Fielding2026!",
    name: "Ing. José Mariano Pinaya",
    icon: ShieldCheck,
  },
  {
    role: "teacher",
    roleType: "TEACHER",
    label: "Docente",
    sublabel: "PDCs, Planes y Drive",
    username: "prof_ivan.mancilla",
    password: "Fielding2026!",
    name: "Lic. Ivan Ezequiel Mancilla Copa",
    icon: BookOpen,
  },
  {
    role: "parent",
    roleType: "PARENT",
    label: "Padre de Familia",
    sublabel: "Seguimiento y Boletín",
    username: "fam_aliaga.ramos",
    password: "Fielding1001",
    name: "Familia Aliaga Ramos",
    icon: Users,
  },
  {
    role: "student",
    roleType: "STUDENT",
    label: "Estudiante",
    sublabel: "Dimensiones y Tareas",
    username: "est_aliaga.ramos",
    password: "Fielding1001",
    name: "Aliaga Ramos Yusuf Adel",
    icon: GraduationCap,
  },
];

export default function FieldingLoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role>("TEACHER");
  const [username, setUsername] = useState("prof_ivan.mancilla");
  const [password, setPassword] = useState("Fielding2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Modal obligatorio de primer ingreso / cambio de contraseña
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [modalError, setModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectDemo = (acc: DemoAccount, autoLogin = false) => {
    setSelectedRole(acc.roleType);
    setUsername(acc.username);
    setPassword(acc.password);
    setErrorMessage("");

    if (autoLogin) {
      window.location.href = `/dashboard?role=${acc.role}&user=${encodeURIComponent(
        acc.username
      )}&name=${encodeURIComponent(acc.name)}`;
    }
  };

  const findAccountName = (user: string, role: Role): string => {
    const acc = DEMO_ACCOUNTS.find((a) => a.username === user);
    if (acc) return acc.name;
    if (role === "ADMIN") return "Ing. José Mariano Pinaya";
    if (role === "TEACHER") return "Lic. Ivan Ezequiel Mancilla Copa";
    if (role === "PARENT") return "Familia Aliaga Ramos";
    return "Estudiante Fielding";
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!username.trim()) {
      setErrorMessage("Por favor ingresa tu código de usuario institucional.");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("Por favor ingresa tu contraseña institucional.");
      return;
    }

    // Comprobar credenciales demo
    const matchingAcc = DEMO_ACCOUNTS.find(
      (a) => a.username === username.trim() && a.password === password.trim()
    );

    if (matchingAcc) {
      // Ingreso directo exitoso para cuentas configuradas
      window.location.href = `/dashboard?role=${matchingAcc.role}&user=${encodeURIComponent(
        matchingAcc.username
      )}&name=${encodeURIComponent(matchingAcc.name)}`;
      return;
    }

    // Si es una cuenta nueva o provisional, abre el modal obligatorio de primer ingreso
    setShowModal(true);
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    if (newPassword.length < 6) {
      setModalError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setModalError("Las contraseñas no coinciden. Verifica nuevamente.");
      return;
    }

    setIsSubmitting(true);
    const assignedName = findAccountName(username, selectedRole);

    setTimeout(() => {
      window.location.href = `/dashboard?role=${selectedRole.toLowerCase()}&user=${encodeURIComponent(
        username
      )}&name=${encodeURIComponent(assignedName)}`;
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF0] flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      {/* TARJETA DE LOGIN */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-t-8 border-[#d6a427] overflow-hidden transition-all duration-300">
        {/* ENCABEZADO INSTITUCIONAL */}
        <div className="bg-gradient-to-br from-[#266b31] via-[#1b4e23] to-[#123617] p-6 text-center text-white relative">
          <div className="w-20 h-20 mx-auto mb-3 bg-[#FAFAF0] rounded-2xl flex items-center justify-center shadow-lg border-2 border-[#d6a427] transform -rotate-1 hover:rotate-0 transition-transform">
            <GraduationCap className="w-12 h-12 text-[#266b31]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
            Colegio Fielding Bolivia
          </h1>
          <p className="text-xs text-[#9ac29d] mt-1 font-semibold tracking-wide">
            Comunidad Educativa Vocacional • Gestión 2026
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-black/25 rounded-full text-[11px] font-medium text-[#d6a427] border border-[#d6a427]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#d6a427]" />
            Plataforma Académica en Tiempo Real
          </div>
        </div>

        {/* ACCESO RÁPIDO DEMO (1-CLIC) */}
        <div className="p-5 pb-0 bg-amber-50/50 border-b border-amber-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase text-[#b45309] tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#d6a427]" />
              Acceso Rápido Demo (1-Clic)
            </span>
            <span className="text-[9px] text-slate-400 font-medium">Autocompleta y prueba</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {DEMO_ACCOUNTS.map((acc) => {
              const IconComp = acc.icon;
              return (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleSelectDemo(acc, true)}
                  className="p-2.5 bg-white hover:bg-[#1b4e23] hover:text-white border border-slate-200 hover:border-[#1b4e23] rounded-xl text-left transition-all group shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <IconComp className="w-3.5 h-3.5 text-[#266b31] group-hover:text-[#d6a427] shrink-0" />
                    <span className="font-extrabold text-[11px] uppercase truncate">
                      {acc.label}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 group-hover:text-emerald-100 font-mono mt-0.5 truncate">
                    {acc.username}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* SELECTOR DE PERFILES & FORMULARIO */}
        <div className="p-6 sm:p-7">
          <div className="mb-5">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#1b4e23] mb-2 text-center">
              Selecciona tu Perfil Institucional
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((r) => {
                const IconComponent = r.icon;
                const isSelected = selectedRole === r.roleType;
                return (
                  <button
                    key={r.username}
                    type="button"
                    onClick={() => handleSelectDemo(r, false)}
                    className={`p-2.5 rounded-xl border-2 text-left transition-all flex flex-col items-start gap-1 cursor-pointer ${
                      isSelected
                        ? "border-[#266b31] bg-[#266b31]/5 shadow-sm text-[#1b4e23]"
                        : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isSelected
                            ? "bg-[#266b31] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#d6a427]"></span>
                      )}
                    </div>
                    <div>
                      <p className="font-extrabold text-[11px] uppercase leading-tight mt-1">
                        {r.label}
                      </p>
                      <p className="text-[9px] text-slate-400 leading-tight truncate">
                        {r.sublabel}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MENSAJE DE ERROR */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* FORMULARIO DE INGRESO */}
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Usuario Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. prof_ivan.mancilla"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#266b31] focus:bg-white text-slate-900 transition-all font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Contraseña Asignada
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#266b31] focus:bg-white text-slate-900 transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#266b31] to-[#1b4e23] hover:from-[#1e5726] hover:to-[#143d1a] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer mt-1"
            >
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* PIE DE PÁGINA */}
        <div className="bg-[#FAFAF0] px-6 py-3 border-t border-slate-200 text-center text-[10px] text-slate-500">
          Unidad Educativa Fielding Bolivia • La Paz / Sucre, Bolivia
        </div>
      </div>

      {/* MODAL OBLIGATORIO DE PRIMER INGRESO (CAMBIO DE CONTRASEÑA) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-t-8 border-[#d6a427] overflow-hidden">
            <div className="bg-[#1b4e23] p-5 text-white text-center">
              <div className="w-14 h-14 mx-auto mb-2 bg-[#d6a427] rounded-full flex items-center justify-center shadow">
                <KeyRound className="w-7 h-7 text-slate-900" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-wide">
                Actualización Obligatoria de Seguridad
              </h3>
              <p className="text-xs text-[#9ac29d] mt-0.5">
                Primer ingreso detectado para: <strong className="text-white">{username}</strong>
              </p>
            </div>

            <form onSubmit={handlePasswordChangeSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                Por políticas de seguridad institucional del Colegio Fielding, debes actualizar tu contraseña provisional antes de acceder a la plataforma.
              </div>

              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nueva Contraseña Institucional
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#266b31] text-slate-900 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#266b31] text-slate-900 font-mono"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-[#266b31] hover:bg-[#1b4e23] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 animate-spin" />
                      <span>Guardando y Redirigiendo...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Actualizar y Entrar al Dashboard</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
