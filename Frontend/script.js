const API_BASE_URL = 'http://localhost:5201/api';

let allPlayers = [];
let selectedPlayerIds = [];

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

    // Modal controls
    const modal = document.getElementById('saveModal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelSave');
    const confirmBtn = document.getElementById('confirmSave');

    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    cancelBtn.addEventListener('click', () => modal.style.display = 'none');
    confirmBtn.addEventListener('click', saveTeam);

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
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
        `;

        card.addEventListener('click', () => togglePlayer(player));
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
    } else {
        if (selectedPlayerIds.length < 15) {
            selectedPlayerIds.push(player.id);
        } else {
            alert('You can only select 15 players');
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
    document.getElementById('squadSize').textContent = `${selectedPlayerIds.length} / 15`;

    // Calculate totals
    const totalSpent = selectedPlayers.reduce((sum, p) => sum + p.price, 0);
    const budgetRemaining = 120 - totalSpent;
    const totalPoints = selectedPlayers.reduce((sum, p) => sum + p.totalPoints, 0);

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
            .map(player => `
                <div class="selected-player">
                    <div class="selected-player-info">
                        <div class="selected-player-name">${player.name}</div>
                        <div class="selected-player-details">${player.position} • ${player.country} • £${player.price.toFixed(1)}m</div>
                    </div>
                    <button class="remove-btn" onclick="removePlayer(${player.id})">Remove</button>
                </div>
            `)
            .join('');
    }

    // Validate team
    await validateTeam();
}

// Remove player
function removePlayer(playerId) {
    selectedPlayerIds = selectedPlayerIds.filter(id => id !== playerId);
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
            body: JSON.stringify(selectedPlayerIds)
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
        filterPlayers();
        updateTeamDisplay();
    }
}

// Show save modal
function showSaveModal() {
    if (selectedPlayerIds.length !== 15) {
        alert('You must select exactly 15 players to save your team');
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
                playerIds: selectedPlayerIds
            })
        });

        if (response.ok) {
            alert(`Team "${teamName}" saved successfully!`);
            document.getElementById('saveModal').classList.remove('show');
        } else {
            alert('Failed to save team');
        }
    } catch (error) {
        console.error('Error saving team:', error);
        alert('Error saving team');
    }
}
