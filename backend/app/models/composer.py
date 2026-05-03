from sqlalchemy import Column, Integer, String, Text, Date
from app.database import Base

class Composer(Base):
    __tablename__ = "composers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    born = Column(Date, nullable=True)
    died = Column(Date, nullable=True)
    nationality = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    musicbrainz_id = Column(String(36), unique=True, nullable=True)

    def __repr__(self):
        return f"<Composer(name={self.name})>"
