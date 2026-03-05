from dataclasses import dataclass, asdict
from datetime import datetime
from typing import List, Optional

@dataclass
class Player:
    id: int
    name: str
    position: str
    country: str
    price: float
    points_per_game: float
    games_played: int
    total_points: float
    is_injured: bool = False
    
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

@dataclass
class Team:
    id: int
    name: str
    player_ids: List[int]
    total_price: float
    total_points: float
    created_at: str = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow().isoformat()
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'playerIds': self.player_ids,
            'totalPrice': self.total_price,
            'totalPoints': self.total_points,
            'createdAt': self.created_at
        }

@dataclass
class TeamResponse:
    team: Team
    players: List[Player]
    
    def to_dict(self):
        return {
            'team': self.team.to_dict(),
            'players': [p.to_dict() for p in self.players]
        }
