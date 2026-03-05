from flask import Flask
from flask_cors import CORS
from routes import api

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register the API blueprint
app.register_blueprint(api)

@app.route('/health', methods=['GET'])
def health():
    return {'status': 'ok'}, 200

if __name__ == '__main__':
    print("🏉 Six Nations Fantasy Backend starting...")
    print("🔗 API running at http://localhost:5201")
    print("📊 Open frontend at http://localhost:8000")
    app.run(host='0.0.0.0', port=5201, debug=False, use_reloader=False)
