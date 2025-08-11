"""
Card schemas
"""
from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class CardCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    column_id: str  # Required column ID
    position: Optional[int] = None  # Will be auto-calculated if not provided
    priority: str = "medium"
    due_date: Optional[datetime] = None
    assigned_to: Optional[List[str]] = None  # List of user IDs
    checklist: Optional[List[Dict[str, Any]]] = None  # AI-generated checklist items
    labels: Optional[list] = None  # List of label strings or objects
    
    @validator('title')
    def validate_title(cls, v):
        if not v.strip():
            raise ValueError('Card title cannot be empty')
        return v.strip()
    
    @validator('priority')
    def validate_priority(cls, v):
        if v not in ['low', 'medium', 'high', 'urgent']:
            raise ValueError('Priority must be low, medium, high, or urgent')
        return v
    
    @validator('position')
    def validate_position(cls, v):
        if v is not None and v < 0:
            raise ValueError('Position must be non-negative')
        return v


class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    position: Optional[int] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    assigned_to: Optional[List[str]] = None
    checklist: Optional[List[Dict[str, Any]]] = None
    labels: Optional[list] = None  # List of label strings or objects
    
    @validator('title')
    def validate_title(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Card title cannot be empty')
        return v.strip() if v else v
    
    @validator('priority')
    def validate_priority(cls, v):
        if v is not None and v not in ['low', 'medium', 'high', 'urgent']:
            raise ValueError('Priority must be low, medium, high, or urgent')
        return v
    
    @validator('position')
    def validate_position(cls, v):
        if v is not None and v < 0:
            raise ValueError('Position must be non-negative')
        return v


class CardMove(BaseModel):
    target_column_id: UUID
    position: int
    
    @validator('position')
    def validate_position(cls, v):
        if v < 0:
            raise ValueError('Position must be non-negative')
        return v


class CardAssignmentResponse(BaseModel):
    id: UUID
    user_id: UUID
    assigned_by: Optional[UUID] = None
    assigned_at: datetime
    user: dict  # Will contain user details
    
    class Config:
        from_attributes = True


class CardResponse(BaseModel):
    id: UUID
    column_id: UUID
    title: str
    description: Optional[str] = None
    position: int
    priority: str
    due_date: Optional[datetime] = None
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    labels: Optional[list] = None
    assignments: Optional[List[CardAssignmentResponse]] = None
    checklist_items: Optional[List[Dict[str, Any]]] = None
    
    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    content: str
    
    @validator('content')
    def validate_content(cls, v):
        if not v.strip():
            raise ValueError('Comment content cannot be empty')
        return v.strip()


class CommentUpdate(BaseModel):
    content: str
    
    @validator('content')
    def validate_content(cls, v):
        if not v.strip():
            raise ValueError('Comment content cannot be empty')
        return v.strip()


class CommentResponse(BaseModel):
    id: str
    card_id: str
    user_id: str
    content: str
    created_at: datetime
    updated_at: datetime
    user: dict  # Will contain user details
    
    class Config:
        from_attributes = True


class AttachmentResponse(BaseModel):
    id: str
    card_id: str
    filename: str
    original_name: str
    file_size: int
    mime_type: str
    file_url: str
    uploaded_by: str
    uploaded_at: datetime
    uploader: dict  # Will contain user details
    
    class Config:
        from_attributes = True


class ActivityResponse(BaseModel):
    id: str
    user_id: str
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    metadata: Optional[dict] = None
    created_at: datetime
    user: dict  # Will contain user details
    
    class Config:
        from_attributes = True
