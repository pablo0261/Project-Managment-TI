-- Tabla de Programadores
CREATE TABLE programmers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    seniority VARCHAR(50) NOT NULL, -- Junior, Mid, Senior
    coefficient DECIMAL(3, 2) NOT NULL -- Coeficiente para cálculo de tiempo
);

-- Tabla de Tareas
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- 'development' o 'management'
    base_time_hours DECIMAL(5, 2) NOT NULL -- Tiempo base en horas
);

-- Tabla de Proyectos
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    responsible_id INTEGER REFERENCES programmers(id) ON DELETE SET NULL
);

-- Tabla de Tareas de Proyecto (para la relación muchos a muchos entre Proyectos y Tareas)
CREATE TABLE project_tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    programmer_id INTEGER REFERENCES programmers(id) ON DELETE SET NULL, -- Puede ser nulo si no está asignado
    assigned_time_hours DECIMAL(5, 2), -- Tiempo calculado después de aplicar coeficiente
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed
    stage_id INTEGER NOT NULL REFERENCES stages(id) ON DELETE CASCADE, -- Añade relación con Stage
    UNIQUE(project_id, task_id) -- Una tarea solo puede estar una vez en un proyecto
);

-- Tabla de Etapas de proyecto (para la relación de muchas a una entre Stage y Proyectos)
CREATE TABLE stages (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL, -- Para definir el orden de las etapas
    UNIQUE (project_id, name) -- Una etapa con el mismo nombre no puede existir en el mismo proyecto
);
