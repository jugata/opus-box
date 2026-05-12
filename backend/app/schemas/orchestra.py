from pydantic import BaseModel
from typing import Optional

class OrchestraBase(BaseModel):
    name: str
    city: Optional[str] = None
    country: Optional[str] = None
    founded: Optional[int] = None
    musicbrainz_id: Optional[str] = None

class OrchestraCreate(OrchestraBase):
    pass

class OrchestraResponse(OrchestraBase):
    id: int

    model_config = {"from_attributes": True}
