import musicbrainzngs
from sqlalchemy.orm import Session
from app.models.composer import Composer
from app.models.work import Work
from app.models.recording import Recording
from app.models.conductor import Conductor
from app.models.orchestra import Orchestra
from app.models.user import User
from app.models.listening_session import ListeningSession
from app.database import Base

musicbrainzngs.set_useragent("OpusBox", "0.1", "your@email.com")

import ssl
import urllib.request

ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

https_handler = urllib.request.HTTPSHandler(context=ssl_context)
opener = urllib.request.build_opener(https_handler)
urllib.request.install_opener(opener)

class MusicBrainzIngester:
    def __init__(self, db: Session):
        self.db = db

    def fetch_composer(self, mbid: str) -> dict:
        result = musicbrainzngs.get_artist_by_id(mbid, includes=["works"])
        return result["artist"]

    def ingest_composer(self, mbid: str) -> Composer:
        existing = self.db.query(Composer).filter(
            Composer.musicbrainz_id == mbid
        ).first()
        if existing:
            return existing

        data = self.fetch_composer(mbid)

        composer = Composer(
            name=data["name"],
            nationality=data.get("area", {}).get("name"),
            musicbrainz_id=mbid,
        )

        self.db.add(composer)
        self.db.commit()
        self.db.refresh(composer)
        return composer

    def ingest_works(self, composer: Composer, mbid: str) -> list[Work]:
        data = self.fetch_composer(mbid)
        works = []

        for work_data in data.get("work-list", []):
            existing = self.db.query(Work).filter(
                Work.musicbrainz_id == work_data["id"]
            ).first()
            if existing:
                works.append(existing)
                continue

            work = Work(
                title=work_data["title"],
                composer_id=composer.id,
                musicbrainz_id=work_data["id"],
            )
            self.db.add(work)
            works.append(work)

        self.db.commit()
        return works
