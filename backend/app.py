
from flask import Flask, request, render_template, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import requests
import re
import os
import openai
import json
from bs4 import BeautifulSoup

frontend_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend/dist'))
app = Flask(__name__, template_folder=frontend_folder, static_folder=frontend_folder)
CORS(app)
load_dotenv()

# This is a simple in-memory cache. In production, consider using Redis or similar.
CACHED_BOOKS = {}

# Setup OpenAI (SambaNova) client
client = openai.OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url="https://api.sambanova.ai/v1",
)

def fetch_book(book_id):
    index_url = f"https://www.gutenberg.org/files/{book_id}/"
    response = requests.get(index_url)
    if response.status_code != 200:
        return None

    soup = BeautifulSoup(response.text, 'html.parser')

    # Find all rows <tr> inside <tbody> (files list)
    rows = soup.find_all('tr')
    txt_files = []

    for row in rows:
        link = row.find('a')
        if link and link.get('href', '').endswith('.txt'):
            size_text = row.find_all('td')[-2].text.strip() 
            size = parse_size(size_text)
            txt_files.append({
                "filename": link.get('href'),
                "size": size
            })

    if not txt_files:
        return None

    largest_txt = max(txt_files, key=lambda x: x["size"])
    file_url = index_url + largest_txt["filename"]

    file_response = requests.get(file_url)
    if file_response.status_code != 200:
        return None

    return file_response.text

def parse_size(size_str):
    """Parses sizes like '146K' or '1.2M' into bytes."""
    size_str = size_str.upper()
    if size_str.endswith('K'):
        return float(size_str[:-1]) * 1024
    if size_str.endswith('M'):
        return float(size_str[:-1]) * 1024 * 1024
    if size_str.endswith('G'):
        return float(size_str[:-1]) * 1024 * 1024 * 1024
    try:
        return float(size_str)
    except ValueError:
        return 0
    
def split_text(text):
    separator = re.compile(r"<<.*?>>", re.DOTALL)
    values = separator.split(text)
    return values

def analyze_excerpt(excerpt):
    messages = [
        {
            "role": "system",
            "content": "You are a literary analysis assistant."
        },
        {
            "role": "user",
            "content": (
                "Given a text excerpt, your task is to:\n\n"
                "- Identify only the characters who appear or interact in the excerpt.\n"
                "- Identify the interactions specifically between these characters.\n\n"
                "Output ONLY a JSON object structured as follows:\n\n"
                "{\n"
                "  \"nodes\": [\n"
                "    { \"id\": \"Character Name\", \"weight\": CharacterImportance },\n"
                "    ...\n"
                "  ],\n"
                "  \"edges\": [\n"
                "    {\n"
                "      \"source\": \"Character Name\",\n"
                "      \"target\": \"Character Name\",\n"
                "      \"type\": \"interaction\",\n"
                "      \"description\": \"Brief description of the interaction\",\n"
                "      \"label\": \"Short label summarizing the interaction\",\n"
                "      \"weight\": NumericStrengthOfInteraction\n"
                "    },\n"
                "    ...\n"
                "  ]\n"
                "}\n\n"
                "Guidelines:\n"
                "- Only include characters (no places, objects, etc).\n"
                "- Each character must appear once in \"nodes\".\n"
                "- \"weight\" in nodes should reflect character importance (1 = minor, 5 = very important in this excerpt).\n"
                "- Every edge target must be a character from \"nodes\".\n"
                "- Each \"edge\" must describe an interaction.\n"
                "- The \"label\" should briefly summarize the interaction (e.g., \"argues\", \"helps\", \"greets\").\n"
                "- The \"weight\" in edges should reflect the strength or intensity of the interaction (1 = minor, 5 = very strong).\n"
                "- Keep descriptions and labels short.\n"
                "- Output only valid JSON with no extra text.\n\n"
                "Now, analyze the following excerpt:\n\n"
                f"{excerpt}"
            )
        }
    ]


    response = client.chat.completions.create(
        model="Qwen2.5-Coder-32B-Instruct",
        messages=messages,
        temperature=0.1,
        top_p=0.1
    )
    
    return response.choices[0].message.content.strip()

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    book_id = data.get("book_id")
    part_index = data.get("part_index", 3)

    if not book_id: 
        return {"error": "Missing book_id"}, 400
    try:
        book_id = int(book_id)
    except ValueError:
        return {"error": "Book ID must be an integer"}, 400
    
    if book_id in CACHED_BOOKS:
        return {"result": CACHED_BOOKS[book_id]}, 200

    text = fetch_book(book_id)

    if text is None:
        return {"error": "Book not found or unable to fetch"}, 404

    parts = split_text(text)
    part_index = min(part_index, len(parts) - 1)
    excerpt = parts[part_index].strip()[:15000]

    try:         
        analysis = analyze_excerpt(excerpt)
        result = json.loads(analysis)
        CACHED_BOOKS[book_id] = result
        
        return {"result": result}, 200
    except Exception as e:
        return {"error": str(e)}, 500

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/assets/<path:filename>')
def assets(filename):
    return send_from_directory(os.path.join(frontend_folder, 'assets'), filename)

@app.route('/<path:path>')
def catch_all(path):
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5059)
