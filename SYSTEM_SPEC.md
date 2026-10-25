# PROJECT SPECIFICATION: App Educativa Web & Móvil - Colegio Fielding Bolivia

## 1. Context & Aesthetics
- **Institution:** Unidad Educativa "Fielding Bolivia" (Primaria y Secundaria Comunitaria Vocacional).
- **Brand Colors:** Primary Green `#266b31`, Dark Green `#1b4e23`, Fielding Gold `#d6a427`, Light Green `#9ac29d`, Snow White `#FAFAF0`, Neutral Gray `#C8CDD2`.
- **Fonts:** Headings `'Montserrat', sans-serif`; Body `'Open Sans', sans-serif`.
- **Grade Scale (Bolivian System 1-100):** 
  - Dimensions per Trimester (1T, 2T, 3T): Ser (10 pts), Saber (45 pts), Hacer (40 pts), Autoevaluación (5 pts) -> Total = 100 pts.
  - Passing grade: 51 pts.
  - Color coding: `< 51` Red (`#fee2e2` / `#b91c1c`), `51-65` Yellow (`#fef3c7` / `#b45309`), `>= 90` Green (`#dcfce7` / `#15803d`).

## 2. Core Architecture & Roles
- **Stack:** Next.js (App Router, TypeScript), Tailwind CSS, Lucide Icons, Supabase (PostgreSQL + Realtime + Auth).
- **Authentication:** Username & Password assigned by Admin. Force password change on first login (`must_change_password = true`).
- **4 Distinct Role Interfaces:**
  1. `ADMIN` (Directores/Administrativos): Master Centralizer Matrix (Primaria, Secundaria, SIGED Official Curricular Grouping, Honor Roll Top 5 School / Top 3 Course), Official Letter-size PDF Report Card (Boletín) generator, User management, Google Drive Sync trigger, School-wide announcements.
  2. `TEACHER` (Maestros): View assigned courses/subjects (including CEFR English levels A1-C1), verify Google Drive Pedagogical Notebook sync status, publish Homework/Exams to course calendar, direct messaging with parents.
  3. `PARENT` (Padres de Familia): Mobile-first interface, switch between linked children, real-time grade cards per subject (showing Ser, Saber, Hacer, Auto breakdown), Homework/Exam calendar, push notifications, direct chat with subject teachers.
  4. `STUDENT` (Estudiantes): Mobile-first view of real-time grades, upcoming homework/exams calendar, and school announcements.

## 3. Data & Business Logic Rules
- **Courses:** `1RO-PRIM` to `6TO-PRIM`, `1RO-SEC` to `6TO-SEC`, plus transversal English groups (`A1-A`, `A1-B`, `A2-A`, `A2-B`, `B1-A`, `B1-B`, `B2`, `C1`) which map back to the student's main course under `"LENGUA EXTRANJERA"`.
- **SIGED Grouping:** Preserve the exact Bolivian curricular mapping into 4 Campos (`COMUNIDAD Y SOCIEDAD`, `CIENCIA TECNOLOGÍA Y PRODUCCIÓN`, `VIDA TIERRA TERRITORIO`, `COSMOS Y PENSAMIENTOS`) and their respective official Áreas.