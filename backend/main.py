from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import composers, works, conductors, orchestras, recordings, auth

app = FastAPI(title="OpusBox API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(composers.router)
app.include_router(works.router)
app.include_router(conductors.router)
app.include_router(orchestras.router)
app.include_router(recordings.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "OpusBox API"}
