# Mood Detection Backend API

This project is a FastAPI backend for mood detection using uploaded images and user authentication. It stores mood history and provides personalized recommendations.

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Create a Virtual Environment

#### Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

#### macOS / Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Create the Database (SQLite)

```bash
# Run this in Python shell or script:
from app.database import Base, engine
from app import models

Base.metadata.create_all(bind=engine)
```

This will generate a `mood_logs.db` file with the necessary tables.

### 5. Start the Backend Server

```bash
uvicorn app.main:app --reload
```

Visit your app at:

```
http://127.0.0.1:8000
```

---

## 🔐 Authentication

Use the `/login` endpoint to obtain a token. Then include it in requests that require auth:

```
Authorization: Bearer <your_token>
```

---

## 📬 API Endpoints

| Method | Endpoint    | Description               | Auth Required |
| ------ | ----------- | ------------------------- | ------------- |
| POST   | `/register` | Register new user         | No            |
| POST   | `/login`    | Get JWT token             | No            |
| POST   | `/upload`   | Upload image, detect mood | Yes           |
| GET    | `/history`  | Get past mood logs        | Yes           |

---

## 🧪 Try it Out

Go to:

```
http://127.0.0.1:8000/docs
```

Use the Swagger UI to test the endpoints interactively.

---

## 🧰 Optional: Freeze Requirements

If you add dependencies:

```bash
pip freeze > requirements.txt
```

---

## 🧼 Deleting the Database (Reset)

To reset the project:

```bash
rm mood_logs.db  # or manually delete the file
```

Then re-run the DB setup step above.

---

## 📦 Notes

* Make sure `models.py`, `schemas.py`, and `crud.py` are updated as shown in the latest structure.
* AI model logic is handled inside `ai_model.py`.
* Uploads are validated to ensure valid image input.
