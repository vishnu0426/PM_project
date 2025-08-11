#!/usr/bin/env python3
"""
Database setup script for Agno WorkSphere
Creates database if it doesn't exist and runs migrations
"""
import asyncio
import asyncpg
import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
import subprocess

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

async def create_database_if_not_exists():
    """Create the database if it doesn't exist"""
    try:
        # Connect to postgres database to create our database
        conn = await asyncpg.connect(
            host='localhost',
            port=5432,
            user='postgres',
            password='admin',
            database='postgres'
        )
        
        # Check if database exists
        result = await conn.fetchval(
            "SELECT 1 FROM pg_database WHERE datname = 'agno_worksphere'"
        )
        
        if not result:
            print("Creating database 'agno_worksphere'...")
            await conn.execute("CREATE DATABASE agno_worksphere")
            print("✓ Database created successfully")
        else:
            print("✓ Database 'agno_worksphere' already exists")
            
        await conn.close()
        return True
        
    except Exception as e:
        print(f"Error creating database: {e}")
        print("Please ensure PostgreSQL is running and accessible with:")
        print("  Host: localhost")
        print("  Port: 5432")
        print("  User: postgres")
        print("  Password: admin")
        return False

def test_database_connection():
    """Test database connection"""
    try:
        engine = create_engine("postgresql://postgres:admin@localhost:5432/agno_worksphere")
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✓ Database connection successful")
            return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return False

def run_migrations():
    """Run Alembic migrations"""
    try:
        print("Running database migrations...")
        result = subprocess.run([
            sys.executable, "-m", "alembic", "upgrade", "head"
        ], capture_output=True, text=True, cwd=os.path.dirname(__file__))
        
        if result.returncode == 0:
            print("✓ Migrations completed successfully")
            return True
        else:
            print(f"✗ Migration failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"✗ Error running migrations: {e}")
        return False

async def main():
    """Main setup function"""
    print("=== Agno WorkSphere Database Setup ===")
    
    # Step 1: Create database if needed
    if not await create_database_if_not_exists():
        print("Failed to create database. Exiting.")
        sys.exit(1)
    
    # Step 2: Test connection
    if not test_database_connection():
        print("Failed to connect to database. Exiting.")
        sys.exit(1)
    
    # Step 3: Run migrations
    if not run_migrations():
        print("Failed to run migrations. Exiting.")
        sys.exit(1)
    
    print("\n✓ Database setup completed successfully!")
    print("You can now start the application server.")

if __name__ == "__main__":
    asyncio.run(main())
