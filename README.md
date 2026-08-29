# VedaAI Teacher's Toolkit - AI Assessment Pipeline

A full-stack AI application that automates the extraction, mapping, and grading of handwritten student answer sheets against question papers using multimodal AI.

**🌐 Live Demo:** https://veda-ai-submission-silk.vercel.app/

## ⚠️ Important Note for Reviewers (Free Tier Hosting)
Because this project is deployed using completely free cloud services, you might encounter two temporary behaviors during your testing:
1. **"Extracting..." spins for 50+ seconds**: The Python backend is hosted on Render's Free Tier, which automatically puts the server to sleep after 15 minutes of inactivity. When you upload your first file, the frontend might spin on the "Extracting..." screen for about 50-60 seconds while waiting for the Render server to "wake up". All successive uploads will be lightning fast!
2. **Google API Rate Limits**: This project uses the Free Tier of the Google Gemini API, which enforces a strict quota limit (requests per minute). If you test the app rapidly, you may hit this limit, causing the app to hang endlessly on "Extracting..." or flag answers as "API Error". **Fix:** Simply wait 60 seconds for the API quota to reset, refresh the page, and submit the files again.

##  Features
- **Pixel-Perfect UI**: Built with React (Next.js) and Tailwind CSS to flawlessly match the provided Figma design.
- **AI-Powered Extraction**: Uses Google Gemini 3.6 Flash to read handwritten question papers and automatically extract structured JSON lists of questions and sub-parts.
- **Intelligent Mapping & Grading**: The vision model mathematically maps handwritten answers to their corresponding questions, evaluates them for correctness, and assigns partial/full marks.
- **Dynamic Bounding Boxes**: Automatically overlays precise CSS bounding boxes directly onto the scanned PDF image to show exactly where the student wrote their answer.
- **Edge-Case Handling**: Mathematically handles out-of-order answers and explicitly isolates "Unmatched Answers" (when a student writes a fake/extra answer not on the question paper).
- **Multi-Page Support**: Converts PDF pages into base64 images in the backend, allowing the React frontend to natively paginate through multi-page answer sheets.
- **Interactive Image Viewer**: Includes UI controls for Zooming (50% to 200%) and an "Expand All" toggle for grading feedback.

## 🛠️ Architecture
- **Frontend**: Next.js, React, Tailwind CSS, Lucide React (Icons), Axios.
- **Backend**: Python, FastAPI, Uvicorn, Google GenAI SDK (`gemini-3.6-flash`), PyMuPDF (PDF processing), RapidFuzz (String matching).
- **Deployment**: Vercel (Frontend), Render (Backend).

## 💻 Local Development Setup

### 1. Backend Setup
cd backend
python -m venv .venv
.\.venv\Scripts\Activate  # On Windows
pip install -r requirements.txt
Create a `.env` file in the `backend` folder and add your Gemini API Key:
GEMINI_API_KEY=your_google_gemini_api_key_here

Run the FastAPI server:
python main.py

*(The backend runs on http://localhost:8000)*

### 2. Frontend Setup
cd frontend
npm install
npm run dev

*(The frontend runs on http://localhost:3000)*

## 📝 Limitations & Assumptions
- State is managed entirely in-memory on the frontend without a persistent database, per the assignment requirements.
- Extremely faint or heavily overlapping handwriting may occasionally result in slightly shifted bounding boxes due to inherent LLM vision limitations.
- Backend PDF processing utilizes local OS `/tmp` storage before passing base64 strings to the frontend.
