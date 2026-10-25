# Colegio Fielding Bolivia • Plataforma Académica y Gestión Curricular

Plataforma educativa integral de **Gestión Escolar, Centralización de Calificaciones en Tiempo Real y Generación de Planificaciones Curriculares Oficiales (PDCs y Planes de Clase)** para el **Colegio Fielding Bolivia** (Niveles Primaria y Secundaria Comunitaria Vocacional/Productiva, Gestión 2026).

---

## 🏛️ Identidad y Contexto Institucional
- **Institución:** Unidad Educativa Fielding Bolivia (La Paz / Sucre, Bolivia).
- **Colores Oficiales:**
  - Verde Primario: `#266b31`
  - Verde Oscuro Institucional: `#1b4e23`
  - Oro Fielding: `#d6a427`
  - Verde Claro Acento: `#9ac29d`
  - Blanco Nieve / Fondo Cálido: `#FAFAF0`
- **Tipografías Institucionales:** `Montserrat` (Encabezados y títulos) y `Open Sans` (Cuerpo de texto).
- **Escala de Calificación Oficial (SEP Bolivia 1-100 pts):**
  - Dimensiones Trimestrales (1T, 2T, 3T): **SER (10 pts)**, **SABER (45 pts)**, **HACER (40 pts)**, **AUTOEVALUACIÓN (5 pts)** = **100 pts**.
  - Nota mínima de aprobación: **51 pts**.
  - Codificación cromática: `< 51` Rojo, `51-65` Amarillo, `>= 90` Verde.

---

## 🛠️ Stack Tecnológico y Arquitectura
- **Framework Web:** [Next.js](https://nextjs.org/) (App Router, React 19, Turbopack).
- **Lenguaje:** TypeScript (Estricto, tipado estático completo con 0 errores).
- **Estilos y Diseño:** Tailwind CSS v4 con variables CSS temáticas e impresión `@media print` en formato Carta.
- **Iconografía:** Lucide React.
- **Base de Datos & Esquema SQL:** PostgreSQL / Supabase (`supabase/schema.sql`) con 10 tablas relacionales:
  1. `users` (Gestión de perfiles, roles y primer ingreso obligatorio).
  2. `courses` (Cursos de Primaria, Secundaria y niveles transversales MCER).
  3. `subjects` (Materias clasificadas por Campos y Áreas oficiales SIGED).
  4. `student_profiles` (Códigos RUDE y vinculación académica).
  5. `parent_student_links` (Soporte multipadre/multihijo).
  6. `teacher_assignments` (Vínculos con Cuadernos Pedagógicos en Google Drive).
  7. `grades` (3 trimestres x 4 dimensiones bolivianas + nota final).
  8. `calendar_events` (Tareas, exámenes y proyectos con fechas límite).
  9. `announcements` (Comunicados escolares por prioridad).
  10. `direct_messages` (Canal directo seguro entre familias y docentes).
- **Procesamiento de Datos:** `PapaParse` para ingesta y sincronización de centralizadores anuales y configuraciones docentes.

---

## 👥 Perfiles de Usuario y Funcionalidades Clave

### 1. 🛡️ Dirección General / Administrativos (`ADMIN`)
- **Matriz Centralizadora Instantánea:** Filtros por nivel (`PRIMARIA`, `SECUNDARIA`), vista oficial `SIGED` agrupada por Áreas y cálculo automático de promedios de curso.
- **🏆 Cuadro de Honor Institucional:** Top 5 mejores promedios del colegio con insignias de honor (🥇, 🥈, 🥉).
- **Boletín Oficial Tamaño Carta:** Generación de boletines impresos con membrete del Estado Plurinacional de Bolivia, Ministerio de Educación y desglose jerárquico por Campos y Áreas curriculares.
- **Sincronización General:** Disparador en tiempo real de actualización con medición exacta de latencia en milisegundos.

### 2. 👨‍🏫 Docentes (`TEACHER`)
- **📄 Generador de PDCs Mensuales (`TeacherCurriculumHub`):**
  - Filtros en cascada por Materia, Año de Escolaridad y Mes.
  - Membrete oficial institucional y tablas normativas del SEP (Perfiles de Salida, Objetivo Holístico, Contenidos, Orientaciones Metodológicas con Práctica/Teoría/Valoración/Producción, Recursos, Criterios Ser/Saber/Hacer, Adaptaciones y Firmas).
- **📚 Generador de Planes de Clase:**
  - Secuencia didáctica por clase (Inicio, Adquisición, Aplicación, Evaluación), recursos, instrumentos y adaptaciones curriculares.
  - Impresión continua o por clase en hoja Carta (`@page { size: letter; }`).
- **📊 Cuadernos Pedagógicos (Google Drive):**
  - Acceso directo a las hojas de cálculo de calificaciones en Google Sheets y sincronización bidireccional.
- **📅 Agenda y Mensajes:**
  - Publicación interactiva de tareas/exámenes y chat directo con familias.

### 3. 👨‍👩‍👧 Padres de Familia (`PARENT`) & 🎓 Estudiantes (`STUDENT`)
- **Diseño Mobile-First:** Experiencia optimizada para smartphones y tablets.
- **Selector de Estudiante:** Para familias con más de un hijo inscrito en el colegio.
- **Desglose Trimestral de Calificaciones:** Tarjetas desplegables por materia mostrando las 4 dimensiones (SER 10, SABER 45, HACER 40, AUTO 5).
- **Descarga de Boletín Oficial:** Acceso directo al modal de impresión de calificaciones.
- **Agenda Escolar & Avisos:** Calendario de tareas programadas y comunicados institucionales.
- **Canal Seguro de Mensajería:** Comunicación directa con los profesores titulares.

---

## ⚡ Endpoints y Webhooks de Tiempo Real
- `GET /api/seed`: Lectura de alta velocidad (`< 25ms`) sin caché de los datos académicos consolidados (`270 estudiantes`, `23 docentes`).
- `GET /api/curriculum`: Consulta en tiempo real de los `100 PDCs` y `113 Planes de Clase` generados para el cuerpo docente.
- `POST /api/sync-drive`: Webhook receptor de Google Sheets / Google Apps Script. Valida el secreto institucional (`FIELDING_SYNC_SECRET`), normaliza nombres, ejecuta el Fuzzy Match para niveles de inglés MCER y persiste los cambios en disco.

---

## 🔑 Credenciales de Prueba (Acceso Rápido Demo)

| Perfil | Usuario | Contraseña | Nombre Asignado |
|---|---|---|---|
| **Director** | `admin_direccion` | `Fielding2026!` | Ing. José Mariano Pinaya |
| **Docente** | `prof_ivan.mancilla` | `Fielding2026!` | Lic. Ivan Ezequiel Mancilla Copa |
| **Padre de Familia** | `fam_aliaga.ramos` | `Fielding1001` | Familia Aliaga Ramos |
| **Estudiante** | `est_aliaga.ramos` | `Fielding1001` | Aliaga Ramos Yusuf Adel |

---

## 🚀 Instalación y Puesta en Marcha

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/TeacherIvan1/fielding-project.git
   cd fielding-project
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Generar / Actualizar Semillas de Datos desde los CSVs:**
   ```bash
   npm run seed
   ```

4. **Verificar tipos TypeScript:**
   ```bash
   npx tsc --noEmit
   ```

5. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📂 Estructura del Proyecto

```
fielding-project/
├── data/                               # CSVs fuente (Centralizador, Profesores, PDCs, Planes)
├── public/
│   └── seed/                           # Semillas JSON generadas para alta velocidad
│       ├── fielding_db_seed.json       # Datos consolidados de estudiantes y profesores
│       └── fielding_curriculum_seed.json # PDCs y Planes de Clase estructurados
├── scripts/
│   └── transform-csv.ts                # Ingesta, normalización y cruce curricular SIGED
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── curriculum/route.ts     # Endpoint de consulta curricular (PDCs y Clases)
│   │   │   ├── seed/route.ts           # Endpoint de lectura rápida en tiempo real
│   │   │   └── sync-drive/route.ts     # Webhook de sincronización con Google Drive
│   │   ├── dashboard/page.tsx          # Dashboard multipropósito con control de roles
│   │   ├── globals.css                 # Configuración de Tailwind CSS v4 y variables
│   │   ├── layout.tsx                  # Layout raíz con Google Fonts (Montserrat & Open Sans)
│   │   └── page.tsx                    # Pantalla de Login con Accesos Demo (1-Clic)
│   ├── components/
│   │   ├── BoletinModal.tsx            # Modal imprimible oficial de Boletín en tamaño Carta
│   │   └── TeacherCurriculumHub.tsx    # Generador e impresor oficial de PDCs y Planes
│   └── lib/
│       └── siged.ts                    # Lógica normativa SEP (Campos, Áreas, Escala cromática)
├── supabase/
│   └── schema.sql                      # Esquema DDL PostgreSQL (10 tablas relacionales)
├── package.json
├── tsconfig.json
└── README.md
```

---

© 2026 **Colegio Fielding Bolivia** • Todos los derechos reservados.
