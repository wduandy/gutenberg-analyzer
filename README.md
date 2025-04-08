# Gutenberg Analyzer

This project is divided into two main folders:

- **backend/** — Flask app (Python)
- **frontend/** — Frontend app (React)

The backend serves the built frontend files after building.

---

## 🔥 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/wduandy/gutenberg-analyzer.git
cd gutenberg-analyzer
```

---

### 2. Backend Setup (Python / Flask)

1. Create a virtual environment:

```bash
python3 -m venv venv
```

2. Activate the virtual environment:

- On **Linux/macOS**:

  ```bash
  source venv/bin/activate
  ```

- On **Windows**:

  ```bash
  venv\Scripts\activate
  ```

3. Install backend dependencies:

```bash
cd backend
pip install -r requirements.txt
```

---

### 3. Frontend Setup (Node.js)

1. Navigate to the frontend folder:

```bash
cd frontend
```

2. Install frontend dependencies:

```bash
npm install
```

3. Build the frontend for production:

```bash
npm run build
```

> This will generate the production-ready files inside `frontend/dist/`.

---

### 4. Run the Backend Server

Navigate back to the backend folder (if you're not already there):

```bash
cd backend
```

Run the Flask server:

```bash
python3 app.py
```

The server will be available at:

```
http://localhost:5059
```

✅ It will serve both your backend APIs and the built frontend.

---

## 📁 Project Structure

```
/backend
    app.py
    requirements.txt
/frontend
    /src
    package.json
    vite.config.js
    /dist (generated after build)
```

---

## ⚙️ Notes

- Make sure you have **Python 3.8+** and **Node.js 23+** installed.
- The backend serves static files and API routes together.
