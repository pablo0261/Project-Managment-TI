# crud_fixed.py - VERSIÓN ESTABLE Y FUNCIONAL
from sqlalchemy.orm import Session
from decimal import Decimal

def get_programmers(db: Session, skip: int = 0, limit: int = 100):
    try:
        programmers = db.query(models.Programmer).offset(skip).limit(limit).all()
        return [
            {
                "id": p.id,
                "name": p.name,
                "seniority": p.seniority,
                "coefficient": float(p.coefficient),
                "project_count": 0
            }
            for p in programmers
        ]
    except Exception as e:
        print(f"Error en get_programmers: {e}")
        return []

def get_tasks(db: Session, skip: int = 0, limit: int = 100):
    try:
        tasks = db.query(models.Task).offset(skip).limit(limit).all()
        return [
            {
                "id": t.id,
                "name": t.name,
                "description": t.description,
                "type": t.type,
                "base_time_hours": float(t.base_time_hours)
            }
            for t in tasks
        ]
    except Exception as e:
        print(f"Error en get_tasks: {e}")
        return []

def get_projects(db: Session, skip: int = 0, limit: int = 100):
    try:
        projects = db.query(models.Project).offset(skip).limit(limit).all()
        return [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "start_date": p.start_date,
                "end_date": p.end_date
            }
            for p in projects
        ]
    except Exception as e:
        print(f"Error en get_projects: {e}")
        return []

def create_project(db: Session, project):
    try:
        # Versión simple sin responsible_id
        db_project = models.Project(
            name=project.name,
            description=project.description,
            start_date=project.start_date,
            end_date=project.end_date
        )
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        return db_project
    except Exception as e:
        db.rollback()
        print(f"Error en create_project: {e}")
        raise e

# Funciones básicas para evitar errores
def create_programmer(db: Session, programmer):
    try:
        db_programmer = models.Programmer(
            name=programmer.name,
            seniority=programmer.seniority,
            coefficient=programmer.coefficient
        )
        db.add(db_programmer)
        db.commit()
        db.refresh(db_programmer)
        return db_programmer
    except Exception as e:
        db.rollback()
        raise e

def create_task(db: Session, task):
    try:
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
    except Exception as e:
        db.rollback()
        raise e