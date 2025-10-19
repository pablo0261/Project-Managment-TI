
import pandas as pd
from sqlalchemy.orm import Session
from app import models, schemas, crud
from app.database import SessionLocal, engine
from decimal import Decimal

def init_db():
    models.Base.metadata.create_all(bind=engine)

def load_initial_data(db: Session):
    # Load Programmers
    programmers_data = [
        {"name": "Alice", "seniority": "Junior", "coefficient": Decimal("1.75")},
        {"name": "Bob", "seniority": "Pleno", "coefficient": Decimal("1.00")},
        {"name": "Charlie", "seniority": "Senior", "coefficient": Decimal("0.75")},
        {"name": "Diana", "seniority": "lead", "coefficient": Decimal("0.60")},
        {"name": "Eve", "seniority": "PM", "coefficient": Decimal("1.00")} # PM tasks don't use coefficient
    ]
    for prog_data in programmers_data:
        if not db.query(models.Programmer).filter(models.Programmer.name == prog_data["name"]).first():
            programmer = schemas.ProgrammerCreate(**prog_data)
            crud.create_programmer(db, programmer)
    print("Programmers loaded.")

    # Load Tasks from Excel
    try:
        df_tasks = pd.read_excel("/app/catalogo_tarefas_expandido.xlsx", sheet_name="Catálogo de Tarefas")
        for index, row in df_tasks.iterrows():
            task_type = "development" if row["Classificação"] != "Gestão" else "management"
            task_data = {
                "name": row["Tarefa (Português)"],
                "description": row["Categoria"],
                "type": task_type,
                "base_time_hours": Decimal(str(row["Estimativa (Horas)"]))
            }
            if not db.query(models.Task).filter(models.Task.name == task_data["name"]).first():
                task = schemas.TaskCreate(**task_data)
                crud.create_task(db, task)
        print("Tasks loaded from Excel.")
    except Exception as e:
        print(f"Error loading tasks from Excel: {e}")

if __name__ == "__main__":
    init_db()
    db = SessionLocal()
    load_initial_data(db)
    db.close()

