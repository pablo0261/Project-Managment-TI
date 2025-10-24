from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import os 
from fastapi.middleware.cors import CORSMiddleware 
import traceback
import logging
from sqlalchemy import text

# Configurar logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

from . import crud, schemas, models
from .database import engine, get_db

from .config import engine, get_db  # ← Cambiado de database a config

# Crea las tablas automáticamente si no existen
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Project Management API",
    description="API para la gestión de proyectos, tareas y programadores.",
    version="1.0.0",
)

# Configuración CORS desde variables de entorno
#origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

# Configuración CORS 
# origins = [
#     "http://localhost:5173",
#     "http://127.0.0.1:5173",
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
# ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Root
@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the Project Management API"}

# Health check con info de BD
@app.get("/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    try:
        # Test simple de BD
        from sqlalchemy import text
        result = db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy", 
        "database": db_status,
        "message": "API is running"
    }

# -------------------------
# PROGRAMMERS ENDPOINTS
# -------------------------
@app.post("/api/programmers/", response_model=schemas.Programmer, tags=["Programmers"])
def create_programmer(programmer: schemas.ProgrammerCreate, db: Session = Depends(get_db)):
    return crud.create_programmer(db=db, programmer=programmer)


@app.get("/api/programmers/", response_model=List[schemas.Programmer], tags=["Programmers"])
def read_programmers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_programmers(db, skip=skip, limit=limit)


@app.get("/api/programmers/{programmer_id}", response_model=schemas.Programmer, tags=["Programmers"])
def read_programmer(programmer_id: int, db: Session = Depends(get_db)):
    db_programmer = crud.get_programmer(db, programmer_id=programmer_id)
    if db_programmer is None:
        raise HTTPException(status_code=404, detail="Programmer not found")
    return db_programmer


@app.put("/api/programmers/{programmer_id}", response_model=schemas.Programmer, tags=["Programmers"])
def update_programmer(programmer_id: int, programmer: schemas.ProgrammerCreate, db: Session = Depends(get_db)):
    db_programmer = crud.update_programmer(db, programmer_id, programmer)
    if db_programmer is None:
        raise HTTPException(status_code=404, detail="Programmer not found")
    return db_programmer


@app.delete("/api/programmers/{programmer_id}", tags=["Programmers"])
def delete_programmer(programmer_id: int, db: Session = Depends(get_db)):
    success = crud.delete_programmer(db, programmer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Programmer not found")
    return {"message": "Programmer deleted successfully"}


# -------------------------
# TASKS ENDPOINTS
# -------------------------
@app.post("/api/tasks/", response_model=schemas.Task, tags=["Tasks"])
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    return crud.create_task(db=db, task=task)


@app.get("/api/tasks/", response_model=List[schemas.Task], tags=["Tasks"])
def read_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_tasks(db, skip=skip, limit=limit)


@app.get("/api/tasks/{task_id}", response_model=schemas.Task, tags=["Tasks"])
def read_task(task_id: int, db: Session = Depends(get_db)):
    db_task = crud.get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task


@app.put("/api/tasks/{task_id}", response_model=schemas.Task, tags=["Tasks"])
def update_task(task_id: int, task: schemas.TaskCreate, db: Session = Depends(get_db)):
    db_task = crud.update_task(db, task_id, task)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task


@app.delete("/api/tasks/{task_id}", tags=["Tasks"])
def delete_task(task_id: int, db: Session = Depends(get_db)):
    success = crud.delete_task(db, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}


# -------------------------
# PROJECTS ENDPOINTS
# -------------------------
@app.get("/api/projects/", response_model=List[schemas.Project], tags=["Projects"])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        logger.info("Ejecutando get_projects")
        projects = crud.get_projects(db, skip=skip, limit=limit)
        logger.info(f"Proyectos obtenidos: {len(projects)}")
        return projects
    except Exception as e:
        logger.error(f"Error en /api/projects/: {str(e)}")
        logger.error(traceback.format_exc())
        # Devuelve una lista vacía temporalmente para evitar el error 500
        return []


@app.post("/api/projects/", response_model=schemas.Project, tags=["Projects"])
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_project(db=db, project=project)
    except Exception as e:
        logger.error(f"Error creando proyecto: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno al crear proyecto: {str(e)}")


@app.get("/api/projects/{project_id}", response_model=schemas.ProjectDetail, tags=["Projects"])
def read_project(project_id: int, db: Session = Depends(get_db)):
    try:
        logger.info(f"🔍 Buscando proyecto ID: {project_id}")
        
        # Log para verificar la sesión de BD
        try:
            db.execute(text("SELECT 1"))
            logger.info("✅ Conexión a BD activa")
        except Exception as e:
            logger.error(f"❌ Error de conexión a BD: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")
        
        db_project = crud.get_project_with_details(db, project_id=project_id)
        logger.info(f"📊 Resultado de get_project_with_details: {db_project is not None}")
        
        if db_project is None:
            logger.warning(f"⚠️ Proyecto {project_id} no encontrado")
            raise HTTPException(status_code=404, detail="Project not found")
        
        logger.info(f"✅ Proyecto {project_id} encontrado, retornando datos")
        return db_project
        
    except HTTPException:
        # Re-lanzar excepciones HTTP directamente
        raise
    except Exception as e:
        logger.error(f"💥 Error crítico en /api/projects/{project_id}: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/debug/projects-simple", tags=["Debug"])
def debug_projects_simple(db: Session = Depends(get_db)):
    try:
        # Consulta MUY simple
        from sqlalchemy import text
        result = db.execute(text("SELECT id, name FROM projects LIMIT 10"))
        projects = [{"id": row[0], "name": row[1]} for row in result]
        return {
            "status": "success",
            "projects": projects,
            "count": len(projects)
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }


@app.put("/api/projects/{project_id}", response_model=schemas.Project, tags=["Projects"])
def update_project(project_id: int, project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    db_project = crud.update_project(db, project_id, project)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project


@app.delete("/api/projects/{project_id}", tags=["Projects"])
def delete_project(project_id: int, db: Session = Depends(get_db)):
    success = crud.delete_project(db, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}


# -------------------------
# STAGES ENDPOINTS (Nuevos - para gestionar etapas)
# -------------------------
@app.post("/api/stages/", response_model=schemas.Stage, tags=["Stages"])
def create_stage(stage: schemas.StageCreate, db: Session = Depends(get_db)):
    return crud.create_stage(db=db, stage=stage)


@app.get("/api/stages/", response_model=List[schemas.Stage], tags=["Stages"])
def read_stages(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_stages(db, skip=skip, limit=limit)


@app.get("/api/stages/{stage_id}", response_model=schemas.Stage, tags=["Stages"])
def read_stage(stage_id: int, db: Session = Depends(get_db)):
    db_stage = crud.get_stage(db, stage_id=stage_id)
    if db_stage is None:
        raise HTTPException(status_code=404, detail="Stage not found")
    return db_stage


@app.put("/api/stages/{stage_id}", response_model=schemas.Stage, tags=["Stages"])
def update_stage(stage_id: int, stage: schemas.StageUpdate, db: Session = Depends(get_db)):
    db_stage = crud.update_stage(db, stage_id, stage)
    if db_stage is None:
        raise HTTPException(status_code=404, detail="Stage not found")
    return db_stage


@app.delete("/api/stages/{stage_id}", tags=["Stages"])
def delete_stage(stage_id: int, db: Session = Depends(get_db)):
    success = crud.delete_stage(db, stage_id)
    if not success:
        raise HTTPException(status_code=404, detail="Stage not found")
    return {"message": "Stage deleted successfully"}

# -------------------------
# STAGES ENDPOINTS
# -------------------------
# @app.post("/api/stages/", response_model=schemas.Stage, tags=["Stages"])
# def create_stage(stage: schemas.StageCreate, db: Session = Depends(get_db)):
#     return crud.create_stage(db=db, stage=stage)

# @app.get("/api/stages/", response_model=List[schemas.Stage], tags=["Stages"])
# def read_stages(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
#     return crud.get_stages(db, skip=skip, limit=limit)

# @app.get("/api/stages/{stage_id}", response_model=schemas.Stage, tags=["Stages"])
# def read_stage(stage_id: int, db: Session = Depends(get_db)):
#     db_stage = crud.get_stage(db, stage_id=stage_id)
#     if db_stage is None:
#         raise HTTPException(status_code=404, detail="Stage not found")
#     return db_stage

# @app.put("/api/stages/{stage_id}", response_model=schemas.Stage, tags=["Stages"])
# def update_stage(stage_id: int, stage: schemas.StageUpdate, db: Session = Depends(get_db)):
#     db_stage = crud.update_stage(db, stage_id, stage)
#     if db_stage is None:
#         raise HTTPException(status_code=404, detail="Stage not found")
#     return db_stage

# @app.delete("/api/stages/{stage_id}", tags=["Stages"])
# def delete_stage(stage_id: int, db: Session = Depends(get_db)):
#     success = crud.delete_stage(db, stage_id)
#     if not success:
#         raise HTTPException(status_code=404, detail="Stage not found")
#     return {"message": "Stage deleted successfully"}

# -------------------------
# PROJECT TASKS ENDPOINTS
# -------------------------
@app.post("/api/project-tasks/", response_model=schemas.ProjectTask, tags=["Project Tasks"])
def create_project_task(project_task: schemas.ProjectTaskCreate, db: Session = Depends(get_db)):
    return crud.create_project_task(db=db, project_task=project_task)


@app.put("/api/project-tasks/{project_task_id}", response_model=schemas.ProjectTask, tags=["Project Tasks"])
def update_project_task(project_task_id: int, project_task: schemas.ProjectTaskUpdate, db: Session = Depends(get_db)):
    db_project_task = crud.update_project_task(db, project_task_id, project_task)
    if db_project_task is None:
        raise HTTPException(status_code=404, detail="Project Task not found")
    return db_project_task


@app.delete("/api/project-tasks/{project_task_id}", tags=["Project Tasks"])
def delete_project_task(project_task_id: int, db: Session = Depends(get_db)):
    success = crud.delete_project_task(db, project_task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project Task not found")
    return {"message": "Project Task deleted successfully"}


# Health check endpoint
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy", 
        "database_url": os.getenv("DATABASE_URL", "Not configured")[:50] + "..." if os.getenv("DATABASE_URL") else "Not configured"
    }


# Si estamos en desarrollo, mostrar info de configuración
if os.getenv("DEBUG", "False").lower() == "true":
    @app.get("/config-info", tags=["Development"])
    def config_info():
        return {
            "allowed_origins": origins,
            "database_url": os.getenv("DATABASE_URL", "Not set"),
            "debug_mode": os.getenv("DEBUG", "False")
        }
    
    # Endpoint de diagnóstico más detallado
@app.get("/api/debug/project/{project_id}", tags=["Debug"])
def debug_project_detail(project_id: int, db: Session = Depends(get_db)):
    try:
        logger.info(f"Intentando obtener proyecto {project_id}")
        
        # 1. Verificar si la tabla existe
        try:
            result = db.execute(text("SELECT COUNT(*) FROM projects"))
            table_exists = True
            project_count = result.scalar()
            logger.info(f"Tabla projects existe, count: {project_count}")
        except Exception as e:
            logger.error(f"Error al acceder a tabla projects: {str(e)}")
            table_exists = False
        
        # 2. Verificar si el proyecto específico existe
        try:
            result = db.execute(text("SELECT * FROM projects WHERE id = :id"), {"id": project_id})
            project_raw = result.first()
            if project_raw:
                logger.info(f"Proyecto {project_id} encontrado en BD: {dict(project_raw)}")
            else:
                logger.warning(f"Proyecto {project_id} NO encontrado en BD")
        except Exception as e:
            logger.error(f"Error al buscar proyecto {project_id}: {str(e)}")
        
        # 3. Probar la función CRUD directamente
        try:
            from . import crud
            project_crud = crud.get_project_with_details(db, project_id)
            if project_crud:
                logger.info(f"CRUD devolvió proyecto: {project_crud}")
            else:
                logger.warning("CRUD devolvió None")
        except Exception as e:
            logger.error(f"Error en CRUD: {str(e)}")
            logger.error(traceback.format_exc())
            
        return {
            "table_exists": table_exists,
            "project_found": project_raw is not None,
            "crud_success": project_crud is not None if 'project_crud' in locals() else False,
            "project_raw": dict(project_raw) if project_raw else None
        }
        
    except Exception as e:
        logger.error(f"Error general en debug: {str(e)}")
        return {"error": str(e), "traceback": traceback.format_exc()}
    
@app.get("/api/debug/stages-setup", tags=["Debug"])
def debug_stages_setup(db: Session = Depends(get_db)):
    try:
        # Verificar tabla stages
        from sqlalchemy import text
        result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='stages'"))
        table_exists = result.first() is not None
        
        # Verificar estructura de la tabla
        if table_exists:
            result = db.execute(text("PRAGMA table_info(stages)"))
            columns = [dict(row) for row in result]
        else:
            columns = []
            
        # Verificar proyectos existentes
        result = db.execute(text("SELECT id, name FROM projects"))
        projects = [{"id": row[0], "name": row[1]} for row in result]
        
        return {
            "stages_table_exists": table_exists,
            "stages_columns": columns,
            "available_projects": projects
        }
    except Exception as e:
        return {"error": str(e), "traceback": traceback.format_exc()}
    