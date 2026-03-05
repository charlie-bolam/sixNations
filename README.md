# Six Nations Fantasy Team Builder

A web application for building and testing fantasy six nations rugby teams with real player prices and stats.

## Project Structure

```
sixNations/
├── Backend/                          # Python Flask backend
│   ├── app.py                        # Flask application entry point
│   ├── routes.py                     # API endpoints
│   ├── models.py                     # Player and Team models
│   └── (data stored in SQLite via SQLAlchemy)
│   ├── requirements.txt              # Python dependencies
│   └── .gitignore                    # Git ignore rules
│
└── Frontend/                         # HTML/CSS/JS frontend
    ├── index.html                    # Main page
    ├── style.css                     # Styling
    └── script.js                     # Application logic
```

## Features

### Team Builder
- **Player Selection**: Browse and select 30 real Six Nations players
- **Budget Management**: £120m salary cap with real player prices
- **Team Validation**: 
  - Exactly 15 players required
  - Maximum 4 players per country
  - Budget constraints enforced
- **Statistics**:
  - Total points tracking
  - Country breakdown (color-coded for violations)
  - Position breakdown
  - Budget remaining

### Filters
- Filter by country (England, Ireland, France, Wales, Scotland, Italy)
- Filter by position (Prop, Hooker, Lock, Flanker, Number 8, Scrum-Half, Fly-Half, Centre, Wing, Full-Back)

### Team Persistence
- Save multiple teams with custom names
- View and manage saved teams
- Delete saved teams

## Getting Started

### Prerequisites
- .NET 8.0 SDK or later
- A modern web browser
- A terminal/command prompt

##Python 3.8 or later
- pip (Python package manager)
- A modern web browser
- A terminal/command prompt

### Running the Backend

1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the application:
   ```bash
   python app.py
   ```

The backend will start on `http://localhost:5201`
   ```bash
   cd Frontend
   ```

2. Start a local web server. Choose one:
   
   **Using Python 3:**
   ```bash
   python -m http.server 8000
   ```
   
   **Using Python 2:**
   ```bash
   python -m SimpleHTTPServer 8000
   ```
   
   **Using Node.js (http-server):**
   ```bash
   npx http-server
   ```

3. Open your browser to `http://localhost:8000` (or the port shown by your server)

## API Endpoints

### Players
- `GET /api/players` - Get all players (supports `?country=` and `?position=` filters)
- `POST /api/players` - Add a new player (see frontend 'Add Player' button)
- `PUT /api/players/{id}` - Update an existing player (also accessible via edit icon in player list)
- `DELETE /api/players/{id}` - Remove a player (API only)
- `GET /api/players/{id}` - Get a specific player
- `PUT /api/players/{id}` - Update an existing player
- `DELETE /api/players/{id}` - Remove a player
- `GET /api/players/countries` - Get list of countries
- `GET /api/players/positions` - Get list of positions

*All endpoints operate on an in-memory list, so changes reset when the server restarts.*

### Teams
- `POST /api/teams` - Create a team
- `GET /api/teams` - Get all saved teams
- `GET /api/teams/{id}` - Get a specific team
- `DELETE /api/teams/{id}` - Delete a team
- `POST /api/teams/validate` - Validate a team (array of player IDs in body)

## Data

The application uses a SQLite database seeded with 30 real rugby players from the Six Nations on first run:
- **5 players per country** (England, Ireland, France, Wales, Scotland, Italy)
- **Real positions** and player types
- **Prices** ranging from £6.2m to £9.2m
- **Stats** including points and games played

The `Backend/app.py` file contains the seeding logic; you can modify it to fetch live data from the Six Nations Fantasy site or any other source.

## Development

### Adding Real Player Data
1. Edit `Backend/app.py` seed section or write a migration to pull from an API
2. Run the backend to recreate and reseed the database (delete `sixnations.db` if needed)
3. Player records will persist in `sixnations.db`

### Modifying Team Rules
Edit the Python 3.8+ is installed: `python --version`
- Check if port 5201 is already in use
- Try installing pyopenssl for SSL: `pip install pyopenssl`
- For development without SSL: Edit `app.py` and change the last line to use `app.run(host='0.0.0.0', port=5201, debug=True)
- Team size (currently 15)
- Position requirements

## Troubleshooting

### Backend won't start
- Ensure .NET 8.0 SDK is installed: `dotnet --version`
- Check if port 5201 is already in use
- Try: `dotnet run --urls "https://localhost:5201"`

### Frontend can't connect to API
- Make sure backend is running on `https://localhost:5201`
- Check browser console for CORS errors
- Verify CORS policy is enabled in `Program.cs`

### Players not loading
- Open browser DevTools (F12) → Console and check for errors
- Ensure backend is running and accessible
- Check Network tab to see API responses

## Future Enhancements

- Integration with real Six Nations Fantasy API for live prices
- Player search and sorting
- Compare teams
- Leaderboard
- Mobile optimization
- User authentication and cloud save

## License

This project is for educational purposes.
