from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Work(Base):
    __tablename__ = "works"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    composer_id = Column(Integer, ForeignKey("composers.id"), nullable=False)
    genre = Column(String(100), nullable=True)
    key = Column(String(50), nullable=True)
    opus_number = Column(String(50), nullable=True)
    year = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    musicbrainz_id = Column(String(36), unique=True, nullable=True)

    composer = relationship("Composer", back_populates="works")
    recordings = relationship("Recording", back_populates="work")

    def __repr__(self):
        return f"<Work(title={self.title}, composer_id={self.composer_id})>"
