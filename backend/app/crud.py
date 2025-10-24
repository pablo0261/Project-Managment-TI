from sqlalchemy.orm import Session, joinedload
from decimal import Decimal
from app import schemas, models

# ========== PROGRAMMERS ==========
def get_programmers(db: Session, skip: int = 0, limit: int = 100):
    programmers = db.query(models.Programmer).offset(skip).limit(limit).all()
    result = []
    for p in programmers:
        project_count = db.query(models.Project).filter(
            models.Project.responsible_id == p.id
        ).count()
        
        result.append({
            'id': p.id,
            'name': p.name,
            'seniority': p.seniority,
            'coefficient': p.coefficient,
            'project_count': project_count
        })
    return result

def get_programmer(db: Session, programmer_id: int):
    programmer = db.query(models.Programmer).filter(
        models.Programmer.id == programmer_id
    ).first()
    if programmer:
        project_count = db.query(models.Project).filter(
            models.Project.responsible_id == programmer_id
        ).count()
        return {
            'id': programmer.id,
            'name': programmer.name,
            'seniority': programmer.seniority,
            'coefficient': programmer.coefficient,
            'project_count': project_count
        }
    return None

def create_programmer(db: Session, programmer: schemas.ProgrammerCreate):
    db_programmer = models.Programmer(
        name=programmer.name, 
        seniority=programmer.seniority, 
        coefficient=programmer.coefficient
    )
    db.add(db_programmer)
    db.commit()
    db.refresh(db_programmer)
    return db_programmer

def update_programmer(db: Session, programmer_id: int, programmer: schemas.ProgrammerCreate):
    db_programmer = db.query(models.Programmer).filter(
        models.Programmer.id == programmer_id
    ).first()
    if db_programmer:
        db_programmer.name = programmer.name
        db_programmer.seniority = programmer.seniority
        db_programmer.coefficient = programmer.coefficient
        db.commit()
        db.refresh(db_programmer)
    return db_programmer

def delete_programmer(db: Session, programmer_id: int):
    try:
        db_programmer = db.query(models.Programmer).filter(
            models.Programmer.id == programmer_id
        ).first()
        
        if db_programmer:
            # Verificar si el programador está asignado a algún proyecto
            projects_count = db.query(models.Project).filter(
                models.Project.responsible_id == programmer_id
            ).count()
            
            # Verificar si el programador tiene tareas asignadas
            tasks_count = db.query(models.ProjectTask).filter(
                models.ProjectTask.programmer_id == programmer_id
            ).count()
            
            if projects_count > 0 or tasks_count > 0:
                # No eliminar, retornar False indicando que no se puede eliminar
                return False
                
            # Si no tiene dependencias, proceder con la eliminación
            db.delete(db_programmer)
            db.commit()
            return True
        return False
        
    except Exception as e:
        db.rollback()
        print(f"Error eliminando programador: {str(e)}")
        return False

# ========== TASKS ==========
def get_task(db: Session, task_id: int):
    return db.query(models.Task).filter(models.Task.id == task_id).first()

def get_tasks(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Task).offset(skip).limit(limit).all()

def create_task(db: Session, task: schemas.TaskCreate):
    db_task = models.Task(
        name=task.name, 
        description=task.description, 
        type=task.type, 
        base_time_hours=task.base_time_hours
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, task: schemas.TaskCreate):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task:
        db_task.name = task.name
        db_task.description = task.description
        db_task.type = task.type
        db_task.base_time_hours = task.base_time_hours
        db.commit()
        db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task:
        db.delete(db_task)
        db.commit()
        return True
    return False

# ========== PROJECTS ==========
def get_projects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Project).options(
        joinedload(models.Project.responsible)
    ).offset(skip).limit(limit).all()

def create_project_with_stages(db: Session, project_data: schemas.ProjectCreateWithStages):
    db_project = models.Project(
        name=project_data.name, 
        description=project_data.description, 
        start_date=project_data.start_date, 
        end_date=project_data.end_date,
        responsible_id=project_data.responsible_id
    )
    db.add(db_project)
    db.flush()  # Flush para obtener el ID del proyecto antes de añadir las etapas
    db.refresh(db_project)

    for stage_data in project_data.stages:
        db_stage = models.Stage(
            project_id=db_project.id,
            name=stage_data.name,
            description=stage_data.description,
            order_index=stage_data.order_index
        )
        db.add(db_stage)
        db.flush()  # Flush para obtener el ID de la etapa
        db.refresh(db_stage)

        for project_task_data in stage_data.project_tasks:
            db_project_task = models.ProjectTask(
                stage_id=db_stage.id,
                task_id=project_task_data.task_id,
                programmer_id=project_task_data.programmer_id,
                status=project_task_data.status
            )
            db.add(db_project_task)

    db.commit()
    db.refresh(db_project)
    return db_project

def create_project(db: Session, project: schemas.ProjectCreate):
    db_project = models.Project(
        name=project.name, 
        description=project.description, 
        start_date=project.start_date, 
        end_date=project.end_date,
        responsible_id=project.responsible_id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def update_project(db: Session, project_id: int, project: schemas.ProjectCreate):
    db_project = db.query(models.Project).filter(
        models.Project.id == project_id
    ).first()
    if db_project:
        db_project.name = project.name
        db_project.description = project.description
        db_project.start_date = project.start_date
        db_project.end_date = project.end_date
        db_project.responsible_id = project.responsible_id
        db.commit()
        db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: int):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if db_project:
        # SQLAlchemy con cascade="all, delete-orphan" en las relaciones
        # debería manejar la eliminación en cascada automáticamente.
        # Solo necesitamos eliminar el proyecto principal.
        db.delete(db_project)
        db.commit()
        return True
    return False






def get_project_with_details(db: Session, project_id: int):
    project = db.query(models.Project).options(
        joinedload(models.Project.responsible),
        joinedload(models.Project.stages).joinedload(models.Stage.project_tasks).joinedload(models.ProjectTask.task),
        joinedload(models.Project.stages).joinedload(models.Stage.project_tasks).joinedload(models.ProjectTask.programmer)
    ).filter(models.Project.id == project_id).first()
    
    if project:
        total_hours = Decimal("0.00")
        for stage in project.stages:
            for pt in stage.project_tasks:
                if pt.task and pt.programmer:
                    calculated = Decimal(str(pt.task.base_time_hours)) * Decimal(str(pt.programmer.coefficient))
                    pt.calculated_total_hours = calculated
                    total_hours += calculated
                elif pt.task:
                    pt.calculated_total_hours = Decimal(str(pt.task.base_time_hours))
                    total_hours += Decimal(str(pt.task.base_time_hours))
        
        project.total_estimated_hours = total_hours
    
    return project

# ========== STAGES ==========
def create_stage(db: Session, stage: schemas.StageCreate):
    db_stage = models.Stage(
        project_id=stage.project_id, 
        name=stage.name, 
        description=stage.description, 
        order_index=stage.order_index
    )
    db.add(db_stage)
    db.commit()
    db.refresh(db_stage)
    return db_stage


    
def get_stage(db: Session, stage_id: int):
    return db.query(models.Stage).filter(models.Stage.id == stage_id).first()

def get_stages(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Stage).offset(skip).limit(limit).all()

def update_stage(db: Session, stage_id: int, stage: schemas.StageUpdate):
    db_stage = db.query(models.Stage).filter(models.Stage.id == stage_id).first()
    if db_stage:
        db_stage.name = stage.name
        db_stage.description = stage.description
        db_stage.order_index = stage.order_index
        db.commit()
        db.refresh(db_stage)
    return db_stage

def delete_stage(db: Session, stage_id: int):
    db_stage = db.query(models.Stage).filter(models.Stage.id == stage_id).first()
    if db_stage:
        db.delete(db_stage)
        db.commit()
        return True
    return False

# ========== PROJECT TASKS ==========
def create_project_task(db: Session, project_task: schemas.ProjectTaskCreate):
    db_project_task = models.ProjectTask(
        stage_id=project_task.stage_id, 
        task_id=project_task.task_id, 
        programmer_id=project_task.programmer_id, 
        status=project_task.status
    )
    db.add(db_project_task)
    db.commit()
    db.refresh(db_project_task)
    return db_project_task

def get_project_task(db: Session, project_task_id: int):
    return db.query(models.ProjectTask).filter(
        models.ProjectTask.id == project_task_id
    ).first()

def update_project_task(db: Session, project_task_id: int, project_task_update: schemas.ProjectTaskUpdate):
    db_project_task = db.query(models.ProjectTask).filter(
        models.ProjectTask.id == project_task_id
    ).first()
    if db_project_task:
        if project_task_update.programmer_id is not None:
            db_project_task.programmer_id = project_task_update.programmer_id
        if project_task_update.status is not None:
            db_project_task.status = project_task_update.status
        db.commit()
        db.refresh(db_project_task)
    return db_project_task

def delete_project_task(db: Session, project_task_id: int):
    db_project_task = db.query(models.ProjectTask).filter(
        models.ProjectTask.id == project_task_id
    ).first()
    if db_project_task:
        db.delete(db_project_task)
        db.commit()
        return True
    return False

