from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from decimal import Decimal

# ========== PROGRAMMER SCHEMAS ==========
class ProgrammerBase(BaseModel):
    name: str
    seniority: str
    coefficient: Decimal

class ProgrammerCreate(ProgrammerBase):
    pass

class Programmer(ProgrammerBase):
    id: int
    project_count: int = 0

    class Config:
        from_attributes = True

# ========== TASK SCHEMAS ==========
class TaskBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: str
    base_time_hours: Decimal

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int

    class Config:
        from_attributes = True

# ========== PROJECT TASK SCHEMAS ==========
class ProjectTaskBase(BaseModel):
    stage_id: int
    task_id: int
    programmer_id: Optional[int] = None
    status: str = "pending"

class ProjectTaskCreate(ProjectTaskBase):
    pass

class ProjectTaskUpdate(BaseModel):
    programmer_id: Optional[int] = None
    status: Optional[str] = None

class ProjectTask(ProjectTaskBase):
    id: int
    task: Task
    programmer: Optional[Programmer] = None
    calculated_total_hours: Optional[Decimal] = None

    class Config:
        from_attributes = True

# ========== STAGE SCHEMAS ==========
class StageBase(BaseModel):
    project_id: int
    name: str
    description: Optional[str] = None
    order_index: int = 0

class StageCreate(StageBase):
    project_tasks: List["ProjectTaskCreate"] = []

class StageUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None

class Stage(StageBase):
    id: int
    project_tasks: List[ProjectTask] = []

    class Config:
        from_attributes = True

# ========== PROJECT SCHEMAS ==========
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    responsible_id: Optional[int] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectCreateWithStages(ProjectCreate):
    stages: List[StageCreate] = []

class Project(ProjectBase):
    id: int
    responsible: Optional[Programmer] = None

    class Config:
        from_attributes = True

class ProjectDetail(Project):
    stages: List[Stage] = []
    total_estimated_hours: Optional[Decimal] = None

    class Config:
        from_attributes = True