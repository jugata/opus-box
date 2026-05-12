from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone
from typing import List

from app.database import get_db
from app.models.listening_session import ListeningSession
from app.models.work import Work
from app.models.recording import Recording
from app.schemas.listening_session import (
    ListeningSessionCreate,
    ListeningSessionUpdate,
    ListeningSessionRead,
)
from .auth import get_current_user  # reuse the JWT dependency from auth router

router = APIRouter(prefix="/listening-sessions", tags=["listening-sessions"])


# ---------------------------------------------------------------------------
# POST /listening-sessions  — log a new session
# ---------------------------------------------------------------------------
@router.post("/", response_model=ListeningSessionRead, status_code=status.HTTP_201_CREATED)
def create_listening_session(
    payload: ListeningSessionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Verify the recording exists
    recording = db.query(Recording).filter(Recording.id == payload.recording_id).first()
    if not recording:
        raise HTTPException(status_code=404, detail="Recording not found")

    session = ListeningSession(
        user_id=current_user.id,
        recording_id=payload.recording_id,
        listened_at=payload.listened_at or datetime.now(timezone.utc),
        notes=payload.notes,
        rating=payload.rating,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Re-fetch with relationships for the response
    return (
        db.query(ListeningSession)
        .options(
            joinedload(ListeningSession.recording)
            .joinedload(Recording.work)
            .joinedload(Work.composer),
            joinedload(ListeningSession.recording)
            .joinedload(Recording.conductor),
            joinedload(ListeningSession.recording)
            .joinedload(Recording.orchestra),
        )
        .filter(ListeningSession.id == session.id)
        .first()
    )


# ---------------------------------------------------------------------------
# GET /listening-sessions/me  — authenticated user's full history
# ---------------------------------------------------------------------------
@router.get("/me", response_model=List[ListeningSessionRead])
def get_my_listening_sessions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    skip: int = 0,
    limit: int = 50,
):
    return (
        db.query(ListeningSession)
        .options(
            joinedload(ListeningSession.recording)
            .joinedload(Recording.work)
            .joinedload(Work.composer),
            joinedload(ListeningSession.recording)
            .joinedload(Recording.conductor),
            joinedload(ListeningSession.recording)
            .joinedload(Recording.orchestra),
        )
        .filter(ListeningSession.user_id == current_user.id)
        .order_by(ListeningSession.listened_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# ---------------------------------------------------------------------------
# GET /listening-sessions/{id}  — single session (must belong to current user)
# ---------------------------------------------------------------------------
@router.get("/{session_id}", response_model=ListeningSessionRead)
def get_listening_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    session = (
        db.query(ListeningSession)
        .options(
            joinedload(ListeningSession.recording)
            .joinedload(Recording.work)
            .joinedload(Work.composer),
            joinedload(ListeningSession.recording)
            .joinedload(Recording.conductor),
            joinedload(ListeningSession.recording)
            .joinedload(Recording.orchestra),
        )
        .filter(
            ListeningSession.id == session_id,
            ListeningSession.user_id == current_user.id,
        )
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Listening session not found")
    return session


# ---------------------------------------------------------------------------
# PATCH /listening-sessions/{id}  — update notes / rating
# ---------------------------------------------------------------------------
@router.patch("/{session_id}", response_model=ListeningSessionRead)
def update_listening_session(
    session_id: int,
    payload: ListeningSessionUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    session = (
        db.query(ListeningSession)
        .filter(
            ListeningSession.id == session_id,
            ListeningSession.user_id == current_user.id,
        )
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Listening session not found")

    if payload.notes is not None:
        session.notes = payload.notes
    if payload.rating is not None:
        session.rating = payload.rating

    db.commit()
    db.refresh(session)
    return session


# ---------------------------------------------------------------------------
# DELETE /listening-sessions/{id}
# ---------------------------------------------------------------------------
@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listening_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    session = (
        db.query(ListeningSession)
        .filter(
            ListeningSession.id == session_id,
            ListeningSession.user_id == current_user.id,
        )
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Listening session not found")

    db.delete(session)
    db.commit()
