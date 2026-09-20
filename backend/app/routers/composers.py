import musicbrainzngs
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.composer import Composer
from app.schemas.composer import (
    ComposerCreate,
    ComposerResponse,
    ComposerCandidate,
    ComposerSearchResult,
)
from app.ingestion.musicbrainz import MusicBrainzIngester
from typing import List

router = APIRouter(prefix="/composers", tags=["composers"])

@router.get("/", response_model=List[ComposerResponse])
def get_composers(db: Session = Depends(get_db)):
    return db.query(Composer).all()

@router.get("/search", response_model=ComposerSearchResult)
def search_composers(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    local = db.query(Composer).filter(Composer.name.ilike(f"%{q}%")).all()
    known_mbids = {c.musicbrainz_id for c in db.query(Composer.musicbrainz_id).all()}

    ingester = MusicBrainzIngester(db)
    candidates = [
        ComposerCandidate(
            musicbrainz_id=artist["id"],
            name=artist["name"],
            disambiguation=artist.get("disambiguation"),
            nationality=artist.get("area", {}).get("name"),
        )
        for artist in ingester.search_composers(q)
        if artist["id"] not in known_mbids and artist.get("type") == "Person"
    ]

    return ComposerSearchResult(local=local, candidates=candidates)

@router.post("/import/{musicbrainz_id}", response_model=ComposerResponse)
def import_composer(musicbrainz_id: str, db: Session = Depends(get_db)):
    ingester = MusicBrainzIngester(db)
    try:
        composer = ingester.ingest_composer(musicbrainz_id)
    except musicbrainzngs.ResponseError:
        raise HTTPException(status_code=404, detail="Composer not found on MusicBrainz")
    works = ingester.ingest_works(composer, musicbrainz_id)
    for work in works:
        ingester.ingest_recordings(work)
    return composer

@router.get("/{composer_id}", response_model=ComposerResponse)
def get_composer(composer_id: int, db: Session = Depends(get_db)):
    composer = db.query(Composer).filter(Composer.id == composer_id).first()
    if not composer:
        raise HTTPException(status_code=404, detail="Composer not found")
    return composer

@router.post("/", response_model=ComposerResponse)
def create_composer(composer: ComposerCreate, db: Session = Depends(get_db)):
    db_composer = Composer(**composer.model_dump())
    db.add(db_composer)
    db.commit()
    db.refresh(db_composer)
    return db_composer
