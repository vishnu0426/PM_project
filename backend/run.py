#!/usr/bin/env python3
"""
Agno WorkSphere Backend Server Runner
Multi-Organization System with Enhanced Features

Simply run: python run.py
"""
import uvicorn
import sys
import os
from pathlib import Path

def main():
    """Run the Agno WorkSphere backend server"""

    print("🚀 Starting Agno WorkSphere Backend Server")
    print("=" * 60)
    print("🏢 Multi-Organization System")
    print("👑 Role-Based Access Control (Owner/Admin/Member/Viewer)")
    print("📧 Professional Email System")
    print("🔔 Enhanced Notifications")
    print("📊 Role-Specific Dashboards")
    print("🤖 AI Project Generation")
    print("📅 Meeting Scheduling")
    print("=" * 60)

    # Ensure we're in the right directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)

    print(f"📁 Working Directory: {backend_dir}")
    print(f"🌐 Server URL: http://localhost:8000")
    print(f"📖 API Docs: http://localhost:8000/docs")
    print(f"🔧 Interactive API: http://localhost:8000/redoc")
    print("=" * 60)

    print("🔐 Test Credentials Available:")
    print("   Owner: owner@agnotech.com / OwnerPass123!")
    print("   Admin: admin@agnotech.com / AdminPass123!")
    print("   Member: member@agnotech.com / MemberPass123!")
    print("   Viewer: viewer@agnotech.com / ViewerPass123!")
    print("=" * 60)

    print("🎯 Features Ready:")
    print("   ✅ Multi-Organization Support")
    print("   ✅ Role-Based Access Control")
    print("   ✅ Email Notifications (Welcome, Invitations, Projects)")
    print("   ✅ Enhanced Project Management")
    print("   ✅ Task Assignment System")
    print("   ✅ Meeting Scheduling")
    print("   ✅ AI Project Generation")
    print("   ✅ Organization-Specific Dashboards")
    print("=" * 60)

    try:
        print("🚀 Starting server...")
        print("   Press Ctrl+C to stop the server")
        print("=" * 60)

        # Start the FastAPI server with all multi-organization features
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=3001,
            reload=True,
            reload_dirs=["app"],
            log_level="info"
        )

    except KeyboardInterrupt:
        print("\n" + "=" * 60)
        print("🛑 Server stopped by user")
        print("👋 Thank you for using Agno WorkSphere!")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        print("\n🔧 Troubleshooting:")
        print("   1. Make sure you're in the PM/backend directory")
        print("   2. Check if port 8000 is available")
        print("   3. Ensure all dependencies are installed: pip install -r requirements.txt")
        print("   4. Verify database connection settings")
        sys.exit(1)

if __name__ == "__main__":
    main()
