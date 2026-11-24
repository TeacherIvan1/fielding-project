"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "admin",
    roleType: "ADMIN",
    label: "Dirección General",
    sublabel: "Matriz Centralizadora y Auditoría de Chats",
    username: "admin_direccion",
    password: "Fielding2026!",
    name: "Ing. José Mariano Pinaya",
    badge: "Director General",
    icon: ShieldCheck,
  },
  {
    role: "teacher",
    roleType: "TEACHER",
    label: "Docente Titular",
    sublabel: "PDCs con IA, Planes de Clase y Meet",
    username: "prof_ivan.mancilla",
    password: "Fielding2026!",
    name: "Lic. Ivan Ezequiel Mancilla Copa",
    badge: "Historia e Inglés",
    icon: BookOpen,
  },
  {
    role: "parent",
    roleType: "PARENT",
    label: "Padre de Familia",
    sublabel: "Seguimiento en Vivo, Boletín Carta y Meet",
    username: "fam_aliaga.ramos",
    password: "Fielding1001",
    name: "Familia Aliaga Ramos",
    badge: "Tutor 1RO-SEC",
    icon: Users,
  },
  {
    role: "student",
    roleType: "STUDENT",
    label: "Estudiante",
    sublabel: "Calificaciones 4D, Agenda y Tareas",
    username: "est_aliaga.ramos",
    password: "Fielding1001",
    name: "Aliaga Ramos Yusuf Adel",
    badge: "1RO-SEC • B1-A",
    icon: GraduationCap,
  },
];

export default function LoginPage() {
  const router = useRouter();

  // Estados de formulario
  const [selectedRole, setSelectedRole] = useState<Role>("PARENT");
  const [username, setUsername] = useState("fam_aliaga.ramos");
  const [password, setPassword] = useState("Fielding1001");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modal obligatorio de seguridad para primer ingreso
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [pendingRole, setPendingRole] = useState<string>("parent");
  const [pendingUser, setPendingUser] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdError, setPwdError] = useState("");

  const handleRoleTabChange = (role: Role) => {
    setSelectedRole(role);
    setErrorMsg(null);
    const demo = DEMO_ACCOUNTS.find((d) => d.roleType === role);
    if (demo) {
      setUsername(demo.username);
      setPassword(demo.password);
    }
  };

  const executeLogin = (userRole: string, userName: string) => {
    // Guardar en sessionStorage para el dashboard
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "fielding_session",
        JSON.stringify({
          role: userRole,
          username: userName,
          name:
            DEMO_ACCOUNTS.find((a) => a.username === userName)?.name ||
            userName,
        })
      );
    }
    router.push(`/dashboard?role=${userRole}`);
  };

  const handleDirectDemoLogin = (account: DemoAccount) => {
    setSelectedRole(account.roleType);
    setUsername(account.username);
    setPassword(account.password);
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      executeLogin(account.role, account.username);
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg("Por favor, ingrese sus credenciales completas.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const roleLower = selectedRole.toLowerCase();

      // Si es un usuario inicial que requiere cambio de contraseña
      if (password.startsWith("Fielding") && (roleLower === "parent" || roleLower === "student")) {
        setPendingRole(roleLower);
        setPendingUser(username);
        setShowSecurityModal(true);
      } else {
        executeLogin(roleLower, username);
      }
    }, 400);
  };

  const handleSaveSecurityPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPwdError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("Las contraseñas no coinciden.");
      return;
    }
    setShowSecurityModal(false);
    executeLogin(pendingRole, pendingUser);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF0] flex flex-col justify-between text-slate-800">
      {/* Barra decorativa superior */}
      <div className="h-2 bg-gradient-to-r from-[#266b31] via-[#d6a427] to-[#1b4e23] w-full" />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* COLUMNA IZQUIERDA: Tarjeta de Acceso Rápido Demo para Evaluación */}
          <div className="lg:col-span-5 order-2 lg:order-1 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#266b31]/5 rounded-bl-full pointer-events-none" />

              <div className="flex items-center gap-2 text-[#266b31] font-bold text-xs uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-[#d6a427]" />
                <span>Demostración de Evaluación Rápida</span>
              </div>

              <h2 className="text-xl font-black text-slate-900 leading-tight">
                Acceso Inmediato por Perfil
              </h2>
              <p className="text-xs text-slate-600 mt-1 mb-5">
                Haz clic en cualquiera de los 4 perfiles para ingresar al instante y probar la plataforma en tiempo real:
              </p>

              {/* Botones de Acceso Rápido */}
              <div className="grid grid-cols-1 gap-2.5">
                {DEMO_ACCOUNTS.map((account) => {
                  const Icon = account.icon;
                  const isCurrent = username === account.username;

                  return (
                    <button
                      key={account.role}
                      type="button"
                      onClick={() => handleDirectDemoLogin(account)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                        isCurrent
                          ? "bg-[#266b31]/10 border-[#266b31] shadow-sm"
                          : "bg-slate-50 border-slate-200 hover:border-[#266b31]/50 hover:bg-slate-100/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            isCurrent
                              ? "bg-[#266b31] text-white"
                              : "bg-white text-[#266b31] border border-slate-200 group-hover:bg-[#266b31] group-hover:text-white"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              {account.label}
                            </span>
                            <span className="text-[10px] font-bold bg-[#d6a427]/20 text-[#1b4e23] px-2 py-0.5 rounded-full">
                              {account.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {account.name} • <span className="font-mono text-[10px] text-slate-400">{account.username}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center text-xs font-bold text-[#266b31] opacity-80 group-hover:opacity-100 transition-opacity">
                        <Zap className="w-4 h-4 text-[#d6a427] mr-1" />
                        <span>Entrar</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Base de datos local sincronizada
                </span>
                <span className="font-mono text-slate-400">v2.4.0</span>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: Formulario de Login Institucional */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl relative">
              {/* Encabezado Institucional */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 mb-4 p-2 rounded-2xl bg-[#FAFAF0] border border-slate-200 shadow-inner">
                  <img
                    src="https://i.imgur.com/wjibHTr.png"
                    alt="Colegio Fielding Bolivia"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#266b31] tracking-tight uppercase">
                  UNIDAD EDUCATIVA FIELDING
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                  Plataforma Académica y Centralizador Institucional Bolivia
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="h-0.5 w-12 bg-[#d6a427]" />
                  <span className="text-[11px] font-bold text-[#d6a427] uppercase tracking-widest">
                    GESTIÓN 2026
                  </span>
                  <span className="h-0.5 w-12 bg-[#d6a427]" />
                </div>
              </div>

              {/* Selector de Rol en Pestañas */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                  Selecciona tu Perfil de Ingreso:
                </label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-[#FAFAF0] rounded-2xl border border-slate-200">
                  {(
                    [
                      { id: "PARENT", label: "Padre", icon: Users },
                      { id: "STUDENT", label: "Estudiante", icon: GraduationCap },
                      { id: "TEACHER", label: "Docente", icon: BookOpen },
                      { id: "ADMIN", label: "Dirección", icon: ShieldCheck },
                    ] as const
                  ).map((item) => {
                    const Icon = item.icon;
                    const isActive = selectedRole === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleRoleTabChange(item.id)}
                        className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#266b31] text-white shadow-md scale-[1.02]"
                            : "text-slate-600 hover:text-slate-900 hover:bg-white"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mensaje de Error */}
              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-semibold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                      placeholder="Ej: fam_aliaga.ramos"
                      className="w-full pl-10 pr-4 py-3 bg-[#FAFAF0] border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#266b31] focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Contraseña
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
                      className="w-full pl-10 pr-11 py-3 bg-[#FAFAF0] border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#266b31] focus:bg-white transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#266b31] hover:bg-[#1b4e23] text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-lg shadow-[#266b31]/20 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Iniciando sesión...
                      </span>
                    ) : (
                      <>
                        <span>Ingresar a la Plataforma</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-500">
                  ¿Problemas con tu cuenta institucional? Contacta a{" "}
                  <span className="font-semibold text-[#266b31]">
                    soporte@fielding.edu.bo
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL OBLIGATORIO DE CAMBIO DE CONTRASEÑA (PRIMER INGRESO) */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#b45309] flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-black text-slate-900">
                Actualización Obligatoria de Seguridad
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Bienvenido a Fielding App. Al ser tu primer ingreso, el sistema
                requiere que actualices tu contraseña provisoria para proteger los
                datos académicos.
              </p>
            </div>

            {pwdError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold">
                {pwdError}
              </div>
            )}

            <form onSubmit={handleSaveSecurityPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nueva Contraseña Personal
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2.5 bg-[#FAFAF0] border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#266b31]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="w-full px-3.5 py-2.5 bg-[#FAFAF0] border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#266b31]"
                  required
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full bg-[#266b31] hover:bg-[#1b4e23] text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar y Continuar al Dashboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSecurityModal(false);
                    executeLogin(pendingRole, pendingUser);
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Continuar sin cambiar por ahora (Demo)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pie de página institucional */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-white/50 backdrop-blur-sm">
        <p>
          Colegio Fielding Bolivia © 2026 • Sistema de Gestión Académica SIGED •
          Sucre, Bolivia
        </p>
      </footer>
    </div>
  );
}
