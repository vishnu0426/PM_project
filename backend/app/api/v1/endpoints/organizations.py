"""
Organization management endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import get_current_active_user, require_admin, require_member, require_admin_by_path, require_member_by_path
from app.core.exceptions import ValidationError, ResourceNotFoundError, InsufficientPermissionsError
from app.models.user import User
from app.models.organization import Organization, OrganizationMember
from app.models.project import Project
from app.schemas.organization import (
    OrganizationCreate, OrganizationUpdate, OrganizationResponse,
    OrganizationMemberResponse, MemberInvite, MemberRoleUpdate,
    BillingInfo, SubscriptionInfo
)
from app.services.invitation_service import InvitationService

router = APIRouter()


@router.get("", response_model=List[OrganizationResponse])
async def get_organizations(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all organizations for current user"""
    result = await db.execute(
        select(Organization)
        .join(OrganizationMember)
        .where(OrganizationMember.user_id == current_user.id)
        .order_by(Organization.name)
    )
    organizations = result.scalars().all()
    
    return [OrganizationResponse.from_orm(org) for org in organizations]


@router.post("", response_model=OrganizationResponse)
async def create_organization(
    org_data: OrganizationCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new organization"""
    # Create organization
    organization = Organization(
        name=org_data.name,
        description=org_data.description,
        domain=org_data.domain,
        allowed_domains=org_data.allowed_domains,
        contact_email=org_data.contact_email,
        contact_phone=org_data.contact_phone,
        address_line1=org_data.address_line1,
        address_line2=org_data.address_line2,
        city=org_data.city,
        state=org_data.state,
        postal_code=org_data.postal_code,
        country=org_data.country,
        organization_category=org_data.organization_category,
        language=org_data.language,
        created_by=current_user.id
    )
    
    db.add(organization)
    await db.flush()  # Get the ID
    
    # Add creator as owner
    member = OrganizationMember(
        organization_id=organization.id,
        user_id=current_user.id,
        role="owner"
    )
    
    db.add(member)

    # Create a sample project for the new organization
    sample_project = Project(
        organization_id=organization.id,
        name="Welcome Project",
        description="Your first project to get started with Agno WorkSphere",
        status="active",
        priority="medium",
        created_by=current_user.id
    )

    db.add(sample_project)
    await db.commit()
    await db.refresh(organization)

    return OrganizationResponse.from_orm(organization)


@router.get("/{organization_id}", response_model=OrganizationResponse)
async def get_organization(
    organization_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get organization by ID"""
    # Check if user is member
    member_result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == organization_id,
            OrganizationMember.user_id == current_user.id
        )
    )
    if not member_result.scalar_one_or_none():
        raise InsufficientPermissionsError("Not a member of this organization")
    
    # Get organization
    result = await db.execute(
        select(Organization).where(Organization.id == organization_id)
    )
    organization = result.scalar_one_or_none()
    if not organization:
        raise ResourceNotFoundError("Organization not found")
    
    return OrganizationResponse.from_orm(organization)


@router.put("/{organization_id}", response_model=OrganizationResponse)
async def update_organization(
    organization_id: str,
    org_data: OrganizationUpdate,
    current_user: User = Depends(get_current_active_user),
    org_member: OrganizationMember = Depends(require_admin_by_path),
    db: AsyncSession = Depends(get_db)
):
    """Update organization"""
    result = await db.execute(
        select(Organization).where(Organization.id == organization_id)
    )
    organization = result.scalar_one_or_none()
    if not organization:
        raise ResourceNotFoundError("Organization not found")
    
    # Update fields if provided
    if org_data.name is not None:
        organization.name = org_data.name
    if org_data.description is not None:
        organization.description = org_data.description
    if org_data.domain is not None:
        organization.domain = org_data.domain
    if org_data.allowed_domains is not None:
        organization.allowed_domains = org_data.allowed_domains
    if org_data.contact_email is not None:
        organization.contact_email = org_data.contact_email
    if org_data.contact_phone is not None:
        organization.contact_phone = org_data.contact_phone
    if org_data.address_line1 is not None:
        organization.address_line1 = org_data.address_line1
    if org_data.address_line2 is not None:
        organization.address_line2 = org_data.address_line2
    if org_data.city is not None:
        organization.city = org_data.city
    if org_data.state is not None:
        organization.state = org_data.state
    if org_data.postal_code is not None:
        organization.postal_code = org_data.postal_code
    if org_data.country is not None:
        organization.country = org_data.country
    if org_data.organization_category is not None:
        organization.organization_category = org_data.organization_category
    if org_data.allowed_domains is not None:
        organization.allowed_domains = org_data.allowed_domains
    if org_data.contact_email is not None:
        organization.contact_email = org_data.contact_email
    if org_data.contact_phone is not None:
        organization.contact_phone = org_data.contact_phone
    if org_data.address_line1 is not None:
        organization.address_line1 = org_data.address_line1
    if org_data.address_line2 is not None:
        organization.address_line2 = org_data.address_line2
    if org_data.city is not None:
        organization.city = org_data.city
    if org_data.state is not None:
        organization.state = org_data.state
    if org_data.postal_code is not None:
        organization.postal_code = org_data.postal_code
    if org_data.country is not None:
        organization.country = org_data.country
    if org_data.organization_category is not None:
        organization.organization_category = org_data.organization_category
    
    await db.commit()
    await db.refresh(organization)
    
    return OrganizationResponse.from_orm(organization)


@router.delete("/{organization_id}")
async def delete_organization(
    organization_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete organization (owner only)"""
    # Check if user is owner
    member_result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == organization_id,
            OrganizationMember.user_id == current_user.id,
            OrganizationMember.role == "owner"
        )
    )
    if not member_result.scalar_one_or_none():
        raise InsufficientPermissionsError("Only organization owner can delete organization")
    
    # Get organization
    result = await db.execute(
        select(Organization).where(Organization.id == organization_id)
    )
    organization = result.scalar_one_or_none()
    if not organization:
        raise ResourceNotFoundError("Organization not found")
    
    # Delete organization (cascade will handle members, projects, etc.)
    await db.delete(organization)
    await db.commit()
    
    return {"success": True, "message": "Organization deleted successfully"}


@router.post("/{organization_id}/logo")
async def upload_logo(
    organization_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    org_member: OrganizationMember = Depends(require_admin_by_path),
    db: AsyncSession = Depends(get_db)
):
    """Upload organization logo"""
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise ValidationError("File must be an image")
    
    # Validate file size (max 5MB)
    if file.size > 5 * 1024 * 1024:
        raise ValidationError("File size must be less than 5MB")
    
    # TODO: Upload to S3 or local storage
    logo_url = f"/uploads/organizations/{organization_id}/logo/{file.filename}"
    
    # Update organization logo URL
    result = await db.execute(
        select(Organization).where(Organization.id == organization_id)
    )
    organization = result.scalar_one_or_none()
    if not organization:
        raise ResourceNotFoundError("Organization not found")
    
    organization.logo_url = logo_url
    await db.commit()
    
    return {
        "success": True,
        "data": {
            "logo_url": logo_url
        },
        "message": "Logo uploaded successfully"
    }


@router.delete("/{organization_id}/logo")
async def delete_logo(
    organization_id: str,
    current_user: User = Depends(get_current_active_user),
    org_member: OrganizationMember = Depends(require_admin_by_path),
    db: AsyncSession = Depends(get_db)
):
    """Delete organization logo"""
    result = await db.execute(
        select(Organization).where(Organization.id == organization_id)
    )
    organization = result.scalar_one_or_none()
    if not organization:
        raise ResourceNotFoundError("Organization not found")
    
    if not organization.logo_url:
        raise ResourceNotFoundError("No logo to delete")
    
    # TODO: Delete file from storage
    
    # Remove logo URL
    organization.logo_url = None
    await db.commit()
    
    return {"success": True, "message": "Logo deleted successfully"}


@router.get("/{organization_id}/members", response_model=List[OrganizationMemberResponse])
async def get_members(
    organization_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    org_member: OrganizationMember = Depends(require_member_by_path),
    db: AsyncSession = Depends(get_db)
):
    """Get organization members"""
    offset = (page - 1) * limit

    result = await db.execute(
        select(OrganizationMember)
        .options(selectinload(OrganizationMember.user))
        .where(OrganizationMember.organization_id == organization_id)
        .offset(offset)
        .limit(limit)
        .order_by(OrganizationMember.joined_at)
    )
    members = result.scalars().all()

    # Format response with user details
    response = []
    for member in members:
        member_data = OrganizationMemberResponse(
            id=str(member.id),
            user_id=str(member.user_id),
            role=member.role,
            joined_at=member.joined_at,
            user={
                "id": str(member.user.id),
                "email": member.user.email,
                "first_name": member.user.first_name,
                "last_name": member.user.last_name,
                "avatar_url": member.user.avatar_url
            }
        )
        response.append(member_data)

    return response


@router.post("/{organization_id}/invite")
async def invite_member(
    organization_id: str,
    invite_data: MemberInvite,
    current_user: User = Depends(get_current_active_user),
    org_member: OrganizationMember = Depends(require_admin_by_path),
    db: AsyncSession = Depends(get_db)
):
    """Invite member to organization"""
    # Check if user already exists
    user_result = await db.execute(
        select(User).where(User.email == invite_data.email)
    )
    user = user_result.scalar_one_or_none()

    if user:
        # Check if already a member
        member_result = await db.execute(
            select(OrganizationMember).where(
                OrganizationMember.organization_id == organization_id,
                OrganizationMember.user_id == user.id
            )
        )
        if member_result.scalar_one_or_none():
            raise ValidationError("User is already a member of this organization")

        # Add as member
        member = OrganizationMember(
            organization_id=organization_id,
            user_id=user.id,
            role=invite_data.role,
            invited_by=current_user.id
        )
        db.add(member)
        await db.commit()

        return {"success": True, "message": "User added to organization successfully"}
    else:
        # Send invitation email and create invitation token
        invite_service = InvitationService(db)
        result = await invite_service.send_organization_invitation(
            email=invite_data.email,
            organization_id=organization_id,
            invited_role=invite_data.role,
            inviter_id=str(current_user.id)
        )
        return {"success": True, "message": "Invitation sent successfully", "data": result}


@router.delete("/{organization_id}/members/{user_id}")
async def remove_member(
    organization_id: str,
    user_id: str,
    current_user: User = Depends(get_current_active_user),
    org_member: OrganizationMember = Depends(require_admin_by_path),
    db: AsyncSession = Depends(get_db)
):
    """Remove member from organization"""
    # Cannot remove owner
    member_result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == organization_id,
            OrganizationMember.user_id == user_id
        )
    )
    member = member_result.scalar_one_or_none()
    if not member:
        raise ResourceNotFoundError("Member not found")

    if member.role == "owner":
        raise ValidationError("Cannot remove organization owner")

    # Remove member
    await db.delete(member)
    await db.commit()

    return {"success": True, "message": "Member removed successfully"}


@router.put("/{organization_id}/members/{user_id}/role")
async def update_member_role(
    organization_id: str,
    user_id: str,
    role_data: MemberRoleUpdate,
    current_user: User = Depends(get_current_active_user),
    org_member: OrganizationMember = Depends(require_admin_by_path),
    db: AsyncSession = Depends(get_db)
):
    """Update member role"""
    # Get member
    member_result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == organization_id,
            OrganizationMember.user_id == user_id
        )
    )
    member = member_result.scalar_one_or_none()
    if not member:
        raise ResourceNotFoundError("Member not found")

    # Cannot change owner role unless you are owner
    if member.role == "owner" and org_member.role != "owner":
        raise InsufficientPermissionsError("Only owner can change owner role")

    # Cannot assign owner role unless you are owner
    if role_data.role == "owner" and org_member.role != "owner":
        raise InsufficientPermissionsError("Only owner can assign owner role")

    # Update role
    member.role = role_data.role
    await db.commit()

    return {"success": True, "message": "Member role updated successfully"}


@router.get("/{organization_id}/billing", response_model=BillingInfo)
async def get_billing(
    organization_id: str,
    current_user: User = Depends(get_current_active_user),
    org_member: OrganizationMember = Depends(require_admin_by_path),
    db: AsyncSession = Depends(get_db)
):
    """Get billing information"""
    # TODO: Get from database
    return BillingInfo()


@router.put("/{organization_id}/billing", response_model=BillingInfo)
async def update_billing(
    organization_id: str,
    billing_data: BillingInfo,
    current_user: User = Depends(get_current_active_user),
    org_member: OrganizationMember = Depends(require_admin_by_path),
    db: AsyncSession = Depends(get_db)
):
    """Update billing information"""
    # TODO: Store in database
    return billing_data


@router.get("/{organization_id}/subscription", response_model=SubscriptionInfo)
async def get_subscription(
    organization_id: str,
    current_user: User = Depends(get_current_active_user),
    org_member: OrganizationMember = Depends(require_admin_by_path),
    db: AsyncSession = Depends(get_db)
):
    """Get subscription information"""
    # TODO: Get from database
    return SubscriptionInfo()


@router.put("/{organization_id}/subscription", response_model=SubscriptionInfo)
async def update_subscription(
    organization_id: str,
    subscription_data: SubscriptionInfo,
    current_user: User = Depends(get_current_active_user),
    org_member: OrganizationMember = Depends(require_admin_by_path),
    db: AsyncSession = Depends(get_db)
):
    """Update subscription information"""
    # TODO: Store in database and handle billing
    return subscription_data
