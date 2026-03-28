from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from routes.movie_routes import router as movie_router
from fastapi.middleware.cors import CORSMiddleware
import os

print("MONGO_URI:", os.getenv("MONGO_URI"))

app = FastAPI(
    title="filmlib API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(movie_router)

@app.get("/")
def root():
    return {"message": "Welcome to filmlib"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={
            "message": "Validation error",
            "details": exc.errors()
        },
    )