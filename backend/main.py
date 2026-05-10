from fastapi import FastAPI
from app.routers import composers

app = FastAPI(title="OpusBox API")

app.include_router(composers.router)

@app.get("/")
def root():
    return {"message": "OpusBox API"}
