from pydantic import BaseModel
from typing import Optional

class WorkBase(BaseModel):
    title: str
    composer_id: int
    genre: Optional[str] = None
    key: Optional[str] = None
    opus_number: Optional[str] = None
    year: Optional[int] = None
    description: Optional[str] = None
    musicbrainz_id: Optional[str] = None

class WorkCreate(WorkBase):
    pass

class WorkResponse(WorkBase):
    id: int

    model_config = {"from_attributes": True}
