from app.database import SessionLocal
from app.models import *
from app.ingestion.musicbrainz import MusicBrainzIngester

# MusicBrainz IDs for a few famous composers
COMPOSERS = {
    "Beethoven": "1f9df192-a621-4f54-8850-2c5373b7eac9",
    "Mozart": "b972f589-fb0e-474e-b64a-803b0364fa75",
    "Bach": "24f1766e-9635-4d58-a4d4-9413f9f98a4c",
}

def main():
    db = SessionLocal()
    ingester = MusicBrainzIngester(db)

    for name, mbid in COMPOSERS.items():
        print(f"Ingesting {name}...")
        composer = ingester.ingest_composer(mbid)
        print(f"  Composer saved: {composer.name}")
        works = ingester.ingest_works(composer, mbid)
        print(f"  Works saved: {len(works)}")

    db.close()

if __name__ == "__main__":
    main()
