"""
User management endpoints
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.core.exceptions import ValidationError, ResourceNotFoundError
from app.models.user import User
from app.models.organization import Organization, OrganizationMember
from app.schemas.user import UserProfile, UserProfileUpdate, UserProfileWithRole, UserOrganizationInfo, NotificationPreferences, NotificationPreferencesUpdate
from app.schemas.auth import UserResponse

router = APIRouter()


@router.get("/me", response_model=UserProfileWithRole)
async def get_current_user(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user profile with role and organization information"""
    # Get user's organization memberships
    result = await db.execute(
        select(OrganizationMember)
        .where(OrganizationMember.user_id == current_user.id)
    )
    memberships = result.scalars().all()

    # Build organization info list
    organizations = []
    current_role = None
    current_org_id = None

    for membership in memberships:
        # Load organization details
        org_result = await db.execute(
            select(Organization)
            .where(Organization.id == membership.organization_id)
        )
        org = org_result.scalar_one_or_none()

        if org:
            org_info = UserOrganizationInfo(
                id=org.id,
                name=org.name,
                role=membership.role
            )
            organizations.append(org_info)

            # Use the first organization as current (or you could implement logic to determine current org)
            if current_role is None:
                current_role = membership.role
                current_org_id = org.id

    # Create response with role information
    user_data = UserProfile.from_orm(current_user)

    return UserProfileWithRole(
        **user_data.dict(),
        role=current_role,
        organizations=organizations,
        current_organization_id=current_org_id
    )


@router.put("/me", response_model=UserProfile)
async def update_current_user(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user profile (alias for /profile)"""
    # Update fields if provided
    if profile_data.first_name is not None:
        current_user.first_name = profile_data.first_name
    if profile_data.last_name is not None:
        current_user.last_name = profile_data.last_name

    await db.commit()
    await db.refresh(current_user)

    return UserProfile.from_orm(current_user)


@router.get("/{user_id}", response_model=UserProfile)
async def get_user_by_id(
    user_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user by ID"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise ResourceNotFoundError("User not found")

    return UserProfile.from_orm(user)


@router.get("/profile", response_model=UserProfile)
async def get_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user profile"""
    return UserProfile.from_orm(current_user)


@router.put("/profile", response_model=UserProfile)
async def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user profile"""
    # Update fields if provided
    if profile_data.first_name is not None:
        current_user.first_name = profile_data.first_name
    if profile_data.last_name is not None:
        current_user.last_name = profile_data.last_name
    
    await db.commit()
    await db.refresh(current_user)
    
    return UserProfile.from_orm(current_user)


@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload user avatar"""
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise ValidationError("File must be an image")
    
    # Validate file size (max 5MB)
    if file.size > 5 * 1024 * 1024:
        raise ValidationError("File size must be less than 5MB")
    
    # TODO: Upload to S3 or local storage
    # For now, just return a mock URL
    avatar_url = f"/uploads/avatars/{current_user.id}/{file.filename}"
    
    # Update user avatar URL
    current_user.avatar_url = avatar_url
    await db.commit()
    
    return {
        "success": True,
        "data": {
            "avatar_url": avatar_url
        },
        "message": "Avatar uploaded successfully"
    }


@router.delete("/avatar")
async def delete_avatar(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete user avatar"""
    if not current_user.avatar_url:
        raise ResourceNotFoundError("No avatar to delete")
    
    # TODO: Delete file from storage
    
    # Remove avatar URL
    current_user.avatar_url = None
    await db.commit()
    
    return {
        "success": True,
        "message": "Avatar deleted successfully"
    }


@router.get("/notifications/preferences", response_model=NotificationPreferences)
async def get_notification_preferences(
    current_user: User = Depends(get_current_active_user)
):
    """Get user notification preferences"""
    # TODO: Get from database or return defaults
    return NotificationPreferences()


@router.put("/notifications/preferences", response_model=NotificationPreferences)
async def update_notification_preferences(
    preferences: NotificationPreferencesUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user notification preferences"""
    # TODO: Store in database
    # For now, just return the updated preferences
    return NotificationPreferences()


@router.delete("/account")
async def delete_account(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete user account"""
    # TODO: Implement account deletion with proper cleanup
    # This should remove user from all organizations, transfer ownership, etc.
    
    return {
        "success": True,
        "message": "Account deletion initiated. You will receive a confirmation email."
    }
