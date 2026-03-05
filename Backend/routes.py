from flask import Blueprint, request, jsonify
from services import get_mock_players
from models import Team, TeamResponse

api = Blueprint('api', __name__, url_prefix='/api')

# In-memory storage for teams
teams = {}
next_team_id = 1

# --- PLAYERS ENDPOINTS ---

@api.route('/players', methods=['GET'])
def get_players():
    """Get all players with optional filtering"""
    country = request.args.get('country')
    position = request.args.get('position')
    
    players = get_mock_players()
    
    if country:
        players = [p for p in players if p.country.lower() == country.lower()]
    
    if position:
        players = [p for p in players if p.position.lower() == position.lower()]
    
    return jsonify([p.to_dict() for p in players])

@api.route('/players/<int:player_id>', methods=['GET'])
def get_player(player_id):
    """Get a specific player"""
    players = get_mock_players()
    player = next((p for p in players if p.id == player_id), None)
    
    if not player:
        return jsonify({'error': 'Player not found'}), 404
    
    return jsonify(player.to_dict())

@api.route('/players/countries', methods=['GET'])
def get_countries():
    """Get list of all countries"""
    players = get_mock_players()
    countries = sorted(list(set(p.country for p in players)))
    return jsonify(countries)

@api.route('/players/positions', methods=['GET'])
def get_positions():
    """Get list of all positions"""
    players = get_mock_players()
    positions = sorted(list(set(p.position for p in players)))
    return jsonify(positions)

# --- TEAMS ENDPOINTS ---

@api.route('/teams', methods=['POST'])
def create_team():
    """Create a new team"""
    global next_team_id
    
    data = request.get_json()
    all_players = get_mock_players()
    
    team = Team(
        id=next_team_id,
        name=data.get('name', 'Unnamed Team'),
        player_ids=data.get('playerIds', []),
        total_price=0,
        total_points=0
    )
    
    # Calculate totals
    selected_players = [p for p in all_players if p.id in team.player_ids]
    team.total_price = sum(p.price for p in selected_players)
    team.total_points = sum(p.total_points for p in selected_players)
    
    teams[next_team_id] = team
    next_team_id += 1
    
    return jsonify(team.to_dict()), 201

@api.route('/teams', methods=['GET'])
def get_teams():
    """Get all saved teams"""
    return jsonify([t.to_dict() for t in teams.values()])

@api.route('/teams/<int:team_id>', methods=['GET'])
def get_team(team_id):
    """Get a specific team with its players"""
    team = teams.get(team_id)
    
    if not team:
        return jsonify({'error': 'Team not found'}), 404
    
    all_players = get_mock_players()
    selected_players = [p for p in all_players if p.id in team.player_ids]
    
    response = TeamResponse(team=team, players=selected_players)
    return jsonify(response.to_dict())

@api.route('/teams/<int:team_id>', methods=['DELETE'])
def delete_team(team_id):
    """Delete a team"""
    if team_id not in teams:
        return jsonify({'error': 'Team not found'}), 404
    
    del teams[team_id]
    return '', 204

@api.route('/teams/validate', methods=['POST'])
def validate_team():
    """Validate a team configuration"""
    player_ids = request.get_json()
    
    BUDGET = 120.0
    all_players = get_mock_players()
    selected_players = [p for p in all_players if p.id in player_ids]
    
    total_price = sum(p.price for p in selected_players)
    total_points = sum(p.total_points for p in selected_players)
    
    country_count = {}
    for p in selected_players:
        country_count[p.country] = country_count.get(p.country, 0) + 1
    
    position_count = {}
    for p in selected_players:
        position_count[p.position] = position_count.get(p.position, 0) + 1
    
    errors = []
    
    if len(selected_players) != 15:
        errors.append(f"A team must have exactly 15 players. You have {len(selected_players)}.")
    
    if total_price > BUDGET:
        errors.append(f"Team exceeds budget. Total: £{total_price}m vs £{BUDGET}m budget.")
    
    for country, count in country_count.items():
        if count > 4:
            errors.append(f"Maximum 4 players per country. {country}: {count}")
    
    is_valid = len(errors) == 0
    
    # Count by position
    front_row = len([p for p in selected_players if p.position in ["Prop", "Hooker"]])
    locks = len([p for p in selected_players if p.position == "Lock"])
    back_row = len([p for p in selected_players if p.position in ["Number 8", "Flanker"]])
    halfbacks = len([p for p in selected_players if p.position in ["Scrum-Half", "Fly-Half"]])
    three_quarters = len([p for p in selected_players if p.position in ["Centre", "Wing"]])
    fullbacks = len([p for p in selected_players if p.position == "Full-Back"])
    
    return jsonify({
        'isValid': is_valid,
        'errors': errors,
        'summary': {
            'totalPlayers': len(selected_players),
            'totalPrice': round(total_price, 2),
            'budgetRemaining': round(BUDGET - total_price, 2),
            'totalPoints': round(total_points, 2),
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
