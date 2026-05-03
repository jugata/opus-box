from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class Orchestra(Base):
    __tablename__ = "orchestras"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    founded = Column(Integer, nullable=True)
    musicbrainz_id = Column(String(36), unique=True, nullable=True)
    
    recordings = relationship("Recording", back_populates="orchestra")

    def __repr__(self):
        return f"<Orchestra(name={self.name})>"
