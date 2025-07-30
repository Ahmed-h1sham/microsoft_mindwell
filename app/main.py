from fastapi import FastAPI
from app.database import Base, engine
from app.routes import image, auth  # use absolute imports!

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(image.router)
app.include_router(auth.router)

