-- ============================================================================
-- COLEGIO FIELDING BOLIVIA - ESQUEMA DE BASE DE DATOS (SUPABASE / POSTGRESQL)
-- GESTIÓN ACADÉMICA 2026 - PRIMARIA Y SECUNDARIA COMUNITARIA VOCACIONAL
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABLA DE USUARIOS (Administrativos, Profesores, Estudiantes y Padres)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(60) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')),
  full_name VARCHAR(150) NOT NULL,
  normalized_name VARCHAR(150) NOT NULL,
  must_change_password BOOLEAN DEFAULT TRUE,
  phone VARCHAR(30),
  fcm_token TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_normalized_name ON users(normalized_name);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. CURSOS OFICIALES (1RO-PRIM a 6TO-SEC + Grupos Transversales de Inglés MCER)
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(25) UNIQUE NOT NULL, -- Ej: '1RO-PRIM', '4TO-SEC', 'B1-A'
  name VARCHAR(80) NOT NULL,
  level VARCHAR(20) NOT NULL CHECK (level IN ('PRIMARIA', 'SECUNDARIA', 'INGLES_CEFR')),
  academic_year INT DEFAULT 2026,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);

-- 3. MATERIAS Y CLASIFICACIÓN CURRICULAR SIGED
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_name VARCHAR(100) UNIQUE NOT NULL, -- Ej: 'QUÍMICA', 'HISTORIA DE BOLIVIA', 'LENGUA EXTRANJERA'
  siged_campo VARCHAR(100) NOT NULL,
  siged_area VARCHAR(100) NOT NULL,
  is_english BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subjects_campo ON subjects(siged_campo);
CREATE INDEX IF NOT EXISTS idx_subjects_area ON subjects(siged_area);

-- 4. PERFILES DE ESTUDIANTES
CREATE TABLE IF NOT EXISTS student_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  rude_code VARCHAR(40),
  main_course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  english_course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. VÍNCULO PADRE - ESTUDIANTE (Soporta múltiples hijos por Padre/Madre)
CREATE TABLE IF NOT EXISTS parent_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  relationship VARCHAR(30) DEFAULT 'PADRE/MADRE/TUTOR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_links_parent ON parent_student_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_links_student ON parent_student_links(student_id);

-- 6. ASIGNACIÓN DE CUADERNOS PEDAGÓGICOS (GOOGLE DRIVE <-> PROFESOR)
CREATE TABLE IF NOT EXISTS teacher_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  drive_file_name VARCHAR(150),
  drive_url TEXT,
  drive_sheet_id VARCHAR(80),
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_teacher_assignments_prof ON teacher_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_course ON teacher_assignments(course_id);

-- 7. NOTAS EN TIEMPO REAL (3 Trimestres x 4 Dimensiones Bolivianas)
CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES teacher_assignments(id) ON DELETE CASCADE,
  -- 1er Trimestre (1T)
  t1_ser NUMERIC(5,2),
  t1_saber NUMERIC(5,2),
  t1_hacer NUMERIC(5,2),
  t1_auto NUMERIC(5,2),
  t1_total NUMERIC(5,2),
  -- 2do Trimestre (2T)
  t2_ser NUMERIC(5,2),
  t2_saber NUMERIC(5,2),
  t2_hacer NUMERIC(5,2),
  t2_auto NUMERIC(5,2),
  t2_total NUMERIC(5,2),
  -- 3er Trimestre (3T)
  t3_ser NUMERIC(5,2),
  t3_saber NUMERIC(5,2),
  t3_hacer NUMERIC(5,2),
  t3_auto NUMERIC(5,2),
  t3_total NUMERIC(5,2),
  -- Calificación Final y Estado
  final_average NUMERIC(5,2),
  status VARCHAR(25) DEFAULT 'EN CURSO',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, assignment_id)
);

CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_assignment ON grades(assignment_id);

-- 8. CALENDARIO DE TAREAS Y EXÁMENES
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES teacher_assignments(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(180) NOT NULL,
  description TEXT,
  event_type VARCHAR(25) NOT NULL CHECK (event_type IN ('TAREA', 'EXAMEN', 'PROYECTO', 'INSTITUCIONAL')),
  due_date TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_course ON calendar_events(course_id);
CREATE INDEX IF NOT EXISTS idx_events_due_date ON calendar_events(due_date);

-- 9. NOTIFICACIONES Y AVISOS INSTITUCIONALES
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_role VARCHAR(20) DEFAULT 'ALL' CHECK (target_role IN ('ALL', 'PARENTS', 'STUDENTS', 'TEACHERS')),
  target_course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  title VARCHAR(180) NOT NULL,
  body TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'IMPORTANTE', 'URGENTE')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_target_role ON announcements(target_role);

-- 10. MENSAJERÍA DIRECTA (PADRE / ESTUDIANTE <-> PROFESOR)
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  student_context_id UUID REFERENCES users(id) ON DELETE SET NULL,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_context ON direct_messages(student_context_id);
