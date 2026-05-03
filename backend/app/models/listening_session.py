from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class ListeningSession(Base):
    __tablename__ = "listening_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recording_id = Column(Integer, ForeignKey("recordings.id"), nullable=False)
    listened_at = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True)  # 1-5

    user = relationship("User", back_populates="listening_sessions")
    recording = relationship("Recording", back_populates="listening_sessions")

    def __repr__(self):
        return f"<ListeningSession(user_id={self.user_id}, recording_id={self.recording_id})>"
