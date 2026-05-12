from pydantic import BaseModel
from datetime import date
from typing import Optional

class ConductorBase(BaseModel):
    name: str
    nationality: Optional[str] = None
    born: Optional[date] = None
    died: Optional[date] = None
    musicbrainz_id: Optional[str] = None

class ConductorCreate(ConductorBase):
    pass

class ConductorResponse(ConductorBase):
    id: int

    model_config = {"from_attributes": True}
