from flask import Flask
from flask_cors import CORS
from routes import api
from models import db, Player


app = Flask(__name__)

# configure database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sixnations.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# initialize extensions
db.init_app(app)

# Enable CORS for all routes
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register the API blueprint
app.register_blueprint(api)

# create tables & seed initial data if necessary
with app.app_context():
    db.create_all()
    if Player.query.count() == 0:
        print("Seeding initial players...")
        # replicate original mock list
        initial = [
            Player(id=1, name="Owen Farrell", position="Fly-Half", country="England", price=8.5, points_per_game=12.5, games_played=4, total_points=50),
            Player(id=2, name="Maro Itoje", position="Lock", country="England", price=7.8, points_per_game=11.2, games_played=4, total_points=44.8),
            Player(id=3, name="Billy Vunipola", position="Number 8", country="England", price=7.2, points_per_game=10.5, games_played=3, total_points=31.5),
            Player(id=4, name="Jonny May", position="Wing", country="England", price=6.9, points_per_game=9.8, games_played=4, total_points=39.2),
            Player(id=5, name="Jamie George", position="Hooker", country="England", price=7.5, points_per_game=10.3, games_played=4, total_points=41.2),
            Player(id=6, name="Jonathan Sexton", position="Fly-Half", country="Ireland", price=8.8, points_per_game=13.2, games_played=4, total_points=52.8),
            Player(id=7, name="Dan Sheehan", position="Hooker", country="Ireland", price=7.6, points_per_game=11.4, games_played=4, total_points=45.6),
            Player(id=8, name="Peter O'Mahony", position="Flanker", country="Ireland", price=7.1, points_per_game=10.2, games_played=4, total_points=40.8),
            Player(id=9, name="Andrew Porter", position="Prop", country="Ireland", price=7.3, points_per_game=10.5, games_played=3, total_points=31.5),
            Player(id=10, name="Hugo Keenan", position="Full-Back", country="Ireland", price=7.4, points_per_game=10.9, games_played=4, total_points=43.6),
            Player(id=11, name="Antoine Dupont", position="Scrum-Half", country="France", price=9.2, points_per_game=14.1, games_played=4, total_points=56.4),
            Player(id=12, name="Romain Ntamack", position="Fly-Half", country="France", price=8.6, points_per_game=12.8, games_played=4, total_points=51.2),
            Player(id=13, name="Demba Bamba", position="Prop", country="France", price=7.0, points_per_game=9.8, games_played=3, total_points=29.4),
            Player(id=14, name="Cyril Cazeaux", position="Lock", country="France", price=7.2, points_per_game=10.5, games_played=4, total_points=42.0),
            Player(id=15, name="Teddy Thomas", position="Wing", country="France", price=6.8, points_per_game=9.5, games_played=4, total_points=38.0),
            Player(id=16, name="Dan Sheehan", position="Hooker", country="Wales", price=6.9, points_per_game=9.2, games_played=3, total_points=27.6),
            Player(id=17, name="Josh Adams", position="Wing", country="Wales", price=6.5, points_per_game=8.8, games_played=4, total_points=35.2),
            Player(id=18, name="Rhys Webb", position="Scrum-Half", country="Wales", price=6.7, points_per_game=9.1, games_played=4, total_points=36.4),
            Player(id=19, name="Alun Wyn Jones", position="Lock", country="Wales", price=6.8, points_per_game=8.9, games_played=3, total_points=26.7),
            Player(id=20, name="Liam Williams", position="Centre", country="Wales", price=6.6, points_per_game=8.7, games_played=4, total_points=34.8),
            Player(id=21, name="Finn Russell", position="Fly-Half", country="Scotland", price=8.1, points_per_game=11.8, games_played=4, total_points=47.2),
            Player(id=22, name="Stuart Hogg", position="Full-Back", country="Scotland", price=7.7, points_per_game=11.2, games_played=4, total_points=44.8),
            Player(id=23, name="John Barclay", position="Flanker", country="Scotland", price=6.8, points_per_game=9.4, games_played=4, total_points=37.6),
            Player(id=24, name="Cameron Henderson", position="Hooker", country="Scotland", price=6.9, points_per_game=9.3, games_played=3, total_points=27.9),
            Player(id=25, name="Darcy Graham", position="Wing", country="Scotland", price=6.7, points_per_game=9.0, games_played=4, total_points=36.0),
            Player(id=26, name="Paolo Garbski", position="Fly-Half", country="Italy", price=6.8, points_per_game=8.9, games_played=4, total_points=35.6),
            Player(id=27, name="Matteo Riccioni", position="Prop", country="Italy", price=6.4, points_per_game=8.2, games_played=3, total_points=24.6),
            Player(id=28, name="Marco Lazzaroni", position="Lock", country="Italy", price=6.5, points_per_game=8.5, games_played=4, total_points=34.0),
            Player(id=29, name="Michele Lamaro", position="Flanker", country="Italy", price=6.6, points_per_game=8.7, games_played=4, total_points=34.8),
            Player(id=30, name="Monty Ioane", position="Wing", country="Italy", price=6.2, points_per_game=8.0, games_played=4, total_points=32.0)
        ]
        db.session.add_all(initial)
        db.session.commit()

@app.route('/health', methods=['GET'])
def health():
    return {'status': 'ok'}, 200

if __name__ == '__main__':
    print("🏉 Six Nations Fantasy Backend starting...")
    print("🔗 API running at http://localhost:5201")
    print("📊 Open frontend at http://localhost:8000")
    app.run(host='0.0.0.0', port=5201, debug=False, use_reloader=False)
