from fastapi import FastAPI

app = FastAPI(title="ACBC Survey Engine")


@app.get("/")
async def root():
    return {"status": "ok", "service": "ACBC Survey Engine"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
