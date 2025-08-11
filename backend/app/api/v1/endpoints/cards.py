"""
Card management endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Request, status as http_status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.core.exceptions import ResourceNotFoundError, InsufficientPermissionsError
from app.core.permissions import can_create_cards, get_user_role_for_column
from app.models.user import User
from app.models.organization import OrganizationMember
from app.models.project import Project
from app.models.column import Column
from app.models.board import Board
from app.models.card import Card, CardAssignment, ChecklistItem
from app.models.comment import Comment
from app.models.attachment import Attachment
from app.services.role_permissions import role_permissions
from app.schemas.card import (
    CardCreate, CardUpdate, CardResponse, CardMove, CardAssignmentResponse,
    CommentCreate, CommentUpdate, CommentResponse,
    AttachmentResponse, ActivityResponse
)

router = APIRouter()


@router.get("/list", response_model=List[CardResponse])
async def list_cards(
    column_id: Optional[str] = Query(None, description="Filter by column ID"),
    board_id: Optional[str] = Query(None, description="Filter by board ID"),
    project_id: Optional[str] = Query(None, description="Filter by project ID"),
    assigned_to: Optional[str] = Query(None, description="Filter by assigned user ID"),
    card_status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get cards with optional filters - alternative endpoint"""
    try:
        # Ensure all filter parameters are properly handled
        column_id = column_id if column_id and column_id.strip() else None
        board_id = board_id if board_id and board_id.strip() else None
        project_id = project_id if project_id and project_id.strip() else None
        assigned_to = assigned_to if assigned_to and assigned_to.strip() else None
        card_status = card_status if card_status and card_status.strip() else None
        priority = priority if priority and priority.strip() else None

        # Build base query
        query = select(Card).options(
            selectinload(Card.column)
            .selectinload(Column.board)
            .selectinload(Board.project),
            selectinload(Card.assignments),
            selectinload(Card.checklist_items),
            selectinload(Card.comments),
            selectinload(Card.attachments)
        )

        # Apply filters
        if column_id:
            query = query.where(Card.column_id == column_id)
        elif board_id:
        from app.schemas.card import CardCreate, CardUpdate, CardResponse, CardMove, CardAssignmentResponse, ChecklistItemCreate
            # Filter by board through column relationship
            query = query.join(Column).where(Column.board_id == board_id)
        elif project_id:
            # Filter by project through board and column relationships
            query = query.join(Column).join(Board).where(Board.project_id == project_id)
        else:
            # If no specific filter, get user's organization cards
            user_org_result = await db.execute(
                select(OrganizationMember.organization_id)
                .where(OrganizationMember.user_id == current_user.id)
            )
            user_org_ids = [row[0] for row in user_org_result.fetchall()]

            if user_org_ids:
                # Filter cards to only those in user's organizations
                org_projects_subquery = select(Project.id).where(Project.organization_id.in_(user_org_ids))
                org_boards_subquery = select(Board.id).where(Board.project_id.in_(org_projects_subquery))
                org_columns_subquery = select(Column.id).where(Column.board_id.in_(org_boards_subquery))
                query = query.where(Card.column_id.in_(org_columns_subquery))

            labels=card_data.labels or [],
        if assigned_to:
            query = query.join(Card.assignments).join(CardAssignment.user).where(User.id == assigned_to)

        if card_status:
            query = query.where(Card.status == card_status)

        if priority:
            query = query.where(Card.priority == priority)

        # Apply pagination
        query = query.offset(skip).limit(limit)
            labels=card_with_relations.labels,

        # Execute query
        result = await db.execute(query)
        cards = result.scalars().all()

        return cards

    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve cards: {str(e)}"
        )


@router.get("/", response_model=List[CardResponse])
async def get_cards(
    request: Request,
    column_id: Optional[str] = Query(None, description="Filter by column ID"),
    board_id: Optional[str] = Query(None, description="Filter by board ID"),
    project_id: Optional[str] = Query(None, description="Filter by project ID"),
    assigned_to: Optional[str] = Query(None, description="Filter by assigned user ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get cards with optional filters"""
    try:
        # Ensure all filter parameters are properly handled
        column_id = column_id if column_id and column_id.strip() else None
        board_id = board_id if board_id and board_id.strip() else None
        project_id = project_id if project_id and project_id.strip() else None
        assigned_to = assigned_to if assigned_to and assigned_to.strip() else None
        status = status if status and status.strip() else None
        priority = priority if priority and priority.strip() else None

        # Build base query
        query = select(Card).options(
            selectinload(Card.column)
            .selectinload(Column.board)
            .selectinload(Board.project),
            selectinload(Card.assignments).selectinload(CardAssignment.user),
            selectinload(Card.checklist_items)
        )

        # If no specific filters are provided, limit to user's organizations
        if not any([column_id, board_id, project_id, assigned_to]):
            # Get user's organizations
            user_orgs_result = await db.execute(
                select(OrganizationMember.organization_id).where(
                    OrganizationMember.user_id == current_user.id
                )
            )
            user_org_ids = [row[0] for row in user_orgs_result.fetchall()]

            if user_org_ids:
                # Filter cards to only those in user's organizations
                org_projects_subquery = select(Project.id).where(Project.organization_id.in_(user_org_ids))
                org_boards_subquery = select(Board.id).where(Board.project_id.in_(org_projects_subquery))
                org_columns_subquery = select(Column.id).where(Column.board_id.in_(org_boards_subquery))
                query = query.where(Card.column_id.in_(org_columns_subquery))
            else:
                # User has no organizations, return empty result
                query = query.where(Card.id == None)

        # Apply filters with proper subqueries to avoid join issues
        if column_id:
            query = query.where(Card.column_id == column_id)

        if board_id:
            # Use subquery to find columns in the board
            column_subquery = select(Column.id).where(Column.board_id == board_id)
            query = query.where(Card.column_id.in_(column_subquery))

        if project_id:
            # Use subquery to find columns in boards of the project
            board_subquery = select(Board.id).where(Board.project_id == project_id)
            column_subquery = select(Column.id).where(Column.board_id.in_(board_subquery))
            query = query.where(Card.column_id.in_(column_subquery))

        if assigned_to:
            # Use subquery to find cards assigned to the user
            assignment_subquery = select(CardAssignment.card_id).where(CardAssignment.user_id == assigned_to)
            query = query.where(Card.id.in_(assignment_subquery))

        if status:
            query = query.where(Card.status == status)

        if priority:
            query = query.where(Card.priority == priority)

        # Apply pagination and ordering
        query = query.order_by(Card.position, Card.created_at).offset(skip).limit(limit)

        result = await db.execute(query)
        cards = result.scalars().all()

        return cards

    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get cards: {str(e)}"
        )


@router.get("/{card_id}", response_model=CardResponse)
async def get_card(
    card_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get card by ID"""
    result = await db.execute(
        select(Card)
        .options(
            selectinload(Card.column)
            .selectinload(Column.board)
            .selectinload(Board.project),
            selectinload(Card.assignments).selectinload(CardAssignment.user),
            selectinload(Card.checklist_items)
        )
        .where(Card.id == card_id)
    )
    card = result.scalar_one_or_none()
    if not card:
        raise ResourceNotFoundError("Card not found")
    
    # Check access
    org_member_result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == card.column.board.project.organization_id,
            OrganizationMember.user_id == current_user.id
        )
    )
    if not org_member_result.scalar_one_or_none():
        raise InsufficientPermissionsError("Access denied")
    
    # Format response with assignments and checklist
    card_response = CardResponse.from_orm(card)
    if card.assignments:
        card_response.assignments = []
        for assignment in card.assignments:
            assignment_data = CardAssignmentResponse.from_orm(assignment)
            assignment_data.user = {
                "id": str(assignment.user.id),
                "email": assignment.user.email,
                "first_name": assignment.user.first_name,
                "last_name": assignment.user.last_name,
                "avatar_url": assignment.user.avatar_url
            }
            card_response.assignments.append(assignment_data)

    # Add checklist items
    if card.checklist_items:
        card_response.checklist_items = []
        for item in sorted(card.checklist_items, key=lambda x: x.position):
            card_response.checklist_items.append({
                "id": str(item.id),
                "text": item.text,
                "completed": item.completed,
                "position": item.position,
                "ai_generated": item.ai_generated,
                "confidence": item.confidence,
                "metadata": item.metadata,
                "created_at": item.created_at.isoformat(),
                "updated_at": item.updated_at.isoformat()
            })

    return card_response


@router.put("/{card_id}", response_model=CardResponse)
async def update_card(
    card_id: str,
    card_data: CardUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update card"""
    result = await db.execute(
        select(Card)
        .options(
            selectinload(Card.column)
            .selectinload(Column.board)
            .selectinload(Board.project)
        )
        .where(Card.id == card_id)
    )
    card = result.scalar_one_or_none()
    if not card:
        raise ResourceNotFoundError("Card not found")
    
    # Check access and permissions
    org_member_result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == card.column.board.project.organization_id,
            OrganizationMember.user_id == current_user.id
        )
    )
    org_member = org_member_result.scalar_one_or_none()
    if not org_member:
        raise InsufficientPermissionsError("Access denied")
    
    if org_member.role not in ['member', 'admin', 'owner']:
        raise InsufficientPermissionsError("Insufficient permissions")

    # Check if project data is protected (allow updates but with restrictions)
    project = card.column.board.project
    if project.data_protected and project.sign_off_requested and not project.sign_off_approved:
        # During sign-off review, only allow status updates and completion marking
        allowed_fields = {'status', 'position'}  # Allow minimal updates during review
        update_fields = set(card_data.dict(exclude_unset=True).keys())
        restricted_fields = update_fields - allowed_fields

        if restricted_fields and org_member.role != 'owner':
            raise HTTPException(
                status_code=403,
                detail=f"Limited updates allowed during sign-off review. Restricted fields: {', '.join(restricted_fields)}"
            )

    # Update fields
    if card_data.title is not None:
        card.title = card_data.title
    if card_data.description is not None:
        card.description = card_data.description
    if card_data.position is not None:
        card.position = card_data.position
    if card_data.priority is not None:
        card.priority = card_data.priority
    if card_data.due_date is not None:
        card.due_date = card_data.due_date
    if card_data.labels is not None:
        card.labels = card_data.labels
    
    # Handle assignments with role-based validation
    if card_data.assigned_to is not None:
        # Validate assignments
        validation_result = await role_permissions.validate_task_assignment(
            db=db,
            organization_id=card.column.board.project.organization_id,
            current_user=current_user,
            target_user_ids=card_data.assigned_to
        )

        if not validation_result['valid']:
            raise InsufficientPermissionsError(validation_result['error'])

        # Remove existing assignments
        await db.execute(delete(CardAssignment).where(CardAssignment.card_id == card_id))

        # Add new assignments
        for user_id in card_data.assigned_to:
            assignment = CardAssignment(
                card_id=card_id,
                user_id=user_id,
                assigned_by=current_user.id
            )
            db.add(assignment)
    
    await db.commit()

    # Reload card with relationships for response
    result = await db.execute(
        select(Card)
        .options(
            selectinload(Card.assignments).selectinload(CardAssignment.user),
            selectinload(Card.checklist_items)
        )
        .where(Card.id == card.id)
    )
    card_with_relations = result.scalar_one()

    # Manually construct response to avoid async issues
    assignments_data = []
    if card_with_relations.assignments:
        for assignment in card_with_relations.assignments:
            assignments_data.append(CardAssignmentResponse(
                id=assignment.id,
                card_id=assignment.card_id,
                user_id=assignment.user_id,
                assigned_by=assignment.assigned_by,
                assigned_at=assignment.assigned_at,
                user={
                    "id": str(assignment.user.id),
                    "email": assignment.user.email,
                    "first_name": assignment.user.first_name,
                    "last_name": assignment.user.last_name
                }
            ))

    checklist_data = []
    if card_with_relations.checklist_items:
        for item in card_with_relations.checklist_items:
            checklist_data.append({
                "id": str(item.id),
                "text": item.text,
                "completed": item.completed,
                "position": item.position,
                "ai_generated": item.ai_generated,
                "confidence": item.confidence,
                "metadata": item.metadata,
                "created_at": item.created_at.isoformat() if item.created_at else None,
                "updated_at": item.updated_at.isoformat() if item.updated_at else None
            })

    return CardResponse(
        id=card_with_relations.id,
        column_id=card_with_relations.column_id,
        title=card_with_relations.title,
        description=card_with_relations.description,
        position=card_with_relations.position,
        priority=card_with_relations.priority,
        due_date=card_with_relations.due_date,
        labels=card_with_relations.labels,
        created_by=card_with_relations.created_by,
        created_at=card_with_relations.created_at,
        updated_at=card_with_relations.updated_at,
        assignments=assignments_data,
        checklist_items=checklist_data
    )


@router.delete("/{card_id}")
async def delete_card(
    card_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete card"""
    result = await db.execute(
        select(Card)
        .options(
            selectinload(Card.column)
            .selectinload(Column.board)
            .selectinload(Board.project)
        )
        .where(Card.id == card_id)
    )
    card = result.scalar_one_or_none()
    if not card:
        raise ResourceNotFoundError("Card not found")
    
    # Check access and permissions
    org_member_result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == card.column.board.project.organization_id,
            OrganizationMember.user_id == current_user.id
        )
    )
    org_member = org_member_result.scalar_one_or_none()
    if not org_member:
        raise InsufficientPermissionsError("Access denied")
    
    if org_member.role not in ['member', 'admin', 'owner']:
        raise InsufficientPermissionsError("Insufficient permissions")

    # Check if project data is protected
    project = card.column.board.project
    if project.data_protected:
        # Only owners can delete cards from protected projects
        if org_member.role != 'owner':
            raise HTTPException(
                status_code=403,
                detail=f"Cannot delete card: Project data is protected. Reason: {project.protection_reason or 'Data protection enabled'}"
            )

        # Even owners get a warning about protected data
        if project.sign_off_requested and not project.sign_off_approved:
            raise HTTPException(
                status_code=403,
                detail="Cannot delete card: Project is pending sign-off approval. Complete the sign-off process first."
            )

    await db.delete(card)
    await db.commit()

    return {"success": True, "message": "Card deleted successfully"}


@router.put("/{card_id}/move")
async def move_card(
    card_id: str,
    move_data: CardMove,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Move card to different column"""
    result = await db.execute(
        select(Card)
        .options(
            selectinload(Card.column)
            .selectinload(Column.board)
            .selectinload(Board.project)
        )
        .where(Card.id == card_id)
    )
    card = result.scalar_one_or_none()
    if not card:
        raise ResourceNotFoundError("Card not found")
    
    # Check access and permissions
    org_member_result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == card.column.board.project.organization_id,
            OrganizationMember.user_id == current_user.id
        )
    )
    org_member = org_member_result.scalar_one_or_none()
    if not org_member:
        raise InsufficientPermissionsError("Access denied")
    
    if org_member.role not in ['member', 'admin', 'owner']:
        raise InsufficientPermissionsError("Insufficient permissions")
    
    # Verify target column exists and belongs to same board
    target_column_result = await db.execute(
        select(Column).where(
            Column.id == move_data.target_column_id,
            Column.board_id == card.column.board_id
        )
    )
    if not target_column_result.scalar_one_or_none():
        raise ResourceNotFoundError("Target column not found or not in same board")
    
    # Move card
    card.column_id = move_data.target_column_id
    card.position = move_data.position
    
    await db.commit()
    
    return {"success": True, "message": "Card moved successfully"}


@router.get("", response_model=List[CardResponse])
async def get_cards(
    column_id: str = Query(..., description="Column ID to filter cards"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get cards for a column"""
    # Check column access
    column_result = await db.execute(
        select(Column)
        .options(
            selectinload(Column.board)
            .selectinload(Board.project)
        )
        .where(Column.id == column_id)
    )
    column = column_result.scalar_one_or_none()
    if not column:
        raise ResourceNotFoundError("Column not found")

    # Check organization membership
    org_member_result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == column.board.project.organization_id,
            OrganizationMember.user_id == current_user.id
        )
    )
    if not org_member_result.scalar_one_or_none():
        raise InsufficientPermissionsError("Access denied")

    # Get cards
    result = await db.execute(
        select(Card)
        .options(
            selectinload(Card.assignments).selectinload(CardAssignment.user),
            selectinload(Card.checklist_items)
        )
        .where(Card.column_id == column_id)
        .order_by(Card.position)
    )
    cards = result.scalars().all()

    # Format response
    response = []
    for card in cards:
        card_response = CardResponse.from_orm(card)
        if card.assignments:
            card_response.assignments = []
            for assignment in card.assignments:
                assignment_data = CardAssignmentResponse.from_orm(assignment)
                assignment_data.user = {
                    "id": str(assignment.user.id),
                    "email": assignment.user.email,
                    "first_name": assignment.user.first_name,
                    "last_name": assignment.user.last_name,
                    "avatar_url": assignment.user.avatar_url
                }
                card_response.assignments.append(assignment_data)
        response.append(card_response)

    return response


@router.post("", response_model=CardResponse)
async def create_card(
    card_data: CardCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new card"""
    # Get column_id from card_data
    column_id = card_data.column_id

    # Check column access
    column_result = await db.execute(
        select(Column)
        .options(
            selectinload(Column.board)
            .selectinload(Board.project)
        )
        .where(Column.id == column_id)
    )
    column = column_result.scalar_one_or_none()
    if not column:
        raise ResourceNotFoundError("Column not found")
    
    # Check permissions using the new permission system
    user_role = await get_user_role_for_column(current_user.id, column_id, db)

    if not user_role:
        raise InsufficientPermissionsError("Access denied - user is not a member of this organization")

    if not can_create_cards(user_role):
        raise InsufficientPermissionsError(f"Role '{user_role}' does not have permission to create cards")
    
    # Create card
    card = Card(
        column_id=column_id,
        title=card_data.title,
        description=card_data.description,
        position=card_data.position,
        priority=card_data.priority,
        due_date=card_data.due_date,
        created_by=current_user.id
    )
    
    db.add(card)
    await db.flush()  # Get the ID
    
    # Add assignments if provided
    if card_data.assigned_to:
        # Validate assignments
        validation_result = await role_permissions.validate_task_assignment(
            db=db,
            organization_id=column.board.project.organization_id,
            current_user=current_user,
            target_user_ids=card_data.assigned_to
        )

        if not validation_result['valid']:
            raise InsufficientPermissionsError(validation_result['error'])

        for user_id in card_data.assigned_to:
            assignment = CardAssignment(
                card_id=card.id,
                user_id=user_id,
                assigned_by=current_user.id
            )
            db.add(assignment)

    # Add checklist items if provided
    if card_data.checklist:
        for item_data in card_data.checklist:
            checklist_item = ChecklistItem(
                card_id=card.id,
                text=item_data.get('text', ''),
                position=item_data.get('position', 0),
                ai_generated=item_data.get('ai_generated', False),
                confidence=item_data.get('confidence'),
                metadata=item_data.get('metadata'),
                created_by=current_user.id
            )
            db.add(checklist_item)

    await db.commit()

    # Reload card with relationships for response
    result = await db.execute(
        select(Card)
        .options(
            selectinload(Card.assignments).selectinload(CardAssignment.user),
            selectinload(Card.checklist_items)
        )
        .where(Card.id == card.id)
    )
    card_with_relations = result.scalar_one()

    # Manually construct response to avoid async issues
    assignments_data = []
    if card_with_relations.assignments:
        for assignment in card_with_relations.assignments:
            assignments_data.append(CardAssignmentResponse(
                id=assignment.id,
                card_id=assignment.card_id,
                user_id=assignment.user_id,
                assigned_by=assignment.assigned_by,
                assigned_at=assignment.assigned_at,
                user={
                    "id": str(assignment.user.id),
                    "email": assignment.user.email,
                    "first_name": assignment.user.first_name,
                    "last_name": assignment.user.last_name
                }
            ))

    checklist_data = []
    if card_with_relations.checklist_items:
        for item in card_with_relations.checklist_items:
            checklist_data.append({
                "id": str(item.id),
                "text": item.text,
                "completed": item.completed,
                "position": item.position,
                "ai_generated": item.ai_generated,
                "confidence": item.confidence,
                "metadata": item.metadata,
                "created_at": item.created_at.isoformat() if item.created_at else None,
                "updated_at": item.updated_at.isoformat() if item.updated_at else None
            })

    return CardResponse(
        id=card_with_relations.id,
        column_id=card_with_relations.column_id,
        title=card_with_relations.title,
        description=card_with_relations.description,
        position=card_with_relations.position,
        priority=card_with_relations.priority,
        due_date=card_with_relations.due_date,
        created_by=card_with_relations.created_by,
        created_at=card_with_relations.created_at,
        updated_at=card_with_relations.updated_at,
        assignments=assignments_data,
        checklist_items=checklist_data
    )
