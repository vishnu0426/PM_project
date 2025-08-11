"""
Board management endpoints
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.core.exceptions import ResourceNotFoundError, InsufficientPermissionsError
from app.models.user import User
from app.models.organization import OrganizationMember
from app.models.project import Project
from app.models.board import Board
from app.schemas.project import BoardCreate, BoardUpdate, BoardResponse

router = APIRouter()


@router.get("/{board_id}", response_model=BoardResponse)
async def get_board(
    board_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get board by ID"""
    result = await db.execute(
        select(Board)
        .options(selectinload(Board.project))
        .where(Board.id == board_id)
    )
    board = result.scalar_one_or_none()
    if not board:
        raise ResourceNotFoundError("Board not found")
    
    # Check access through organization membership
    org_member_result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == board.project.organization_id,
            OrganizationMember.user_id == current_user.id
        )
    )
    if not org_member_result.scalar_one_or_none():
        raise InsufficientPermissionsError("Access denied")
    
    return BoardResponse.from_orm(board)


@router.put("/{board_id}", response_model=BoardResponse)
async def update_board(
    board_id: str,
    board_data: BoardUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update board"""
    result = await db.execute(
        select(Board)
        .options(selectinload(Board.project))
        .where(Board.id == board_id)
    )
    board = result.scalar_one_or_none()
    if not board:
        raise ResourceNotFoundError("Board not found")
    
    # Check access and permissions
    org_member_result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == board.project.organization_id,
            OrganizationMember.user_id == current_user.id
        )
    )
    org_member = org_member_result.scalar_one_or_none()
    if not org_member:
        raise InsufficientPermissionsError("Access denied")
    
    if org_member.role not in ['member', 'admin', 'owner']:
        raise InsufficientPermissionsError("Insufficient permissions")
    
    # Update fields
    if board_data.name is not None:
        board.name = board_data.name
    if board_data.description is not None:
        board.description = board_data.description
    
    await db.commit()
    await db.refresh(board)
    
    return BoardResponse.from_orm(board)


@router.delete("/{board_id}")
async def delete_board(
    board_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete board"""
    result = await db.execute(
        select(Board)
        .options(selectinload(Board.project))
        .where(Board.id == board_id)
    )
    board = result.scalar_one_or_none()
    if not board:
        raise ResourceNotFoundError("Board not found")
    
    # Check access and permissions
    org_member_result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == board.project.organization_id,
            OrganizationMember.user_id == current_user.id
        )
    )
    org_member = org_member_result.scalar_one_or_none()
    if not org_member:
        raise InsufficientPermissionsError("Access denied")
    
    if org_member.role not in ['admin', 'owner']:
        raise InsufficientPermissionsError("Insufficient permissions")

    # Check if project data is protected
    project = board.project
    if project.data_protected:
        # Only owners can delete boards from protected projects
        if org_member.role != 'owner':
            raise HTTPException(
                status_code=403,
                detail=f"Cannot delete board: Project data is protected. Reason: {project.protection_reason or 'Data protection enabled'}"
            )

        # Even owners get a warning about protected data
        if project.sign_off_requested and not project.sign_off_approved:
            raise HTTPException(
                status_code=403,
                detail="Cannot delete board: Project is pending sign-off approval. Complete the sign-off process first."
            )

    await db.delete(board)
    await db.commit()

    return {"success": True, "message": "Board deleted successfully"}


@router.get("/{project_id}/boards", response_model=List[BoardResponse])
async def get_project_boards(
    project_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get boards for a project"""
    # Check project access
    project_result = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    project = project_result.scalar_one_or_none()
    if not project:
        raise ResourceNotFoundError("Project not found")
    
    # Check organization membership
    org_member_result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == project.organization_id,
            OrganizationMember.user_id == current_user.id
        )
    )
    if not org_member_result.scalar_one_or_none():
        raise InsufficientPermissionsError("Access denied")
    
    # Get boards
    result = await db.execute(
        select(Board)
        .where(Board.project_id == project_id)
        .order_by(Board.created_at)
    )
    boards = result.scalars().all()
    
    return [BoardResponse.from_orm(board) for board in boards]


@router.post("/{project_id}/boards", response_model=BoardResponse)
async def create_board(
    project_id: str,
    board_data: BoardCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new board"""
    # Check project access
    project_result = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    project = project_result.scalar_one_or_none()
    if not project:
        raise ResourceNotFoundError("Project not found")
    
    # Check organization membership and permissions
    org_member_result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == project.organization_id,
            OrganizationMember.user_id == current_user.id
        )
    )
    org_member = org_member_result.scalar_one_or_none()
    if not org_member:
        raise InsufficientPermissionsError("Access denied")
    
    if org_member.role not in ['member', 'admin', 'owner']:
        raise InsufficientPermissionsError("Insufficient permissions")
    
    # Create board
    board = Board(
        project_id=project_id,
        name=board_data.name,
        description=board_data.description,
        created_by=current_user.id
    )
    
    db.add(board)
    await db.commit()
    await db.refresh(board)
    
    return BoardResponse.from_orm(board)
