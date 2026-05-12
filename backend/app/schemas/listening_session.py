from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ListeningSessionCreate(BaseModel):
    recording_id: int
    listened_at: Optional[datetime] = None  # defaults to now if omitted
    notes: Optional[str] = None
    rating: Optional[int] = Field(default=None, ge=1, le=5)


class ListeningSessionUpdate(BaseModel):
    notes: Optional[str] = None
    rating: Optional[int] = Field(default=None, ge=1, le=5)


# Nested read schemas for rich GET /listening-sessions/me response

class ComposerBrief(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class WorkBrief(BaseModel):
    id: int
    title: str
    composer: Optional[ComposerBrief] = None

    model_config = {"from_attributes": True}


class OrchestraBrief(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class ConductorBrief(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class RecordingBrief(BaseModel):
    id: int
    label: Optional[str] = None
    year: Optional[int] = None
    work: Optional[WorkBrief] = None
    conductor: Optional[ConductorBrief] = None
    orchestra: Optional[OrchestraBrief] = None

    model_config = {"from_attributes": True}


class ListeningSessionRead(BaseModel):
    id: int
    recording_id: int
    listened_at: datetime
    notes: Optional[str] = None
    rating: Optional[int] = None
    recording: Optional[RecordingBrief] = None

    model_config = {"from_attributes": True}
