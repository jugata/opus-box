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

class MusicBrainzIngester:
    def __init__(self, db: Session):
        self.db = db

    def fetch_composer(self, mbid: str) -> dict:
        result = musicbrainzngs.get_artist_by_id(mbid, includes=["works"])
        return result["artist"]

    def search_composers(self, query: str, limit: int = 5) -> list[dict]:
        result = musicbrainzngs.search_artists(artist=query, limit=limit)
        return result.get("artist-list", [])

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

    def search_works(self, query: str, composer_mbid: str, limit: int = 5) -> list[dict]:
        result = musicbrainzngs.search_works(work=query, arid=composer_mbid, limit=limit)
        return result.get("work-list", [])

    def ingest_work(self, composer: Composer, work_mbid: str) -> Work:
        existing = self.db.query(Work).filter(Work.musicbrainz_id == work_mbid).first()
        if existing:
            return existing

        data = musicbrainzngs.get_work_by_id(work_mbid)["work"]
        work = Work(
            title=data["title"],
            composer_id=composer.id,
            musicbrainz_id=work_mbid,
        )
        self.db.add(work)
        self.db.commit()
        self.db.refresh(work)
        return work

    def fetch_recordings_for_work(self, work_mbid: str) -> list[dict]:
        result = musicbrainzngs.get_work_by_id(work_mbid, includes=["recording-rels"])
        return result["work"].get("recording-relation-list", [])

    def fetch_recording_artists(self, recording_mbid: str) -> list[dict]:
        result = musicbrainzngs.get_recording_by_id(recording_mbid, includes=["artist-rels"])
        return result["recording"].get("artist-relation-list", [])

    def _get_or_create_conductor(self, artist: dict) -> Conductor:
        existing = self.db.query(Conductor).filter(
            Conductor.musicbrainz_id == artist["id"]
        ).first()
        if existing:
            return existing
        conductor = Conductor(name=artist["name"], musicbrainz_id=artist["id"])
        self.db.add(conductor)
        self.db.flush()
        return conductor

    def _get_or_create_orchestra(self, artist: dict) -> Orchestra:
        existing = self.db.query(Orchestra).filter(
            Orchestra.musicbrainz_id == artist["id"]
        ).first()
        if existing:
            return existing
        orchestra = Orchestra(
            name=artist["name"],
            country=artist.get("country"),
            musicbrainz_id=artist["id"],
        )
        self.db.add(orchestra)
        self.db.flush()
        return orchestra

    def ingest_recordings(self, work: Work, limit: int = 3) -> list[Recording]:
        """Pull up to `limit` recordings (with conductor/orchestra) for a work."""
        rels = self.fetch_recordings_for_work(work.musicbrainz_id)
        recordings = []

        for rel in rels[:limit]:
            rec_data = rel.get("recording")
            if not rec_data:
                continue

            existing = self.db.query(Recording).filter(
                Recording.musicbrainz_id == rec_data["id"]
            ).first()
            if existing:
                recordings.append(existing)
                continue

            conductor = None
            orchestra = None
            for arel in self.fetch_recording_artists(rec_data["id"]):
                artist = arel.get("artist")
                if not artist:
                    continue
                if arel.get("type") == "conductor":
                    conductor = self._get_or_create_conductor(artist)
                elif arel.get("type") == "performing orchestra":
                    orchestra = self._get_or_create_orchestra(artist)

            length = rec_data.get("length")
            recording = Recording(
                work_id=work.id,
                conductor_id=conductor.id if conductor else None,
                orchestra_id=orchestra.id if orchestra else None,
                duration=int(length) // 1000 if length else None,
                musicbrainz_id=rec_data["id"],
            )
            self.db.add(recording)
            recordings.append(recording)

        self.db.commit()
        return recordings
