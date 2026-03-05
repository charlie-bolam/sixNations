from flask import Blueprint, request, jsonify
from models import db, Player, Team, TeamResponse

api = Blueprint('api', __name__, url_prefix='/api')


# --- PLAYERS ENDPOINTS ---

@api.route('/players', methods=['GET'])
def list_players():
    """Get all players with optional filtering"""
    country = request.args.get('country')
    position = request.args.get('position')
    
    query = Player.query
    if country:
        query = query.filter(Player.country.ilike(country))
    if position:
        query = query.filter(Player.position.ilike(position))
    players = query.all()
    return jsonify([p.to_dict() for p in players])

@api.route('/players', methods=['POST'])
def create_player():
    """Add a new player to the database"""
    data = request.get_json()
    player = Player(
        name=data.get('name',''),
        position=data.get('position',''),
        country=data.get('country',''),
        price=float(data.get('price',0)),
        points_per_game=float(data.get('points_per_game',0)),
        games_played=int(data.get('games_played',0)),
        total_points=float(data.get('total_points',0)),
        is_injured=bool(data.get('is_injured', False))
    )
    db.session.add(player)
    db.session.commit()
    return jsonify(player.to_dict()), 201

@api.route('/players/<int:player_id>', methods=['GET'])
def fetch_player(player_id):
    """Get a specific player"""
    player = Player.query.get(player_id)
    if not player:
        return jsonify({'error': 'Player not found'}), 404
    return jsonify(player.to_dict())

@api.route('/players/<int:player_id>', methods=['PUT'])
def update_player_route(player_id):
    """Update an existing player"""
    player = Player.query.get(player_id)
    if not player:
        return jsonify({'error': 'Player not found'}), 404
    data = request.get_json()
    player.name = data.get('name', player.name)
    player.position = data.get('position', player.position)
    player.country = data.get('country', player.country)
    player.price = float(data.get('price', player.price))
    player.points_per_game = float(data.get('points_per_game', player.points_per_game))
    player.games_played = int(data.get('games_played', player.games_played))
    player.total_points = float(data.get('total_points', player.total_points))
    player.is_injured = bool(data.get('is_injured', player.is_injured))
    db.session.commit()
    return jsonify(player.to_dict())

@api.route('/players/<int:player_id>', methods=['DELETE'])
def delete_player_route(player_id):
    """Remove a player from the database"""
    player = Player.query.get(player_id)
    if not player:
        return jsonify({'error': 'Player not found'}), 404
    db.session.delete(player)
    db.session.commit()
    return '', 204

@api.route('/players/countries', methods=['GET'])
def get_countries():
    """Get list of all countries"""
    countries = [row[0] for row in db.session.query(Player.country).distinct().order_by(Player.country).all()]
    return jsonify(countries)

@api.route('/players/positions', methods=['GET'])
def get_positions():
    """Get list of all positions"""
    positions = [row[0] for row in db.session.query(Player.position).distinct().order_by(Player.position).all()]
    return jsonify(positions)

# --- TEAMS ENDPOINTS ---

@api.route('/teams', methods=['POST'])
def create_team():
    """Create a new team"""
    data = request.get_json()
    player_ids = data.get('playerIds', [])
    captain_id = data.get('captainId')
    players = Player.query.filter(Player.id.in_(player_ids)).all()

    team = Team(
        name=data.get('name', 'Unnamed Team'),
        players=players,
        captain_id=captain_id
    )
    # calculate totals
    team.total_price = sum(p.price for p in players)
    total_points = sum(p.total_points for p in players)
    # Double captain's points
    if captain_id:
        captain = Player.query.get(captain_id)
        if captain:
            total_points += captain.total_points
    team.total_points = total_points

    db.session.add(team)
    db.session.commit()
    return jsonify(team.to_dict()), 201

@api.route('/teams', methods=['GET'])
def get_teams():
    """Get all saved teams"""
    teams = Team.query.all()
    return jsonify([t.to_dict() for t in teams])

@api.route('/teams/<int:team_id>', methods=['GET'])
def get_team(team_id):
    """Get a specific team with its players"""
    team = Team.query.get(team_id)
    if not team:
        return jsonify({'error': 'Team not found'}), 404
    response = TeamResponse(team=team, players=team.players)
    return jsonify(response.to_dict())

@api.route('/teams/<int:team_id>', methods=['DELETE'])
def delete_team(team_id):
    """Delete a team"""
    team = Team.query.get(team_id)
    if not team:
        return jsonify({'error': 'Team not found'}), 404
    db.session.delete(team)
    db.session.commit()
    return '', 204

@api.route('/teams/validate', methods=['POST'])
def validate_team():
    """Validate a team configuration"""
    data = request.get_json()
    player_ids = data.get('playerIds', []) if isinstance(data, dict) else data
    captain_id = data.get('captainId') if isinstance(data, dict) else None
    
    BUDGET = 120.0
    selected_players = Player.query.filter(Player.id.in_(player_ids)).all()
    
    total_price = sum(p.price for p in selected_players)
    total_points = sum(p.total_points for p in selected_players)
    
    # Double captain's points
    if captain_id:
        captain = Player.query.get(captain_id)
        if captain:
            total_points += captain.total_points
    
    country_count = {}
    for p in selected_players:
        country_count[p.country] = country_count.get(p.country, 0) + 1
    
    position_count = {}
    for p in selected_players:
        position_count[p.position] = position_count.get(p.position, 0) + 1
    
    errors = []
    
    if len(selected_players) != 16:
        errors.append(f"A team must have exactly 16 players (including 1 sub). You have {len(selected_players)}.")
    
    if total_price > BUDGET:
        errors.append(f"Team exceeds budget. Total: £{total_price}m vs £{BUDGET}m budget.")
    
    for country, count in country_count.items():
        if count > 4:
            errors.append(f"Maximum 4 players per country. {country}: {count}")
    
    if not captain_id:
        errors.append("You must select a captain.")
    elif captain_id not in [p.id for p in selected_players]:
        errors.append("Captain must be one of your selected players.")
    
    is_valid = len(errors) == 0
    
    # Count by position
    front_row = len([p for p in selected_players if p.position in ["Prop", "Hooker"]])
    locks = len([p for p in selected_players if p.position == "Lock"])
    back_row = len([p for p in selected_players if p.position in ["Number 8", "Flanker"]])
    halfbacks = len([p for p in selected_players if p.position in ["Scrum-Half", "Fly-Half"]])
    three_quarters = len([p for p in selected_players if p.position in ["Centre", "Wing"]])
    fullbacks = len([p for p in selected_players if p.position == "Full-Back"])
    
    captain_name = None
    if captain_id:
        captain = Player.query.get(captain_id)
        if captain:
            captain_name = captain.name
    
    return jsonify({
        'isValid': is_valid,
        'errors': errors,
        'summary': {
            'totalPlayers': len(selected_players),
            'totalPrice': round(total_price, 2),
            'budgetRemaining': round(BUDGET - total_price, 2),
            'totalPoints': round(total_points, 2),
            'captainName': captain_name,
            'playersByCountry': country_count,
            'playersByPosition': position_count,
            'lineup': {
                'frontRow': front_row,
                'locks': locks,
                'backRow': back_row,
                'halfbacks': halfbacks,
                'threeQuarters': three_quarters,
                'fullbacks': fullbacks
            }
        }
    })
