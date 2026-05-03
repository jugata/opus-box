from sqlalchemy import Column, Integer, String, Date
from sqlalchemy.orm import relationship
from app.database import Base

class Conductor(Base):
    __tablename__ = "conductors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    nationality = Column(String(100), nullable=True)
    born = Column(Date, nullable=True)
    died = Column(Date, nullable=True)
    musicbrainz_id = Column(String(36), unique=True, nullable=True)
    
    recordings = relationship("Recording", back_populates="conductor")

    def __repr__(self):
        return f"<Conductor(name={self.name})>"
