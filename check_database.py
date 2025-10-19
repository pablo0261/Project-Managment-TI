# check_database.py
from app.database import engine
from sqlalchemy import text

def check_database():
    try:
        with engine.connect() as conn:
            # Verificar tablas
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """))
            tables = [row[0] for row in result]
            print("📋 Tablas en la base de datos:", tables)
            
            # Verificar estructura de projects
            if 'projects' in tables:
                result = conn.execute(text("""
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns 
                    WHERE table_name = 'projects'
                """))
                print("📋 Columnas de 'projects':")
                for row in result:
                    print(f"  - {row[0]} ({row[1]}, nullable: {row[2]})")
                    
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_database()