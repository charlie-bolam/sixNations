const API_BASE_URL = 'http://localhost:5201/api';

let allPlayers = [];
let selectedPlayerIds = [];
let captainId = null;
let substituteId = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    await loadPlayers();
    await loadCountries();
    await loadPositions();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('countryFilter').addEventListener('change', filterPlayers);
    document.getElementById('positionFilter').addEventListener('change', filterPlayers);
    document.getElementById('clearTeam').addEventListener('click', clearTeam);
    document.getElementById('saveTeam').addEventListener('click', showSaveModal);
    document.getElementById('addPlayerBtn').addEventListener('click', () => showPlayerModal());

    // Modal controls
    const modal = document.getElementById('saveModal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelSave');
    const confirmBtn = document.getElementById('confirmSave');

    const playerModal = document.getElementById('playerModal');
    const closePlayer = document.querySelector('.close-player');
    const cancelPlayer = document.getElementById('cancelPlayer');
    const confirmPlayer = document.getElementById('confirmPlayer');

    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    cancelBtn.addEventListener('click', () => modal.style.display = 'none');
    confirmBtn.addEventListener('click', saveTeam);

    closePlayer.addEventListener('click', () => playerModal.style.display = 'none');
    cancelPlayer.addEventListener('click', () => playerModal.style.display = 'none');
    confirmPlayer.addEventListener('click', savePlayer);

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
        if (e.target === playerModal) {
            playerModal.style.display = 'none';
        }
    });
}

// Load players from API
async function loadPlayers() {
    try {
        const response = await fetch(`${API_BASE_URL}/players`);
        if (!response.ok) throw new Error('Failed to load players');

        allPlayers = await response.json();
        renderPlayers(allPlayers);
    } catch (error) {
        console.error('Error loading players:', error);
        document.getElementById('playerList').innerHTML =
            '<p class="empty-message">Error loading players. Make sure the backend is running on localhost:5201</p>';
    }
}

// Load countries for filter
async function loadCountries() {
    try {
        const response = await fetch(`${API_BASE_URL}/players/countries`);
        if (!response.ok) throw new Error('Failed to load countries');

        const countries = await response.json();
        const select = document.getElementById('countryFilter');

        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading countries:', error);
    }
}

// Load positions for filter
async function loadPositions() {
    try {
        const response = await fetch(`${API_BASE_URL}/players/positions`);
        if (!response.ok) throw new Error('Failed to load positions');

        const positions = await response.json();
        const select = document.getElementById('positionFilter');

        positions.forEach(position => {
            const option = document.createElement('option');
            option.value = position;
            option.textContent = position;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading positions:', error);
    }
}

// ----------------------------------
// Player management helpers
// ----------------------------------

function showPlayerModal(player = null) {
    const modal = document.getElementById('playerModal');
    const title = document.getElementById('playerModalTitle');

    if (player) {
        title.textContent = 'Edit Player';
        document.getElementById('playerId').value = player.id;
        document.getElementById('playerName').value = player.name;
        document.getElementById('playerCountry').value = player.country;
        document.getElementById('playerPosition').value = player.position;
        document.getElementById('playerPrice').value = player.price;
        document.getElementById('playerPPG').value = player.pointsPerGame;
        document.getElementById('playerGames').value = player.gamesPlayed;
        document.getElementById('playerTotal').value = player.totalPoints;
    } else {
        title.textContent = 'Add Player';
        document.getElementById('playerId').value = '';
        document.getElementById('playerName').value = '';
        document.getElementById('playerCountry').value = '';
        document.getElementById('playerPosition').value = '';
        document.getElementById('playerPrice').value = '';
        document.getElementById('playerPPG').value = '';
        document.getElementById('playerGames').value = '';
        document.getElementById('playerTotal').value = '';
    }
    modal.classList.add('show');
}

async function savePlayer() {
    const id = document.getElementById('playerId').value;
    const data = {
        name: document.getElementById('playerName').value.trim(),
        country: document.getElementById('playerCountry').value.trim(),
        position: document.getElementById('playerPosition').value.trim(),
        price: parseFloat(document.getElementById('playerPrice').value) || 0,
        points_per_game: parseFloat(document.getElementById('playerPPG').value) || 0,
        games_played: parseInt(document.getElementById('playerGames').value) || 0,
        total_points: parseFloat(document.getElementById('playerTotal').value) || 0
    };

    let url = `${API_BASE_URL}/players`;
    let method = 'POST';
    if (id) {
        url += `/${id}`;
        method = 'PUT';
    }

    try {
        const resp = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!resp.ok) throw new Error('Failed to save');
        await loadPlayers();
        await loadCountries();
        await loadPositions();
        document.getElementById('playerModal').classList.remove('show');
    } catch (e) {
        alert('Error saving player');
        console.error(e);
    }
}

// Render players
function renderPlayers(players) {
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = '';

    if (players.length === 0) {
        playerList.innerHTML = '<p class="empty-message">No players found</p>';
        return;
    }

    players.forEach(player => {
        const card = document.createElement('div');
        card.className = `player-card ${selectedPlayerIds.includes(player.id) ? 'selected' : ''}`;
        card.innerHTML = `
            <div class="player-info">
                <div class="player-name">${player.name}</div>
                <div class="player-details">
                    <span class="player-position">${player.position}</span>
                    <span class="player-country">${player.country}</span>
                </div>
            </div>
            <div class="player-stats">
                <div class="player-price">£${player.price.toFixed(1)}m</div>
                <div class="player-points">${player.totalPoints} pts</div>
            </div>
            <button class="edit-player-btn" title="Edit">✎</button>
        `;

        // clicking card toggles selection
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('edit-player-btn')) {
                togglePlayer(player);
            }
        });
        // edit button
        card.querySelector('.edit-player-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            showPlayerModal(player);
        });
        playerList.appendChild(card);
    });
}

// Filter players
function filterPlayers() {
    const country = document.getElementById('countryFilter').value;
    const position = document.getElementById('positionFilter').value;

    const filtered = allPlayers.filter(player => {
        return (!country || player.country === country) &&
            (!position || player.position === position);
    });

    renderPlayers(filtered);
}

// Toggle player selection
function togglePlayer(player) {
    const index = selectedPlayerIds.indexOf(player.id);

    if (index > -1) {
        selectedPlayerIds.splice(index, 1);
        // If the removed player was captain, clear captain
        if (captainId === player.id) {
            captainId = null;
        }
    } else {
        if (selectedPlayerIds.length < 16) {
            selectedPlayerIds.push(player.id);
        } else {
            alert('You can only select 16 players (including 1 sub)');
            return;
        }
    }

    filterPlayers();
    updateTeamDisplay();
}

// Update team display
async function updateTeamDisplay() {
    const selectedPlayers = allPlayers.filter(p => selectedPlayerIds.includes(p.id));

    // Update squad size
    document.getElementById('squadSize').textContent = `${selectedPlayerIds.length} / 16`;

    // Calculate totals
    const totalSpent = selectedPlayers.reduce((sum, p) => sum + p.price, 0);
    const budgetRemaining = 120 - totalSpent;
    let totalPoints = selectedPlayers.reduce((sum, p) => sum + p.totalPoints, 0);

    // Double captain's points if selected
    if (captainId) {
        const captain = selectedPlayers.find(p => p.id === captainId);
        if (captain) {
            totalPoints += captain.totalPoints;
        }
    }

    // Triple substitute's points if selected
    if (substituteId) {
        const substitute = selectedPlayers.find(p => p.id === substituteId);
        if (substitute) {
            totalPoints += substitute.totalPoints * 2;  // +2 times since already counted once
        }
    }

    document.getElementById('totalSpent').textContent = `£${totalSpent.toFixed(1)}m`;
    document.getElementById('budgetRemaining').textContent = `£${budgetRemaining.toFixed(1)}m`;
    document.getElementById('totalPoints').textContent = totalPoints.toFixed(0);

    // Update country breakdown
    const countryBreakdown = {};
    selectedPlayers.forEach(p => {
        countryBreakdown[p.country] = (countryBreakdown[p.country] || 0) + 1;
    });

    let countryHTML = '';
    Object.entries(countryBreakdown).sort().forEach(([country, count]) => {
        const maxColor = count === 4 ? '#ff9800' : count > 4 ? '#f44336' : '#4caf50';
        countryHTML += `<div class="breakdown-item"><span>${country}</span><span style="color: ${maxColor}; font-weight: bold;">${count}</span></div>`;
    });
    document.getElementById('countryBreakdown').innerHTML = countryHTML || '<p class="empty-message">No countries selected</p>';

    // Update position breakdown
    const positionBreakdown = {};
    selectedPlayers.forEach(p => {
        positionBreakdown[p.position] = (positionBreakdown[p.position] || 0) + 1;
    });

    let positionHTML = '';
    Object.entries(positionBreakdown).sort().forEach(([position, count]) => {
        positionHTML += `<div class="breakdown-item"><span>${position}</span><span>${count}</span></div>`;
    });
    document.getElementById('positionBreakdown').innerHTML = positionHTML || '<p class="empty-message">No positions selected</p>';

    // Update selected players list
    const selectedPlayersDiv = document.getElementById('selectedPlayers');
    if (selectedPlayers.length === 0) {
        selectedPlayersDiv.innerHTML = '<p class="empty-message">Select players to build your team</p>';
    } else {
        selectedPlayersDiv.innerHTML = selectedPlayers
            .sort((a, b) => a.position.localeCompare(b.position))
            .map(player => {
                let highlight = '';
                let badge = '';
                if (captainId === player.id) {
                    highlight = 'style="background-color: #fff9c4; border-left: 4px solid #fbc02d;"';
                    badge = ' ⭐ Captain';
                } else if (substituteId === player.id) {
                    highlight = 'style="background-color: #f3e5f5; border-left: 4px solid #9c27b0;"';
                    badge = ' 🔄 Sub';
                }
                return `
                <div class="selected-player" ${highlight}>
                    <div class="selected-player-info">
                        <div class="selected-player-name">${player.name}${badge}</div>
                        <div class="selected-player-details">${player.position} • ${player.country} • £${player.price.toFixed(1)}m</div>
                    </div>
                    <div class="selected-player-actions">
                        <button class="captain-btn" onclick="setCaptain(${player.id})" title="Set as Captain">${captainId === player.id ? '✓' : 'C'}</button>
                        <button class="sub-btn" onclick="setSubstitute(${player.id})" title="Set as Substitute">${substituteId === player.id ? '✓' : 'S'}</button>
                        <button class="remove-btn" onclick="removePlayer(${player.id})">Remove</button>
                    </div>
                </div>
            `;
            })
            .join('');
    }

    // Validate team
    await validateTeam();
}

// Set captain
function setCaptain(playerId) {
    if (captainId === playerId) {
        captainId = null;
    } else {
        captainId = playerId;
    }
    updateTeamDisplay();
}

// Set substitute
function setSubstitute(playerId) {
    if (substituteId === playerId) {
        substituteId = null;
    } else {
        substituteId = playerId;
    }
    updateTeamDisplay();
}

// Remove player
function removePlayer(playerId) {
    selectedPlayerIds = selectedPlayerIds.filter(id => id !== playerId);
    if (captainId === playerId) {
        captainId = null;
    }
    if (substituteId === playerId) {
        substituteId = null;
    }
    filterPlayers();
    updateTeamDisplay();
}

// Validate team
async function validateTeam() {
    const validationDiv = document.getElementById('teamValidation');

    if (selectedPlayerIds.length === 0) {
        validationDiv.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/teams/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                playerIds: selectedPlayerIds,
                captainId: captainId,
                substituteId: substituteId
            })
        });

        const result = await response.json();

        let html = '';

        if (result.isValid) {
            html = `<div class="validation-message success">✓ Team is valid and ready to save!</div>`;
        } else {
            result.errors.forEach(error => {
                html += `<div class="validation-message error">✗ ${error}</div>`;
            });
        }

        validationDiv.innerHTML = html;
    } catch (error) {
        console.error('Error validating team:', error);
    }
}

// Clear team
function clearTeam() {
    if (confirm('Are you sure you want to clear your team?')) {
        selectedPlayerIds = [];
        captainId = null;
        substituteId = null;
        filterPlayers();
        updateTeamDisplay();
    }
}

// Show save modal
function showSaveModal() {
    if (selectedPlayerIds.length !== 16) {
        alert('You must select exactly 16 players (including 1 sub) to save your team');
        return;
    }

    if (!captainId) {
        alert('You must select a captain for your team');
        return;
    }

    if (!substituteId) {
        alert('You must select a substitute (who will get triple points)');
        return;
    }

    const modal = document.getElementById('saveModal');
    document.getElementById('teamName').value = '';
    modal.classList.add('show');
}

// Save team
async function saveTeam() {
    const teamName = document.getElementById('teamName').value.trim();

    if (!teamName) {
        alert('Please enter a team name');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/teams`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: teamName,
                playerIds: selectedPlayerIds,
                captainId: captainId,
                substituteId: substituteId
            })
        });

        if (response.ok) {
            alert(`Team "${teamName}" saved successfully!`);
            document.getElementById('saveModal').classList.remove('show');
            // Reset team
            selectedPlayerIds = [];
            captainId = null;
            substituteId = null;
            filterPlayers();
            updateTeamDisplay();
        } else {
            alert('Failed to save team');
        }
    } catch (error) {
        console.error('Error saving team:', error);
        alert('Error saving team');
    }
}
