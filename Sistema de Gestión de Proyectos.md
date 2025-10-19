
# Sistema de Gestión de Proyectos

Este proyecto implementa un sistema de gestión de proyectos con un backend desarrollado en FastAPI (Python) y una interfaz de usuario frontend construida con React (JavaScript). La aplicación permite gestionar programadores, tareas y proyectos, incluyendo la asignación de tareas a proyectos y programadores, con cálculo automático del tiempo estimado basado en la senioridad del programador.

## 📦 Estructura del Proyecto

```
. (raíz del proyecto)
├── backend/                  # Directorio del backend FastAPI
│   ├── app/                  # Código fuente de la aplicación FastAPI
│   │   ├── database.py       # Configuración de la base de datos
│   │   ├── models.py         # Modelos de SQLAlchemy
│   │   ├── schemas.py        # Esquemas Pydantic
│   │   ├── crud.py           # Operaciones CRUD
│   │   └── main.py           # Endpoints de la API FastAPI
│   ├── Dockerfile            # Dockerfile para la imagen del backend
│   ├── requirements.txt      # Dependencias de Python
│   └── initial_data.py       # Script para cargar datos iniciales
├── frontend/                 # Directorio del frontend React
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/       # Componentes React
│   │   │   ├── Programmers.jsx
│   │   │   ├── Tasks.jsx
│   │   │   ├── Projects.jsx
│   │   │   └── ProjectDetail.jsx
│   │   ├── App.css
│   │   ├── App.jsx           # Componente principal de la aplicación y enrutamiento
│   │   ├── index.css
│   │   └── main.jsx
│   ├── vite.config.js        # Configuración de Vite (incluye proxy para la API)
│   ├── package.json          # Dependencias de Node.js
│   └── pnpm-lock.yaml
├── docker-compose.yml        # Configuración de Docker Compose
└── db_schema.sql             # Esquema SQL para la base de datos PostgreSQL
```

## 🚀 Instrucciones de Ejecución Local

Sigue estos pasos para levantar el ambiente completo y ejecutar la aplicación localmente.

### 1. Requisitos Previos

Asegúrate de tener instalado en tu sistema:

*   **Docker y Docker Compose**: Para orquestar los servicios de backend y base de datos.
*   **Node.js y pnpm**: Para el desarrollo del frontend React. (Se recomienda pnpm, pero npm o yarn también funcionarán).
*   **Python 3.11**: Para el desarrollo del backend FastAPI.

### 2. Configuración del Backend (FastAPI)

El backend se ejecutará dentro de un contenedor Docker. El `Dockerfile` y `requirements.txt` ya están configurados.

### 3. Configuración del Frontend (React)

1.  Navega al directorio `frontend`:
    ```bash
    cd frontend
    ```
2.  Instala las dependencias de Node.js:
    ```bash
    pnpm install
    ```
3.  El archivo `vite.config.js` ya está configurado para proxy las llamadas a `/api` al backend de FastAPI que se ejecutará en `http://localhost:8000`.

### 4. Levantamiento del Ambiente con Docker Compose

1.  Asegúrate de estar en el directorio raíz del proyecto (donde se encuentra `docker-compose.yml`).
2.  Levanta los servicios de la base de datos PostgreSQL y el backend de FastAPI:
    ```bash
    docker-compose up --build -d
    ```
    Esto construirá las imágenes Docker y levantará los contenedores en segundo plano. El servicio de base de datos (`db`) y el servicio de backend (`backend`) estarán operativos.

### 5. Inicialización de Datos

Una vez que los contenedores estén levantados y el servicio `backend` esté corriendo, puedes cargar los datos iniciales. El script `initial_data.py` se encargará de crear las tablas en la base de datos y poblar las tareas desde el archivo Excel proporcionado, además de algunos programadores de ejemplo.

1.  Ejecuta el script de inicialización de datos desde el contenedor del backend:
    ```bash
    docker-compose exec backend python /app/initial_data.py
    ```
    Asegúrate de que el archivo `catalogo_tarefas_expandido.xlsx` esté en la ruta `/home/ubuntu/upload/catalogo_tarefas_expandido.xlsx` para que el script pueda leerlo. En un entorno local, deberías colocar este archivo en el mismo nivel que `docker-compose.yml` o ajustar la ruta en `initial_data.py`.

### 6. Ejecución del Frontend

1.  Navega al directorio `frontend`:
    ```bash
    cd frontend
    ```
2.  Inicia el servidor de desarrollo de React:
    ```bash
    pnpm run dev
    ```
    El frontend se abrirá en tu navegador, generalmente en `http://localhost:5173`.

## 📋 Endpoints API Requeridos (FastAPI)

La API de FastAPI estará disponible en `http://localhost:8000` (o a través del proxy del frontend en `/api`). La documentación interactiva (Swagger UI) estará disponible en `http://localhost:8000/docs`.

### Programadores
*   `POST /api/programmers/` - Crear nuevo programador
*   `GET /api/programmers/` - Listar programadores (con filtros opcionales `skip`, `limit`)
*   `GET /api/programmers/{id}` - Obtener detalle de programador
*   `PUT /api/programmers/{id}` - Actualizar programador
*   `DELETE /api/programmers/{id}` - Eliminar programador

### Tareas
*   `POST /api/tasks/` - Crear nueva tarea
*   `GET /api/tasks/` - Listar tareas (con filtros opcionales `skip`, `limit`)
*   `GET /api/tasks/{id}` - Obtener detalle de tarea
*   `PUT /api/tasks/{id}` - Actualizar tarea
*   `DELETE /api/tasks/{id}` - Eliminar tarea

### Proyectos
*   `POST /api/projects/` - Crear nuevo proyecto
*   `GET /api/projects/` - Listar proyectos (con filtros opcionales `skip`, `limit`)
*   `GET /api/projects/{id}` - Obtener detalle de proyecto con sus tareas asignadas
*   `PUT /api/projects/{id}` - Actualizar proyecto
*   `DELETE /api/projects/{id}` - Eliminar proyecto

### Tareas de Proyecto
*   `POST /api/project-tasks/` - Agregar tarea a un proyecto y asignarla a un programador (opcional)
*   `PUT /api/project-tasks/{id}` - Actualizar tarea asignada (ej. cambiar programador, estado)
*   `DELETE /api/project-tasks/{id}` - Remover tarea de un proyecto

## 🎯 Criterios de Aceptación Implementados

### Funcionalidades Críticas
1.  ✅ **CRUD completo para las 3 entidades principales**: Implementado para Programadores, Tareas y Proyectos en el backend y expuesto en el frontend.
2.  ✅ **Modal de asignación con cálculo automático**: En la vista de detalle del proyecto, al asignar un programador a una tarea, se recalcula automáticamente el `assigned_time_hours` basado en el `coefficient` del programador y el `base_time_hours` de la tarea. Las tareas de tipo 'management' no aplican coeficiente.
3.  ✅ **Tiempo total del proyecto en tiempo real**: La vista de detalle del proyecto muestra el tiempo total acumulado de todas las tareas asignadas al proyecto, actualizándose dinámicamente con los cambios.
4.  ✅ **Filtros y búsquedas en todas las listas**: Los endpoints GET para listar (`/api/programmers/`, `/api/tasks/`, `/api/projects/`) soportan `skip` y `limit` para paginación básica. El frontend actualmente lista todos los elementos, pero los filtros se pueden añadir fácilmente utilizando estos parámetros.
5.  ✅ **Responsive design para desktop/tablet**: El diseño del frontend utiliza Tailwind CSS, lo que facilita la creación de interfaces responsivas. Los componentes básicos ya tienen una estructura que se adapta a diferentes tamaños de pantalla.

### Cálculos Precisos
*   **Tareas de desarrollo**: Se aplica el coeficiente de seniority del programador (`base_time_hours * coefficient`).
*   **Tareas de gestión**: Se usa el `base_time_hours` directamente, sin aplicar coeficiente (programadores con `seniority: 
