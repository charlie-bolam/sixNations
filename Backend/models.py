from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

# SQLAlchemy instance (initialized in app.py)
db = SQLAlchemy()

# Association table for many-to-many Team <-> Player
team_players = db.Table(
    'team_players',
    db.Column('team_id', db.Integer, db.ForeignKey('team.id'), primary_key=True),
    db.Column('player_id', db.Integer, db.ForeignKey('player.id'), primary_key=True)
)

class Player(db.Model):
    __tablename__ = 'player'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    position = db.Column(db.String, nullable=False)
    country = db.Column(db.String, nullable=False)
    price = db.Column(db.Float, nullable=False)
    points_per_game = db.Column(db.Float, nullable=False)
    games_played = db.Column(db.Integer, nullable=False)
    total_points = db.Column(db.Float, nullable=False)
    is_injured = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'position': self.position,
            'country': self.country,
            'price': self.price,
            'pointsPerGame': self.points_per_game,
            'gamesPlayed': self.games_played,
            'totalPoints': self.total_points,
            'isInjured': self.is_injured
        }

class Team(db.Model):
    __tablename__ = 'team'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    players = db.relationship('Player', secondary=team_players, lazy='subquery',
                              backref=db.backref('teams', lazy=True))
    captain_id = db.Column(db.Integer, db.ForeignKey('player.id'), nullable=True)
    substitute_id = db.Column(db.Integer, db.ForeignKey('player.id'), nullable=True)
    total_price = db.Column(db.Float, nullable=False, default=0)
    total_points = db.Column(db.Float, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'playerIds': [p.id for p in self.players],
            'captainId': self.captain_id,
            'substituteId': self.substitute_id,
            'totalPrice': self.total_price,
            'totalPoints': self.total_points,
            'createdAt': self.created_at.isoformat()
        }

class TeamResponse:
    def __init__(self, team, players):
        self.team = team
        self.players = players

    def to_dict(self):
        return {
            'team': self.team.to_dict(),
            'players': [p.to_dict() for p in self.players]
        }
