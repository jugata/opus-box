from pydantic import BaseModel
from datetime import date
from typing import Optional

class ComposerBase(BaseModel):
    name: str
    born: Optional[date] = None
    died: Optional[date] = None
    nationality: Optional[str] = None
    bio: Optional[str] = None
    musicbrainz_id: Optional[str] = None

class ComposerCreate(ComposerBase):
    pass

class ComposerResponse(ComposerBase):
    id: int

    model_config = {"from_attributes": True}
