import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from PIL import Image

load_dotenv("D:\\Veda_AI_V2\\backend\\.env")
api_key = os.environ.get("GEMINI_API_KEY")

try:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model='gemini-3.6-flash',
        contents="Hello, just testing the API",
        config=types.GenerateContentConfig(
            temperature=0.1
        )
    )
    print("SUCCESS", response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
