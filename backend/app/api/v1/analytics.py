"""
Analytics and reporting API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, and_, or_, select
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta
import json

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.organization import Organization, OrganizationMember
from app.models.project import Project
from app.models.card import Card
from app.models.analytics import (
    AnalyticsReport, ReportExecution, DashboardWidget, 
    MetricSnapshot, DataExport, PerformanceMetric
)
from app.schemas.analytics import (
    AnalyticsReportCreate, AnalyticsReportResponse,
    DashboardWidgetCreate, DashboardWidgetResponse,
    DataExportCreate, DataExportResponse,
    OrganizationAnalytics, ProjectAnalytics, UserAnalytics
)

router = APIRouter()


@router.get("/dashboard/stats", response_model=dict)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get dashboard statistics"""
    # Get user's organizations
    result = await db.execute(
        select(OrganizationMember).where(OrganizationMember.user_id == current_user.id)
    )
    user_orgs = result.scalars().all()

    if not user_orgs:
        return {
            "total_projects": 0,
            "total_boards": 0,
            "total_cards": 0,
            "organizations": 0,
            "completion_rate": 0
        }

    # Mock dashboard stats for now
    return {
        "total_projects": 8,
        "total_boards": 12,
        "total_cards": 45,
        "organizations": len(user_orgs),
        "completion_rate": 78.5,
        "active_projects": 6,
        "completed_tasks": 35,
        "pending_tasks": 10,
        "team_members": 15
    }


@router.get("", response_model=dict)
async def get_analytics_overview(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get analytics overview for current user's organizations"""
    # Get user's organizations
    result = await db.execute(
        select(OrganizationMember).where(OrganizationMember.user_id == current_user.id)
    )
    user_orgs = result.scalars().all()

    if not user_orgs:
        return {
            "total_projects": 0,
            "total_tasks": 0,
            "completed_tasks": 0,
            "organizations": 0,
            "completion_rate": 0
        }

    # Get first organization for demo
    org_id = user_orgs[0].organization_id

    # Mock analytics data
    return {
        "total_projects": 5,
        "total_tasks": 25,
        "completed_tasks": 18,
        "organizations": len(user_orgs),
        "completion_rate": 72.0,
        "recent_activity": [
            {"type": "task_completed", "count": 3, "date": "2025-08-03"},
            {"type": "project_created", "count": 1, "date": "2025-08-02"},
            {"type": "task_created", "count": 5, "date": "2025-08-01"}
        ]
    }


@router.get("/users/me", response_model=dict)
async def get_user_analytics(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get analytics for current user"""
    # Mock user analytics data
    return {
        "user_id": str(current_user.id),
        "total_tasks": 15,
        "completed_tasks": 12,
        "in_progress_tasks": 2,
        "pending_tasks": 1,
        "completion_rate": 80.0,
        "average_completion_time": "1.8 days",
        "productivity_score": 85.5,
        "recent_activity": [
            {"type": "task_completed", "count": 3, "date": "2025-08-03"},
            {"type": "task_created", "count": 2, "date": "2025-08-02"}
        ]
    }


@router.get("/projects/{project_id}", response_model=dict)
async def get_project_analytics(
    project_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get analytics for a specific project"""
    # Mock project analytics data
    return {
        "project_id": project_id,
        "total_tasks": 12,
        "completed_tasks": 8,
        "in_progress_tasks": 3,
        "pending_tasks": 1,
        "completion_rate": 66.7,
        "average_completion_time": "2.5 days",
        "team_members": 4,
        "recent_activity": [
            {"type": "task_completed", "count": 2, "date": "2025-08-03"},
            {"type": "task_created", "count": 1, "date": "2025-08-02"}
        ],
        "task_distribution": {
            "todo": 1,
            "in_progress": 3,
            "done": 8
        }
    }


@router.get("/organizations/{organization_id}/analytics/overview", response_model=OrganizationAnalytics)
async def get_organization_analytics(
    organization_id: UUID,
    date_range: Optional[str] = Query("30d", regex="^(7d|30d|90d|1y|all)$"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get comprehensive organization analytics"""
    # Check if user has access to this organization
    member_result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == organization_id,
            OrganizationMember.user_id == current_user.id
        )
    )
    member = member_result.scalar_one_or_none()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to organization"
        )
    
    # Calculate date range
    end_date = datetime.utcnow()
    if date_range == "7d":
        start_date = end_date - timedelta(days=7)
    elif date_range == "30d":
        start_date = end_date - timedelta(days=30)
    elif date_range == "90d":
        start_date = end_date - timedelta(days=90)
    elif date_range == "1y":
        start_date = end_date - timedelta(days=365)
    else:
        start_date = None
    
    # Get basic counts
    total_members_result = await db.execute(
        select(func.count(OrganizationMember.id)).where(
            OrganizationMember.organization_id == organization_id
        )
    )
    total_members = total_members_result.scalar() or 0

    total_projects_result = await db.execute(
        select(func.count(Project.id)).where(
            Project.organization_id == organization_id
        )
    )
    total_projects = total_projects_result.scalar() or 0

    active_projects_result = await db.execute(
        select(func.count(Project.id)).where(
            Project.organization_id == organization_id,
            Project.status == 'active'
        )
    )
    active_projects = active_projects_result.scalar() or 0

    # Get task statistics - using mock data for now since Card model needs to be checked
    total_tasks = 25  # Mock data
    completed_tasks = 18  # Mock data

    # Calculate completion rate
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    # Get member growth data - using mock data for now
    member_growth = [
        {"date": "2025-08-01", "count": 2},
        {"date": "2025-08-02", "count": 1},
        {"date": "2025-08-03", "count": 3}
    ]

    # Get project completion data - using mock data for now
    project_completion_rate = 75.0  # Mock data

    # Calculate average task completion time - using mock data for now
    avg_completion_time = 2.5  # Mock data in hours
    
    return OrganizationAnalytics(
        total_members=total_members,
        active_members=total_members,  # Assuming all members are active for now
        total_projects=total_projects,
        active_projects=active_projects,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        completion_rate=completion_rate,
        project_completion_rate=project_completion_rate,
        member_growth=member_growth,
        average_task_completion_time=avg_completion_time
    )


@router.get("/reports", response_model=List[dict])
async def get_analytics_reports(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get available analytics reports"""
    # Mock reports data
    return [
        {
            "id": "report-1",
            "name": "Project Performance Report",
            "description": "Comprehensive project performance analytics",
            "type": "project",
            "created_at": "2025-08-01T00:00:00Z"
        },
        {
            "id": "report-2",
            "name": "Team Productivity Report",
            "description": "Team productivity and collaboration metrics",
            "type": "team",
            "created_at": "2025-08-02T00:00:00Z"
        },
        {
            "id": "report-3",
            "name": "Organization Overview",
            "description": "High-level organization metrics and KPIs",
            "type": "organization",
            "created_at": "2025-08-03T00:00:00Z"
        }
    ]


@router.get("/widgets", response_model=List[dict])
async def get_dashboard_widgets(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get available dashboard widgets"""
    # Mock widgets data
    return [
        {
            "id": "widget-1",
            "name": "Task Completion Rate",
            "type": "metric",
            "config": {"chart_type": "gauge", "metric": "completion_rate"},
            "position": {"x": 0, "y": 0, "width": 4, "height": 3}
        },
        {
            "id": "widget-2",
            "name": "Project Progress",
            "type": "chart",
            "config": {"chart_type": "bar", "metric": "project_progress"},
            "position": {"x": 4, "y": 0, "width": 8, "height": 3}
        },
        {
            "id": "widget-3",
            "name": "Team Activity",
            "type": "timeline",
            "config": {"chart_type": "line", "metric": "team_activity"},
            "position": {"x": 0, "y": 3, "width": 12, "height": 4}
        }
    ]


@router.post("/exports", response_model=dict)
async def create_data_export(
    export_data: dict,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a data export"""
    # Mock export creation
    export_id = f"export-{int(__import__('time').time())}"

    return {
        "id": export_id,
        "type": export_data.get("export_type", "csv"),
        "data_type": export_data.get("data_type", "projects"),
        "status": "processing",
        "created_at": __import__('datetime').datetime.utcnow().isoformat(),
        "download_url": f"/api/v1/analytics/exports/{export_id}/download"
    }


@router.get("/organizations/{organization_id}/analytics/projects/{project_id}", response_model=ProjectAnalytics)
async def get_project_analytics(
    organization_id: UUID,
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed project analytics"""
    # Check if user has access to this organization
    member = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == organization_id,
        OrganizationMember.user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to organization"
        )
    
    # Verify project belongs to organization
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.organization_id == organization_id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Get task statistics by status
    task_stats = db.query(
        Card.status,
        func.count(Card.id).label('count')
    ).filter(Card.project_id == project_id).group_by(Card.status).all()
    
    task_by_status = {row.status: row.count for row in task_stats}
    
    # Get task statistics by priority
    priority_stats = db.query(
        Card.priority,
        func.count(Card.id).label('count')
    ).filter(Card.project_id == project_id).group_by(Card.priority).all()
    
    task_by_priority = {row.priority: row.count for row in priority_stats}
    
    # Get assignee statistics
    assignee_stats = db.query(
        Card.assigned_to,
        func.count(Card.id).label('count')
    ).filter(
        Card.project_id == project_id,
        Card.assigned_to.isnot(None)
    ).group_by(Card.assigned_to).all()
    
    task_by_assignee = [
        {"user_id": str(row.assigned_to), "count": row.count}
        for row in assignee_stats
    ]
    
    # Calculate project progress
    total_tasks = sum(task_by_status.values())
    completed_tasks = task_by_status.get('completed', 0)
    progress_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    # Get overdue tasks
    overdue_tasks = db.query(Card).filter(
        Card.project_id == project_id,
        Card.due_date < datetime.utcnow(),
        Card.status != 'completed'
    ).count()
    
    return ProjectAnalytics(
        project_id=project_id,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        progress_percentage=progress_percentage,
        overdue_tasks=overdue_tasks,
        task_by_status=task_by_status,
        task_by_priority=task_by_priority,
        task_by_assignee=task_by_assignee,
        created_at=project.created_at,
        updated_at=project.updated_at
    )


@router.get("/organizations/{organization_id}/dashboard/widgets", response_model=List[DashboardWidgetResponse])
async def get_dashboard_widgets(
    organization_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get dashboard widgets for user"""
    # Check if user has access to this organization
    member = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == organization_id,
        OrganizationMember.user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to organization"
        )
    
    # Get user-specific and organization-wide widgets
    widgets = db.query(DashboardWidget).filter(
        DashboardWidget.organization_id == organization_id,
        or_(
            DashboardWidget.user_id == current_user.id,
            DashboardWidget.user_id.is_(None)
        ),
        DashboardWidget.is_visible == True
    ).order_by(DashboardWidget.position_y, DashboardWidget.position_x).all()
    
    return widgets


@router.post("/organizations/{organization_id}/dashboard/widgets", response_model=DashboardWidgetResponse)
async def create_dashboard_widget(
    organization_id: UUID,
    widget_data: DashboardWidgetCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new dashboard widget"""
    # Check if user has access to this organization
    member = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == organization_id,
        OrganizationMember.user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to organization"
        )
    
    widget = DashboardWidget(
        organization_id=organization_id,
        user_id=current_user.id,
        widget_type=widget_data.widget_type,
        widget_name=widget_data.widget_name,
        configuration=widget_data.configuration,
        position_x=widget_data.position_x,
        position_y=widget_data.position_y,
        width=widget_data.width,
        height=widget_data.height,
        refresh_interval=widget_data.refresh_interval
    )
    
    db.add(widget)
    db.commit()
    db.refresh(widget)
    
    return widget


@router.put("/organizations/{organization_id}/dashboard/widgets/{widget_id}")
async def update_dashboard_widget(
    organization_id: UUID,
    widget_id: UUID,
    widget_data: DashboardWidgetCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update dashboard widget"""
    widget = db.query(DashboardWidget).filter(
        DashboardWidget.id == widget_id,
        DashboardWidget.organization_id == organization_id,
        DashboardWidget.user_id == current_user.id
    ).first()
    
    if not widget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Widget not found"
        )
    
    # Update widget properties
    widget.widget_name = widget_data.widget_name
    widget.configuration = widget_data.configuration
    widget.position_x = widget_data.position_x
    widget.position_y = widget_data.position_y
    widget.width = widget_data.width
    widget.height = widget_data.height
    widget.refresh_interval = widget_data.refresh_interval
    
    db.commit()
    db.refresh(widget)
    
    return widget


@router.delete("/organizations/{organization_id}/dashboard/widgets/{widget_id}")
async def delete_dashboard_widget(
    organization_id: UUID,
    widget_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete dashboard widget"""
    widget = db.query(DashboardWidget).filter(
        DashboardWidget.id == widget_id,
        DashboardWidget.organization_id == organization_id,
        DashboardWidget.user_id == current_user.id
    ).first()
    
    if not widget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Widget not found"
        )
    
    db.delete(widget)
    db.commit()
    
    return {"message": "Widget deleted successfully"}


@router.post("/organizations/{organization_id}/exports", response_model=DataExportResponse)
async def create_data_export(
    organization_id: UUID,
    export_data: DataExportCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new data export"""
    # Check if user has access to this organization
    member = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == organization_id,
        OrganizationMember.user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to organization"
        )
    
    # Create export record
    export = DataExport(
        organization_id=organization_id,
        export_type=export_data.export_type,
        export_format=export_data.export_format,
        file_name=f"{export_data.export_type}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.{export_data.export_format}",
        file_path="",  # Will be set by background task
        filters=export_data.filters,
        created_by=current_user.id
    )
    
    db.add(export)
    db.commit()
    db.refresh(export)
    
    # Start background export processing
    # background_tasks.add_task(process_data_export, export.id, db)
    
    return export


@router.get("/organizations/{organization_id}/exports", response_model=List[DataExportResponse])
async def get_data_exports(
    organization_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all data exports for organization"""
    # Check if user has access to this organization
    member = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == organization_id,
        OrganizationMember.user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to organization"
        )
    
    exports = db.query(DataExport).filter(
        DataExport.organization_id == organization_id
    ).order_by(DataExport.created_at.desc()).all()
    
    return exports
