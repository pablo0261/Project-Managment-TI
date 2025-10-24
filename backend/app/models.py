from sqlalchemy import Column, Integer, String, DECIMAL, Date, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Programmer(Base):
    __tablename__ = "programmers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    seniority = Column(String)
    coefficient = Column(DECIMAL(3, 2))
    
    # Relación: proyectos donde este programador es responsable
    responsible_projects = relationship(
        "Project", 
        back_populates="responsible",
        foreign_keys='[Project.responsible_id]'
    )
    
    # Relación: tareas asignadas a este programador
    project_tasks = relationship("ProjectTask", back_populates="programmer")


class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    type = Column(String)
    base_time_hours = Column(DECIMAL(5, 2))
    
    project_tasks = relationship("ProjectTask", back_populates="task")


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)
    responsible_id = Column(Integer, ForeignKey("programmers.id"), nullable=True)
    
    # Relación al programador responsable
    responsible = relationship(
        "Programmer", 
        back_populates="responsible_projects",
        foreign_keys='[Project.responsible_id]'
    )
    
    # Relación a las etapas del proyecto
    stages = relationship(
        "Stage", 
        back_populates="project", 
        order_by="Stage.order_index",
        cascade="all, delete-orphan"
    )


class Stage(Base):
    __tablename__ = "stages"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    order_index = Column(Integer, nullable=False, default=0)
    
    project = relationship("Project", back_populates="stages")
    project_tasks = relationship(
        "ProjectTask", 
        back_populates="stage",
        cascade="all, delete-orphan"
    )


class ProjectTask(Base):
    __tablename__ = "project_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    stage_id = Column(Integer, ForeignKey("stages.id"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    programmer_id = Column(Integer, ForeignKey("programmers.id"), nullable=True)
    assigned_time_hours = Column(DECIMAL(5, 2), nullable=True)
    status = Column(String, default="pending")
    
    stage = relationship("Stage", back_populates="project_tasks")
    task = relationship("Task", back_populates="project_tasks")
    programmer = relationship("Programmer", back_populates="project_tasks")