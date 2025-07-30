from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routes import image, auth  # use absolute imports
import os

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Mount static files
app.mount("/static", StaticFiles(directory="views"), name="static")

# API Routes
app.include_router(image.router)
app.include_router(auth.router)

# Route for the main page
@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open(os.path.join("views", "index.html"), "r") as f:
        return f.read()

# Routes for other pages
@app.get("/login", response_class=HTMLResponse)
async def read_login():
    with open(os.path.join("views", "login.html"), "r") as f:
        return f.read()

@app.get("/register", response_class=HTMLResponse)
async def read_register():
    with open(os.path.join("views", "register.html"), "r") as f:
        return f.read()

