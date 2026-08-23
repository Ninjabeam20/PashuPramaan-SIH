import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if "?schema=" in SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.split("?schema=")[0]

engine = create_engine(SQLALCHEMY_DATABASE_URL, isolation_level="AUTOCOMMIT")
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TYPE dispatch_status_enum ADD VALUE IF NOT EXISTS 'LAB_PENDING';"))
        print("Enum altered successfully.")
    except Exception as e:
        print("Error:", e)
