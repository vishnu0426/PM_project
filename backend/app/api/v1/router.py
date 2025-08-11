"""
Main API router for v1 endpoints
"""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, organizations, projects, boards, columns, cards, teams, upload, checklist, ai_projects, meetings, task_dependencies, notifications, registration, project_signoff
from app.api.v1.endpoints import organizations_enhanced, projects_enhanced, dashboard_api, task_assignment
from app.api.v1 import organization_hierarchy, bulk_operations, analytics, security, integrations, ai_automation

api_router = APIRouter(prefix="/v1")


@api_router.get("/")
async def api_root():
    """API v1 root endpoint"""
    return {
        "success": True,
        "data": {
            "message": "Agno WorkSphere API v1",
            "version": "1.0.0",
            "endpoints": {
                "auth": "/api/v1/auth",
                "users": "/api/v1/users",
                "organizations": "/api/v1/organizations",
                "projects": "/api/v1/projects",
                "boards": "/api/v1/boards",
                "columns": "/api/v1/columns",
                "cards": "/api/v1/cards",
                "teams": "/api/v1/teams",
                "analytics": "/api/v1/analytics",
                "ai": "/api/v1/ai",
                "ai_projects": "/api/v1/ai-projects",
                "meetings": "/api/v1/meetings",
                "dependencies": "/api/v1/dependencies",
                "notifications": "/api/v1/notifications",
                "registrations": "/api/v1/registrations",
                "project_signoff": "/api/v1/project-signoff"
            }
        },
        "timestamp": __import__('time').time()
    }


# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["Organizations"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(boards.router, prefix="/projects", tags=["Boards"])
api_router.include_router(columns.router, prefix="/columns", tags=["Columns"])
api_router.include_router(cards.router, prefix="/cards", tags=["Cards"])
api_router.include_router(checklist.router, prefix="/checklist", tags=["Checklist & AI"])
api_router.include_router(teams.router, prefix="/teams", tags=["Teams"])
api_router.include_router(upload.router, prefix="/upload", tags=["File Upload"])
api_router.include_router(organization_hierarchy.router, prefix="/hierarchy", tags=["Organization Hierarchy"])
api_router.include_router(bulk_operations.router, prefix="/bulk", tags=["Bulk Operations"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & Reporting"])
api_router.include_router(security.router, prefix="/security", tags=["Security & Compliance"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["Integrations"])
api_router.include_router(ai_automation.router, prefix="/ai", tags=["AI & Automation"])
api_router.include_router(ai_projects.router, prefix="/ai-projects", tags=["AI Projects"])
api_router.include_router(meetings.router, prefix="/meetings", tags=["Meetings"])
api_router.include_router(task_dependencies.router, prefix="/dependencies", tags=["Task Dependencies"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(registration.router, prefix="/registrations", tags=["Registration Management"])
api_router.include_router(project_signoff.router, prefix="/project-signoff", tags=["Project Sign-off"])

# Enhanced Multi-Organization Endpoints
api_router.include_router(organizations_enhanced.router, prefix="/organizations-enhanced", tags=["Enhanced Organizations"])
api_router.include_router(projects_enhanced.router, prefix="/projects-enhanced", tags=["Enhanced Projects"])
api_router.include_router(dashboard_api.router, prefix="/dashboard", tags=["Role-Based Dashboard"])
api_router.include_router(task_assignment.router, prefix="/task-assignment", tags=["Task Assignment & Notifications"])
