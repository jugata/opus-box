from fastapi import FastAPI
from app.routers import composers, works, conductors, orchestras, recordings

app = FastAPI(title="OpusBox API")

app.include_router(composers.router)
app.include_router(works.router)
app.include_router(conductors.router)
app.include_router(orchestras.router)
app.include_router(recordings.router)

@app.get("/")
def root():
    return {"message": "OpusBox API"}
