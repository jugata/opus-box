from pydantic import BaseModel
from typing import Optional

class RecordingBase(BaseModel):
    work_id: int
    conductor_id: Optional[int] = None
    orchestra_id: Optional[int] = None
    label: Optional[str] = None
    year: Optional[int] = None
    duration: Optional[int] = None
    musicbrainz_id: Optional[str] = None

class RecordingCreate(RecordingBase):
    pass

class RecordingResponse(RecordingBase):
    id: int

    model_config = {"from_attributes": True}
