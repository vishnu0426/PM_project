#!/usr/bin/env python3
"""
DEFAULT Project Management Backend Server
==========================================

This is the main server file to run the backend.
Use this script to start the backend server for development.

Usage:
    python start_server.py

Features:
- Complete API endpoints for all functionality
- Authentication and authorization
- Project management
- Team management
- Analytics
- AI features
- Kanban boards
- Email system
- Multi-organization support

Server will be available at: http://localhost:8000
API Documentation: http://localhost:8000/docs
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def main():
    print("🚀 Starting DEFAULT Project Management Backend Server...")
    print("=" * 70)
    print("📁 Server File: consolidated_server.py")
    print("🌐 URL: http://localhost:8000")
    print("📖 API Docs: http://localhost:8000/docs")
    print("=" * 70)
    print("✅ This is the ONLY server you need to run for development!")
    print("=" * 70)
    
    # Import and run the consolidated server
    try:
        import uvicorn

        uvicorn.run(
            "consolidated_server:app",
            host="0.0.0.0",
            port=3001,
            reload=True,
            log_level="info",
            access_log=True
        )
    except ImportError as e:
        print(f"❌ Error importing server: {e}")
        print("Make sure you're in the backend directory and have installed dependencies:")
        print("  pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
