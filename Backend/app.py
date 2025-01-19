from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) 

@app.route('/api/openai', methods=['POST'])
def openai_request():
    try:
        data = request.json
        user_message = data.get("message")
        prices = data.get("prices") 
        
        enriched_message = f"{user_message}\n\nCurrent power prices:\n{prices}"

        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an assistant that provides concise answers to questions about power prices. Avoid explanations and only give out the result straight"
                },
                {
                    "role": "user",
                    "content": enriched_message,
                },
            ],
            temperature=0.2,
        )

        reply = completion.choices[0].message.content
        
        return jsonify({"reply": reply}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)