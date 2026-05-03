from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Recording(Base):
    __tablename__ = "recordings"

    id = Column(Integer, primary_key=True, index=True)
    work_id = Column(Integer, ForeignKey("works.id"), nullable=False)
    conductor_id = Column(Integer, ForeignKey("conductors.id"), nullable=True)
    orchestra_id = Column(Integer, ForeignKey("orchestras.id"), nullable=True)
    label = Column(String(255), nullable=True)
    year = Column(Integer, nullable=True)
    duration = Column(Integer, nullable=True)  # in seconds
    musicbrainz_id = Column(String(36), unique=True, nullable=True)

    work = relationship("Work", back_populates="recordings")
    conductor = relationship("Conductor", back_populates="recordings")
    orchestra = relationship("Orchestra", back_populates="recordings")
    listening_sessions = relationship("ListeningSession", back_populates="recording")

    def __repr__(self):
        return f"<Recording(work_id={self.work_id}, conductor_id={self.conductor_id})>"
