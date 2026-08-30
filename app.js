// NFL Teams Data
const NFL_TEAMS = {
    'ARI': { name: 'Arizona Cardinals', division: 'NFC West', logo: 'arizona-cardinals.png', color: '#97233F' },
    'ATL': { name: 'Atlanta Falcons', division: 'NFC South', logo: 'atlanta-falcons.png', color: '#A71930' },
    'BAL': { name: 'Baltimore Ravens', division: 'AFC North', logo: 'baltimore-ravens.png', color: '#241773' },
    'BUF': { name: 'Buffalo Bills', division: 'AFC East', logo: 'buffalo-bills.png', color: '#00338D' },
    'CAR': { name: 'Carolina Panthers', division: 'NFC South', logo: 'carolina-panthers.png', color: '#0085CA' },
    'CHI': { name: 'Chicago Bears', division: 'NFC North', logo: 'chicago-bears.png', color: '#0B162A' },
    'CIN': { name: 'Cincinnati Bengals', division: 'AFC North', logo: 'cincinatti-bengals.png', color: '#FB4F14' },
    'CLE': { name: 'Cleveland Browns', division: 'AFC North', logo: 'cleveland-browns.png', color: '#311D00' },
    'DAL': { name: 'Dallas Cowboys', division: 'NFC East', logo: 'dallas-cowboys.png', color: '#041E42' },
    'DEN': { name: 'Denver Broncos', division: 'AFC West', logo: 'denver-broncos.png', color: '#FB4F14' },
    'DET': { name: 'Detroit Lions', division: 'NFC North', logo: 'detroit-lions.png', color: '#0076B6' },
    'GB': { name: 'Green Bay Packers', division: 'NFC North', logo: 'greenbay-packers.png', color: '#203731' },
    'HOU': { name: 'Houston Texans', division: 'AFC South', logo: 'houston-texans.png', color: '#03202F' },
    'IND': { name: 'Indianapolis Colts', division: 'AFC South', logo: 'indianapolis-colts.png', color: '#002C5F' },
    'JAX': { name: 'Jacksonville Jaguars', division: 'AFC South', logo: 'jacksonville-jaguars.png', color: '#101820' },
    'KC': { name: 'Kansas City Chiefs', division: 'AFC West', logo: 'kansascity-chiefs.png', color: '#E31837' },
    'LV': { name: 'Las Vegas Raiders', division: 'AFC West', logo: 'lasvegas-raiders.png', color: '#000000' },
    'LAC': { name: 'Los Angeles Chargers', division: 'AFC West', logo: 'losangeles-chargers.png', color: '#0080C6' },
    'LAR': { name: 'Los Angeles Rams', division: 'NFC West', logo: 'losangeles-rams.png', color: '#003594' },
    'MIA': { name: 'Miami Dolphins', division: 'AFC East', logo: 'miami-dolphins.png', color: '#008E97' },
    'MIN': { name: 'Minnesota Vikings', division: 'NFC North', logo: 'minnesota-vikings.png', color: '#4F2683' },
    'NE': { name: 'New England Patriots', division: 'AFC East', logo: 'newengland-patriots.png', color: '#002244' },
    'NO': { name: 'New Orleans Saints', division: 'NFC South', logo: 'neworleans-saints.png', color: '#D3BC8D' },
    'NYG': { name: 'New York Giants', division: 'NFC East', logo: 'newyork-giants.png', color: '#0B2265' },
    'NYJ': { name: 'New York Jets', division: 'AFC East', logo: 'newyork-jets.png', color: '#125740' },
    'PHI': { name: 'Philadelphia Eagles', division: 'NFC East', logo: 'philadelphia-eagles.png', color: '#004C54' },
    'PIT': { name: 'Pittsburgh Steelers', division: 'AFC North', logo: 'pittsburgh-steelers.png', color: '#FFB612' },
    'SF': { name: 'San Francisco 49ers', division: 'NFC West', logo: 'sanfrancisco-49ers.png', color: '#AA0000' },
    'SEA': { name: 'Seattle Seahawks', division: 'NFC West', logo: 'seattle-seahawks.png', color: '#002244' },
    'TB': { name: 'Tampa Bay Buccaneers', division: 'NFC South', logo: 'tampabay-buccaneers.png', color: '#D50A0A' },
    'TEN': { name: 'Tennessee Titans', division: 'AFC South', logo: 'tennessee-titans.png', color: '#0C2340' },
    'WSH': { name: 'Washington Commanders', division: 'NFC East', logo: 'washington-commanders.png', color: '#5A1414' }
};

const FAVORITE_TEAMS_KEY = 'nflFavoriteTeams';

function getFavoriteTeams() {
    try {
        return JSON.parse(localStorage.getItem(FAVORITE_TEAMS_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function toggleFavoriteTeam(abbr) {
    const favorites = getFavoriteTeams();
    const index = favorites.indexOf(abbr);
    if (index === -1) {
        favorites.push(abbr);
    } else {
        favorites.splice(index, 1);
    }
    localStorage.setItem(FAVORITE_TEAMS_KEY, JSON.stringify(favorites));
    populateTeamList();
}

// NFL Data storage - will be loaded from JSON files
let NFL_DATA = {};

// Load data from JSON files
async function loadSeasonData(season) {
    try {
        const cacheBuster = Date.now();
        const response = await fetch(`data/nfl-${season}.json?v=${cacheBuster}`);
        if (!response.ok) {
            throw new Error(`Failed to load ${season} data`);
        }
        const data = await response.json();
        NFL_DATA[season] = data;
        console.log(`Loaded ${season} data:`, data.length, 'games');
        return data;
    } catch (error) {
        console.error(`Error loading ${season} data:`, error);
        NFL_DATA[season] = []; // Empty array as fallback
        return [];
    }
}

// Load all season data
async function loadAllSeasonData() {
    const seasons = ['2026', '2025', '2024', '2023', '2022', '2021'];
    const loadPromises = seasons.map(season => loadSeasonData(season));
    await Promise.all(loadPromises);
}

// Coaching staff data (Head Coach / OC / DC per team per season)
let COACHES_DATA = {};

async function loadCoachesData() {
    try {
        const response = await fetch('data/coaches.json');
        if (!response.ok) {
            throw new Error('Failed to load coaches data');
        }
        COACHES_DATA = await response.json();
    } catch (error) {
        console.error('Error loading coaches data:', error);
        COACHES_DATA = {};
    }
}

let currentTeam = null;
let currentSeason = '2026';
let quarterChart = null;
let differentialChart = null;
let quarterChartMode = 'total'; // 'total' or 'average'
let differentialChartMode = 'total'; // 'total' or 'average'
let quarterTotalThreshold = 14.5;
let halfTotalThreshold = 23.5;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    // Load all season data and coaching staff data in parallel
    await Promise.all([loadAllSeasonData(), loadCoachesData()]);
    
    populateTeamList();
    setupEventListeners();
    
    // Check if we have a selected team from localStorage (from home.html navigation)
    const savedTeam = localStorage.getItem('selectedTeam');
    const savedSeason = localStorage.getItem('selectedSeason');
    
    if (savedTeam) {
        // Clear the stored team to prevent auto-selection on future visits
        localStorage.removeItem('selectedTeam');
        
        // Set the season if provided
        if (savedSeason) {
            currentSeason = savedSeason;
            document.getElementById('seasonSelect').value = savedSeason;
        }
        
        // Directly select the team
        selectTeam(savedTeam);
    } else {
        // Only redirect to home.html if no team was pre-selected
        window.location.href = 'home.html';
    }
    
    // Add home button click handler with delay to ensure DOM is ready
    setTimeout(() => {
        const homeButton = document.getElementById('homeButton');
        if (homeButton) {
            console.log('Home button found, adding click handler');
            homeButton.addEventListener('click', function(e) {
                console.log('Home button clicked, navigating to home.html');
                e.preventDefault();
                window.location.href = 'home.html';
            });
            homeButton.style.cursor = 'pointer';
        } else {
            console.log('Home button not found');
        }
        
        // Add settings dropdown functionality
        const settingsButton = document.getElementById('settingsButton');
        const settingsDropdown = document.getElementById('settingsDropdown');
        
        if (settingsButton && settingsDropdown) {
            settingsButton.addEventListener('click', function(e) {
                e.stopPropagation();
                settingsDropdown.classList.toggle('hidden');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function() {
                settingsDropdown.classList.add('hidden');
            });
            
            // Add theme toggle functionality
            const themeRadios = document.querySelectorAll('input[name="theme"]');
            themeRadios.forEach(radio => {
                radio.addEventListener('change', function() {
                    const theme = this.value;
                    const body = document.getElementById('mainBody');
                    
                    if (theme === 'dark') {
                        body.classList.add('dark-theme');
                    } else {
                        body.classList.remove('dark-theme');
                    }
                    
                    // Store theme preference
                    localStorage.setItem('theme', theme);
                });
            });
            
            // Load saved theme and sync with radio buttons
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                const body = document.getElementById('mainBody');
                const themeRadio = document.querySelector(`input[name="theme"][value="${savedTheme}"]`);
                
                if (themeRadio) {
                    themeRadio.checked = true;
                    // Theme is already applied by inline script, just ensure body has class too
                    if (savedTheme === 'dark') {
                        body.classList.add('dark-theme');
                    }
                }
            }
        }
    }, 100);
});

function populateTeamList() {
    const teamList = document.getElementById('teamList');
    teamList.innerHTML = '';
    
    const favorites = getFavoriteTeams();
    const sortedAbbrs = Object.keys(NFL_TEAMS).sort((a, b) => {
        const aFav = favorites.includes(a);
        const bFav = favorites.includes(b);
        if (aFav !== bFav) return aFav ? -1 : 1;
        return a.localeCompare(b);
    });
    
    sortedAbbrs.forEach(abbr => {
        const team = NFL_TEAMS[abbr];
        const isFavorite = favorites.includes(abbr);
        
        const row = document.createElement('div');
        row.className = 'w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-blue-100 rounded-md transition-colors duration-200 flex items-center justify-between gap-2 cursor-pointer';
        row.style.border = isFavorite ? `2px solid ${team.color}` : '2px solid transparent';
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'flex items-center gap-3 min-w-0';
        
        // Create team logo
        const logo = document.createElement('img');
        logo.className = 'w-8 h-8 rounded-full flex-shrink-0 object-contain';
        logo.src = `team-logos/${team.logo}`;
        logo.alt = `${team.name} logo`;
        logo.onerror = function() {
            // Fallback to abbreviation if logo fails to load
            this.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.className = 'w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0';
            const logoText = document.createElement('span');
            logoText.className = 'text-xs font-bold';
            logoText.textContent = abbr;
            fallback.appendChild(logoText);
            this.parentNode.insertBefore(fallback, this);
        };
        
        // Create team name
        const teamName = document.createElement('span');
        teamName.className = 'truncate';
        teamName.textContent = team.name;
        
        infoDiv.appendChild(logo);
        infoDiv.appendChild(teamName);
        
        // Create favorite star toggle
        const starButton = document.createElement('button');
        starButton.className = 'flex-shrink-0 p-1 hover:scale-110 transition-transform duration-150';
        starButton.title = isFavorite ? 'Remove from favorites' : 'Add to favorites';
        starButton.innerHTML = `
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="${isFavorite ? '#FBBF24' : 'none'}" stroke="${isFavorite ? '#FBBF24' : '#9CA3AF'}" stroke-width="2" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
        `;
        starButton.onclick = (e) => {
            e.stopPropagation();
            toggleFavoriteTeam(abbr);
        };
        
        row.appendChild(infoDiv);
        row.appendChild(starButton);
        row.onclick = () => selectTeam(abbr);
        teamList.appendChild(row);
    });
}

function setupEventListeners() {
    document.getElementById('coachCardClose').addEventListener('click', closeCoachCard);
    document.getElementById('coachCardOverlay').addEventListener('click', function(e) {
        if (e.target === this) closeCoachCard();
    });
    document.getElementById('coachCardToggle').addEventListener('click', function() {
        if (currentCoachSummaries) toggleCoachCardMode(currentCoachSummaries);
    });

    document.getElementById('seasonSelect').addEventListener('change', function(e) {
        currentSeason = e.target.value;
        if (currentTeam) {
            selectTeam(currentTeam);
        }
    });
    
    // Quarter chart toggle button
    document.getElementById('quarterChartToggle').addEventListener('click', function() {
        quarterChartMode = quarterChartMode === 'total' ? 'average' : 'total';
        this.textContent = quarterChartMode === 'total' ? 'Show Average' : 'Show Total';
        if (currentTeam) {
            const teamStats = calculateTeamStats(currentTeam);
            updateQuarterChart(teamStats);
        }
    });
    
    // Differential chart toggle button
    document.getElementById('differentialChartToggle').addEventListener('click', function() {
        differentialChartMode = differentialChartMode === 'total' ? 'average' : 'total';
        this.textContent = differentialChartMode === 'total' ? 'Show Average' : 'Show Total';
        if (currentTeam) {
            const teamStats = calculateTeamStats(currentTeam);
            updateDifferentialChart(teamStats);
        }
    });

    const quarterTotalButtons = document.querySelectorAll('.quarter-total-button');
    quarterTotalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const selected = parseFloat(this.dataset.threshold);
            quarterTotalThreshold = selected;
            quarterTotalButtons.forEach(btn => {
                btn.classList.remove('bg-blue-500');
                btn.classList.add('bg-green-500');
            });
            this.classList.remove('bg-green-500');
            this.classList.add('bg-blue-500');
            if (currentTeam) {
                const teamStats = calculateTeamStats(currentTeam);
                updateQuarterTotals(teamStats);
            }
        });
    });

    const halfTotalButtons = document.querySelectorAll('.half-total-button');
    halfTotalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const selected = parseFloat(this.dataset.threshold);
            halfTotalThreshold = selected;
            halfTotalButtons.forEach(btn => {
                btn.classList.remove('bg-blue-500');
                btn.classList.add('bg-green-500');
            });
            this.classList.remove('bg-green-500');
            this.classList.add('bg-blue-500');
            if (currentTeam) {
                const teamStats = calculateTeamStats(currentTeam);
                updateHalfTotals(teamStats);
            }
        });
    });
    
    // Home button click handler
    document.getElementById('homeButton').addEventListener('click', function() {
        showHomeScreen();
    });
    
    // Keyboard navigation for team selection and season changes
    document.addEventListener('keydown', function(e) {
        // Only handle arrow keys when a team is selected (not on home screen)
        if (!currentTeam) return;
        
        const teamAbbrs = Object.keys(NFL_TEAMS).sort();
        const currentIndex = teamAbbrs.indexOf(currentTeam);
        const seasons = ['2026', '2025', '2024', '2023', '2022', '2021'];
        const currentSeasonIndex = seasons.indexOf(currentSeason);
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % teamAbbrs.length;
            selectTeam(teamAbbrs[nextIndex]);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = currentIndex === 0 ? teamAbbrs.length - 1 : currentIndex - 1;
            selectTeam(teamAbbrs[prevIndex]);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            // Move to previous season (older)
            if (currentSeasonIndex < seasons.length - 1) {
                const newSeason = seasons[currentSeasonIndex + 1];
                currentSeason = newSeason;
                document.getElementById('seasonSelect').value = newSeason;
                selectTeam(currentTeam);
            }
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            // Move to next season (newer)
            if (currentSeasonIndex > 0) {
                const newSeason = seasons[currentSeasonIndex - 1];
                currentSeason = newSeason;
                document.getElementById('seasonSelect').value = newSeason;
                selectTeam(currentTeam);
            }
        }
    });
}

function showHomeScreen() {
    // Hide team view and show home screen
    document.getElementById('teamView').classList.add('hidden');
    document.getElementById('homeScreen').classList.remove('hidden');
    currentTeam = null;
}

function showTeamView() {
    // Hide home screen and show team view
    document.getElementById('homeScreen').classList.add('hidden');
    document.getElementById('teamView').classList.remove('hidden');
}

function selectTeam(teamAbbr) {
    currentTeam = teamAbbr;
    const team = NFL_TEAMS[teamAbbr];
    
    // Switch to team view
    showTeamView();
    
    // Update team header
    document.getElementById('teamHeader').classList.remove('hidden');
    document.getElementById('teamName').textContent = team.name;
    
    // Update team logo in header
    const teamLogoDiv = document.getElementById('teamLogo');
    teamLogoDiv.innerHTML = ''; // Clear existing content
    
    const headerLogo = document.createElement('img');
    headerLogo.className = 'w-16 h-16 object-contain';
    headerLogo.src = `team-logos/${team.logo}`;
    headerLogo.alt = `${team.name} logo`;
    headerLogo.onerror = function() {
        // Fallback to abbreviation if logo fails to load
        this.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.className = 'w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center';
        const logoText = document.createElement('span');
        logoText.className = 'text-xl font-bold';
        logoText.textContent = teamAbbr;
        fallback.appendChild(logoText);
        teamLogoDiv.appendChild(fallback);
    };
    
    teamLogoDiv.appendChild(headerLogo);
    
    // Calculate and display statistics
    const teamStats = calculateTeamStats(teamAbbr);
    updateTeamRecord(teamStats);
    updateQuarterStats(teamStats);
    updateHalfStats(teamStats);
    updateQuarterTotals(teamStats);
    updateHalfTotals(teamStats);
    updateCharts(teamStats);
    updateGameLog(teamAbbr);
    renderTeamCoaches(teamAbbr, currentSeason);
}

function calculateTeamStats(teamAbbr, season) {
    const seasonData = NFL_DATA[season || currentSeason] || [];
    const teamGames = seasonData.filter(game => 
        game.homeTeam === teamAbbr || game.awayTeam === teamAbbr
    );
    
    const stats = {
        totalGames: teamGames.length,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        quarters: {
            Q1: { scored: 0, allowed: 0, wins: 0, losses: 0, ties: 0 },
            Q2: { scored: 0, allowed: 0, wins: 0, losses: 0, ties: 0 },
            Q3: { scored: 0, allowed: 0, wins: 0, losses: 0, ties: 0 },
            Q4: { scored: 0, allowed: 0, wins: 0, losses: 0, ties: 0 }
        },
        halves: {
            H1: { scored: 0, allowed: 0, wins: 0, losses: 0, ties: 0 },
            H2: { scored: 0, allowed: 0, wins: 0, losses: 0, ties: 0 }
        },
        games: []
    };
    
    teamGames.forEach(game => {
        const isHome = game.homeTeam === teamAbbr;
        const teamScore = isHome ? game.homeScore : game.awayScore;
        const oppScore = isHome ? game.awayScore : game.homeScore;
        const teamFinal = isHome ? game.finalHome : game.finalAway;
        const oppFinal = isHome ? game.finalAway : game.finalHome;
        
        // Check if this is a schedule-only game (no scores yet)
        const hasScoreData = teamScore !== null && oppScore !== null && teamFinal !== null && oppFinal !== null;
        
        if (hasScoreData) {
            // Increment games played counter
            stats.gamesPlayed++;
            
            // Game result
            if (teamFinal > oppFinal) stats.wins++;
            else if (teamFinal < oppFinal) stats.losses++;
            else stats.ties++;
            
            // Quarter stats
            for (let q = 0; q < 4; q++) {
                const quarterKey = `Q${q + 1}`;
                stats.quarters[quarterKey].scored += teamScore[q];
                stats.quarters[quarterKey].allowed += oppScore[q];
                
                if (teamScore[q] > oppScore[q]) stats.quarters[quarterKey].wins++;
                else if (teamScore[q] < oppScore[q]) stats.quarters[quarterKey].losses++;
                else stats.quarters[quarterKey].ties++;
            }
            
            // Half stats
            const teamH1 = teamScore[0] + teamScore[1];
            const oppH1 = oppScore[0] + oppScore[1];
            const teamH2 = teamScore[2] + teamScore[3];
            const oppH2 = oppScore[2] + oppScore[3];
            
            stats.halves.H1.scored += teamH1;
            stats.halves.H1.allowed += oppH1;
            stats.halves.H2.scored += teamH2;
            stats.halves.H2.allowed += oppH2;
            
            if (teamH1 > oppH1) stats.halves.H1.wins++;
            else if (teamH1 < oppH1) stats.halves.H1.losses++;
            else stats.halves.H1.ties++;
            
            if (teamH2 > oppH2) stats.halves.H2.wins++;
            else if (teamH2 < oppH2) stats.halves.H2.losses++;
            else stats.halves.H2.ties++;
        }
        
        // Store game details (including schedule-only games)
        stats.games.push({
            week: game.week,
            opponent: isHome ? game.awayTeam : game.homeTeam,
            isHome: isHome,
            teamScore: teamScore,
            oppScore: oppScore,
            teamFinal: teamFinal,
            oppFinal: oppFinal,
            differential: hasScoreData ? teamFinal - oppFinal : null,
            hasScoreData: hasScoreData
        });
    });
    
    return stats;
}

function updateTeamRecord(stats) {
    const record = `${stats.wins}-${stats.losses}${stats.ties > 0 ? `-${stats.ties}` : ''}`;
    document.getElementById('teamRecord').textContent = `Record: ${record}`;
}

function updateQuarterStats(stats) {
    const quarterStats = document.getElementById('quarterStats');
    quarterStats.innerHTML = '';
    
    // Show message if no data available
    if (stats.totalGames === 0) {
        quarterStats.innerHTML = `
            <div class="text-center text-gray-500 py-4">
                No data available for ${currentSeason} season
            </div>
        `;
        return;
    }
    
    ['Q1', 'Q2', 'Q3', 'Q4'].forEach(quarter => {
        const q = stats.quarters[quarter];
        const avgScored = stats.totalGames > 0 ? (q.scored / stats.totalGames).toFixed(1) : '0.0';
        const avgAllowed = stats.totalGames > 0 ? (q.allowed / stats.totalGames).toFixed(1) : '0.0';
        const differential = q.scored - q.allowed;
        const record = `${q.wins}-${q.losses}${q.ties > 0 ? `-${q.ties}` : ''}`;
        
        // Set border color based on +/- differential
        const borderColor = differential > 0 ? 'border-green-500' : 
                           differential < 0 ? 'border-red-500' : 'border-gray-400';
        
        const quarterDiv = document.createElement('div');
        quarterDiv.className = `border-l-4 ${borderColor} pl-4`;
        quarterDiv.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="font-medium">${quarter}</span>
                <span class="text-sm text-gray-600">${record}</span>
            </div>
            <div class="text-sm text-gray-600">
                Avg: ${avgScored} scored, ${avgAllowed} allowed
            </div>
            <div class="text-sm ${differential >= 0 ? 'text-green-600' : 'text-red-600'}">
                +/- ${differential >= 0 ? '+' : ''}${differential}
            </div>
        `;
        quarterStats.appendChild(quarterDiv);
    });
}

function updateHalfStats(stats) {
    const halfStats = document.getElementById('halfStats');
    halfStats.innerHTML = '';
    
    // Show message if no data available
    if (stats.totalGames === 0) {
        halfStats.innerHTML = `
            <div class="text-center text-gray-500 py-4">
                No data available for ${currentSeason} season
            </div>
        `;
        return;
    }
    
    ['H1', 'H2'].forEach((half, index) => {
        const h = stats.halves[half];
        const avgScored = stats.totalGames > 0 ? (h.scored / stats.totalGames).toFixed(1) : '0.0';
        const avgAllowed = stats.totalGames > 0 ? (h.allowed / stats.totalGames).toFixed(1) : '0.0';
        const differential = h.scored - h.allowed;
        const record = `${h.wins}-${h.losses}${h.ties > 0 ? `-${h.ties}` : ''}`;
        const halfName = index === 0 ? '1st Half' : '2nd Half';
        
        // Set border color based on +/- differential
        const borderColor = differential > 0 ? 'border-green-500' : 
                           differential < 0 ? 'border-red-500' : 'border-gray-400';
        
        const halfDiv = document.createElement('div');
        halfDiv.className = `border-l-4 ${borderColor} pl-4`;
        halfDiv.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="font-medium">${halfName}</span>
                <span class="text-sm text-gray-600">${record}</span>
            </div>
            <div class="text-sm text-gray-600">
                Avg: ${avgScored} scored, ${avgAllowed} allowed
            </div>
            <div class="text-sm ${differential >= 0 ? 'text-green-600' : 'text-red-600'}">
                +/- ${differential >= 0 ? '+' : ''}${differential}
            </div>
        `;
        halfStats.appendChild(halfDiv);
    });
}

function updateQuarterTotals(stats) {
    const container = document.getElementById('quarterTotals');
    container.innerHTML = '';

    const gamesWithScores = stats.games.filter(game => game.hasScoreData);

    if (stats.totalGames === 0 || gamesWithScores.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-4">
                No data available for ${currentSeason} season
            </div>
        `;
        return;
    }

    ['Q1', 'Q2', 'Q3', 'Q4'].forEach((quarter, index) => {
        let totalCombined = 0;
        let games = 0;
        let overs = 0;
        let unders = 0;

        gamesWithScores.forEach(game => {
            const teamPoints = game.teamScore[index];
            const oppPoints = game.oppScore[index];
            const combined = teamPoints + oppPoints;
            totalCombined += combined;
            games++;
            if (combined > quarterTotalThreshold) {
                overs++;
            } else {
                unders++;
            }
        });

        const avgCombined = games > 0 ? (totalCombined / games).toFixed(1) : '0.0';
        const record = `${overs}-${unders}`;

        const div = document.createElement('div');
        div.className = 'border-l-4 border-blue-500 pl-4';
        div.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="font-medium">${quarter}</span>
                <span class="text-sm text-gray-600">${record}</span>
            </div>
            <div class="text-sm text-gray-600">
                Avg combined: ${avgCombined}
            </div>
        `;
        container.appendChild(div);
    });
}

function updateHalfTotals(stats) {
    const container = document.getElementById('halfTotals');
    container.innerHTML = '';

    const gamesWithScores = stats.games.filter(game => game.hasScoreData);

    if (stats.totalGames === 0 || gamesWithScores.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-4">
                No data available for ${currentSeason} season
            </div>
        `;
        return;
    }

    ['1st Half', '2nd Half'].forEach((label, index) => {
        let totalCombined = 0;
        let games = 0;
        let overs = 0;
        let unders = 0;

        gamesWithScores.forEach(game => {
            const teamScore = game.teamScore;
            const oppScore = game.oppScore;
            let teamHalf;
            let oppHalf;
            if (index === 0) {
                teamHalf = teamScore[0] + teamScore[1];
                oppHalf = oppScore[0] + oppScore[1];
            } else {
                teamHalf = teamScore[2] + teamScore[3];
                oppHalf = oppScore[2] + oppScore[3];
            }
            const combined = teamHalf + oppHalf;
            totalCombined += combined;
            games++;
            if (combined > halfTotalThreshold) {
                overs++;
            } else {
                unders++;
            }
        });

        const avgCombined = games > 0 ? (totalCombined / games).toFixed(1) : '0.0';
        const record = `${overs}-${unders}`;

        const div = document.createElement('div');
        div.className = 'border-l-4 border-blue-500 pl-4';
        div.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="font-medium">${label}</span>
                <span class="text-sm text-gray-600">${record}</span>
            </div>
            <div class="text-sm text-gray-600">
                Avg combined: ${avgCombined}
            </div>
        `;
        container.appendChild(div);
    });
}

function updateCharts(stats) {
    // Check if we have games with actual score data
    const gamesWithScores = stats.games.filter(game => game.hasScoreData);
    const hasScoreData = gamesWithScores.length > 0;
    
    // Clear charts if no score data available
    if (stats.totalGames === 0 || !hasScoreData) {
        const quarterCtx = document.getElementById('quarterChart').getContext('2d');
        const diffCtx = document.getElementById('differentialChart').getContext('2d');
        
        if (quarterChart) quarterChart.destroy();
        if (differentialChart) differentialChart.destroy();
        
        // Show appropriate message on charts
        const message = stats.totalGames === 0 ? `No data for ${currentSeason}` : `No quarter data available for ${currentSeason}`;
        
        quarterCtx.clearRect(0, 0, quarterCtx.canvas.width, quarterCtx.canvas.height);
        quarterCtx.font = '16px Arial';
        quarterCtx.fillStyle = '#6B7280';
        quarterCtx.textAlign = 'center';
        quarterCtx.fillText(message, quarterCtx.canvas.width / 2, quarterCtx.canvas.height / 2);
        
        diffCtx.clearRect(0, 0, diffCtx.canvas.width, diffCtx.canvas.height);
        diffCtx.font = '16px Arial';
        diffCtx.fillStyle = '#6B7280';
        diffCtx.textAlign = 'center';
        diffCtx.fillText(message, diffCtx.canvas.width / 2, diffCtx.canvas.height / 2);
        
        return;
    }
    
    updateQuarterChart(stats);
    
    updateDifferentialChart(stats);
}

function updateQuarterChart(stats) {
    const quarterCtx = document.getElementById('quarterChart').getContext('2d');
    if (quarterChart) quarterChart.destroy();
    
    const isAverage = quarterChartMode === 'average';
    const divisor = isAverage ? stats.gamesPlayed : 1;
    
    quarterChart = new Chart(quarterCtx, {
        type: 'bar',
        data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: isAverage ? 'Avg Points Scored' : 'Points Scored',
                data: [
                    (stats.quarters.Q1.scored / divisor).toFixed(1),
                    (stats.quarters.Q2.scored / divisor).toFixed(1),
                    (stats.quarters.Q3.scored / divisor).toFixed(1),
                    (stats.quarters.Q4.scored / divisor).toFixed(1)
                ],
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgba(34, 197, 94, 0.8)',
                borderWidth: 1
            }, {
                label: isAverage ? 'Avg Points Allowed' : 'Points Allowed',
                data: [
                    (stats.quarters.Q1.allowed / divisor).toFixed(1),
                    (stats.quarters.Q2.allowed / divisor).toFixed(1),
                    (stats.quarters.Q3.allowed / divisor).toFixed(1),
                    (stats.quarters.Q4.allowed / divisor).toFixed(1)
                ],
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: isAverage ? 'Average Points by Quarter' : 'Total Points by Quarter'
                }
            }
        }
    });
}

function updateDifferentialChart(stats) {
    const diffCtx = document.getElementById('differentialChart').getContext('2d');
    if (differentialChart) differentialChart.destroy();
    
    const isAverage = differentialChartMode === 'average';
    const divisor = isAverage ? stats.gamesPlayed : 1;
    
    const q1Diff = (stats.quarters.Q1.scored - stats.quarters.Q1.allowed) / divisor;
    const q2Diff = (stats.quarters.Q2.scored - stats.quarters.Q2.allowed) / divisor;
    const q3Diff = (stats.quarters.Q3.scored - stats.quarters.Q3.allowed) / divisor;
    const q4Diff = (stats.quarters.Q4.scored - stats.quarters.Q4.allowed) / divisor;
    
    differentialChart = new Chart(diffCtx, {
        type: 'bar',
        data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: isAverage ? 'Avg Point Differential' : 'Point Differential',
                data: [
                    isAverage ? q1Diff.toFixed(1) : q1Diff,
                    isAverage ? q2Diff.toFixed(1) : q2Diff,
                    isAverage ? q3Diff.toFixed(1) : q3Diff,
                    isAverage ? q4Diff.toFixed(1) : q4Diff
                ],
                backgroundColor: function(context) {
                    const value = context.parsed.y;
                    return value >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)';
                },
                borderColor: function(context) {
                    const value = context.parsed.y;
                    return value >= 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)';
                },
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: isAverage ? 'Average Point Differential by Quarter' : 'Total Point Differential by Quarter'
                }
            }
        }
    });
}

function updateGameLog(teamAbbr) {
    const gameLogBody = document.getElementById('gameLogBody');
    gameLogBody.innerHTML = '';
    
    const teamStats = calculateTeamStats(teamAbbr);
    
    // Show message if no data available for selected season
    if (teamStats.totalGames === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="10" class="px-4 py-8 text-center text-gray-500">
                No game data available for ${currentSeason} season
            </td>
        `;
        gameLogBody.appendChild(row);
        return;
    }
    
    // Get all weeks that have games in the current season
    const seasonData = NFL_DATA[currentSeason] || [];
    const weeksWithGames = [...new Set(seasonData.map(game => game.week))].sort((a, b) => a - b);
    
    // Create game log with bye weeks
    weeksWithGames.forEach(week => {
        const teamGame = teamStats.games.find(game => game.week === week);
        
        if (teamGame) {
            // Regular game
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            
            // Helper function to get color class for differential
            const getDiffColor = (diff) => {
                if (diff > 0) return 'text-green-600';
                if (diff < 0) return 'text-red-600';
                return 'text-blue-400';
            };
            
            // Helper function to format differential
            const formatDiff = (diff) => {
                if (diff > 0) return `(+${diff})`;
                if (diff < 0) return `(${diff})`;
                return '(0)';
            };
            
            if (teamGame.hasScoreData) {
                // Game with actual scores
                const q1Diff = teamGame.teamScore[0] - teamGame.oppScore[0];
                const q2Diff = teamGame.teamScore[1] - teamGame.oppScore[1];
                const q3Diff = teamGame.teamScore[2] - teamGame.oppScore[2];
                const q4Diff = teamGame.teamScore[3] - teamGame.oppScore[3];
                
                // Handle OT column - show dash if no OT, or actual scores if OT was played.
                // Use array length (not truthiness) so a real 0 in OT still displays as 0.
                const wentToOT = teamGame.teamScore.length > 4 || teamGame.oppScore.length > 4;
                const teamOT = teamGame.teamScore[4] ?? 0;
                const oppOT = teamGame.oppScore[4] ?? 0;
                const otDisplay = wentToOT ? `${teamOT}-${oppOT}` : '-';
                
                const h1Team = teamGame.teamScore[0] + teamGame.teamScore[1];
                const h1Opp = teamGame.oppScore[0] + teamGame.oppScore[1];
                const h2Team = teamGame.teamScore[2] + teamGame.teamScore[3];
                const h2Opp = teamGame.oppScore[2] + teamGame.oppScore[3];
                
                row.innerHTML = `
                    <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">${teamGame.week}</td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        ${teamGame.isHome ? 'vs' : '@'} ${teamGame.opponent}
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        ${teamGame.teamScore[0]}-${teamGame.oppScore[0]} <span class="${getDiffColor(q1Diff)}">${formatDiff(q1Diff)}</span>
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        ${teamGame.teamScore[1]}-${teamGame.oppScore[1]} <span class="${getDiffColor(q2Diff)}">${formatDiff(q2Diff)}</span>
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        ${teamGame.teamScore[2]}-${teamGame.oppScore[2]} <span class="${getDiffColor(q3Diff)}">${formatDiff(q3Diff)}</span>
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        ${teamGame.teamScore[3]}-${teamGame.oppScore[3]} <span class="${getDiffColor(q4Diff)}">${formatDiff(q4Diff)}</span>
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                        ${otDisplay}
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${h1Team}-${h1Opp}</td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${h2Team}-${h2Opp}</td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">${teamGame.teamFinal}-${teamGame.oppFinal}</td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm font-medium ${teamGame.differential >= 0 ? 'text-green-600' : 'text-red-600'}">
                        ${teamGame.differential >= 0 ? '+' : ''}${teamGame.differential}
                    </td>
                `;
            } else {
                // Check if this is a cancelled game (exists in data but null scores) or future game
                const isCancelled = currentSeason === '2022' && teamGame.week === 17 && 
                                  ((teamGame.opponent === 'BUF' && teamAbbr === 'CIN') || 
                                   (teamGame.opponent === 'CIN' && teamAbbr === 'BUF'));
                
                if (isCancelled) {
                    // Cancelled game
                    row.innerHTML = `
                        <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">${teamGame.week}</td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            ${teamGame.isHome ? 'vs' : '@'} ${teamGame.opponent}
                        </td>
                        <td colspan="9" class="px-4 py-2 text-center text-sm text-gray-600 italic font-medium">CANCELLED</td>
                    `;
                } else {
                    // Schedule-only game (no scores yet)
                    row.innerHTML = `
                        <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">${teamGame.week}</td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            ${teamGame.isHome ? 'vs' : '@'} ${teamGame.opponent}
                        </td>
                        <td colspan="4" class="px-4 py-2 text-center text-sm text-gray-500 italic">No quarter data available</td>
                        <td class="px-4 py-2 text-center text-sm text-gray-500 italic">-</td>
                        <td colspan="2" class="px-4 py-2 text-center text-sm text-gray-500 italic">No half data available</td>
                        <td class="px-4 py-2 text-center text-sm text-gray-500 italic">TBD</td>
                        <td class="px-4 py-2 text-center text-sm text-gray-500 italic">TBD</td>
                    `;
                }
            }
            gameLogBody.appendChild(row);
        } else {
            // Bye week
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            row.innerHTML = `
                <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">${week}</td>
                <td colspan="10" class="px-4 py-2 text-center text-sm text-gray-500 italic">BYE WEEK</td>
            `;
            gameLogBody.appendChild(row);
        }
    });
    
    // Totals row - sums points for/against and +/- for quarters, halves, and the season
    const getDiffColor = (diff) => {
        if (diff > 0) return 'text-green-600';
        if (diff < 0) return 'text-red-600';
        return 'text-blue-400';
    };
    
    const formatDiff = (diff) => {
        if (diff > 0) return `(+${diff})`;
        if (diff < 0) return `(${diff})`;
        return '(0)';
    };
    
    let totalOTFor = 0;
    let totalOTAgainst = 0;
    let hadOT = false;
    let totalFinalFor = 0;
    let totalFinalAgainst = 0;
    
    teamStats.games.forEach(game => {
        if (!game.hasScoreData) return;
        totalFinalFor += game.teamFinal;
        totalFinalAgainst += game.oppFinal;
        if (game.teamScore.length > 4 || game.oppScore.length > 4) {
            hadOT = true;
            totalOTFor += game.teamScore[4] || 0;
            totalOTAgainst += game.oppScore[4] || 0;
        }
    });
    
    const q1Diff = teamStats.quarters.Q1.scored - teamStats.quarters.Q1.allowed;
    const q2Diff = teamStats.quarters.Q2.scored - teamStats.quarters.Q2.allowed;
    const q3Diff = teamStats.quarters.Q3.scored - teamStats.quarters.Q3.allowed;
    const q4Diff = teamStats.quarters.Q4.scored - teamStats.quarters.Q4.allowed;
    const h1Diff = teamStats.halves.H1.scored - teamStats.halves.H1.allowed;
    const h2Diff = teamStats.halves.H2.scored - teamStats.halves.H2.allowed;
    const totalDiff = totalFinalFor - totalFinalAgainst;
    const otDisplay = hadOT ? `${totalOTFor}-${totalOTAgainst}` : '-';
    
    const totalsRow = document.createElement('tr');
    totalsRow.className = 'bg-gray-100 font-semibold border-t-2 border-gray-300';
    totalsRow.innerHTML = `
        <td class="px-2 py-2 text-xs font-bold text-gray-900" colspan="2">TOTAL</td>
        <td class="px-2 py-2 text-xs text-gray-900">
            ${teamStats.quarters.Q1.scored}-${teamStats.quarters.Q1.allowed} <span class="${getDiffColor(q1Diff)}">${formatDiff(q1Diff)}</span>
        </td>
        <td class="px-2 py-2 text-xs text-gray-900">
            ${teamStats.quarters.Q2.scored}-${teamStats.quarters.Q2.allowed} <span class="${getDiffColor(q2Diff)}">${formatDiff(q2Diff)}</span>
        </td>
        <td class="px-2 py-2 text-xs text-gray-900">
            ${teamStats.quarters.Q3.scored}-${teamStats.quarters.Q3.allowed} <span class="${getDiffColor(q3Diff)}">${formatDiff(q3Diff)}</span>
        </td>
        <td class="px-2 py-2 text-xs text-gray-900">
            ${teamStats.quarters.Q4.scored}-${teamStats.quarters.Q4.allowed} <span class="${getDiffColor(q4Diff)}">${formatDiff(q4Diff)}</span>
        </td>
        <td class="px-2 py-2 text-xs text-gray-900 text-center">${otDisplay}</td>
        <td class="px-2 py-2 text-xs text-gray-900">
            ${teamStats.halves.H1.scored}-${teamStats.halves.H1.allowed} <span class="${getDiffColor(h1Diff)}">${formatDiff(h1Diff)}</span>
        </td>
        <td class="px-2 py-2 text-xs text-gray-900">
            ${teamStats.halves.H2.scored}-${teamStats.halves.H2.allowed} <span class="${getDiffColor(h2Diff)}">${formatDiff(h2Diff)}</span>
        </td>
        <td class="px-2 py-2 text-xs font-bold text-gray-900">${totalFinalFor}-${totalFinalAgainst}</td>
        <td class="px-2 py-2 text-xs font-bold ${totalDiff >= 0 ? 'text-green-600' : 'text-red-600'}">
            ${totalDiff >= 0 ? '+' : ''}${totalDiff}
        </td>
    `;
    gameLogBody.appendChild(totalsRow);
}

// ─────────────────────── COACH HELPERS ──────────────────────────────────────

function cleanCoachName(raw) {
    return raw.replace(/\s*\(.*?\)/g, '').trim();
}

function splitCoachField(field) {
    if (!field) return [];
    const parts = field.split(/[→\/]/).map(s => s.trim()).filter(Boolean);
    return parts.map(raw => ({ display: raw, clean: cleanCoachName(raw) }));
}

// ─────────────────────── RENDER COACHES UNDER RECORD ────────────────────────

function renderTeamCoaches(teamAbbr, season) {
    const container = document.getElementById('teamCoaches');
    if (!container) return;
    container.innerHTML = '';

    const teamCoaches = COACHES_DATA[teamAbbr] && COACHES_DATA[teamAbbr][season];
    if (!teamCoaches) return;

    const roles = [
        { label: 'HC', field: teamCoaches.headCoach },
        { label: 'OC', field: teamCoaches.oc },
        { label: 'DC', field: teamCoaches.dc }
    ];

    roles.forEach(({ label, field }) => {
        const line = document.createElement('div');
        line.className = 'flex items-center gap-1 text-sm';

        const labelSpan = document.createElement('span');
        labelSpan.className = 'font-medium text-gray-500 w-6 flex-shrink-0';
        labelSpan.textContent = label + ':';
        line.appendChild(labelSpan);

        const namesSpan = document.createElement('span');
        const segments = splitCoachField(field);
        segments.forEach((seg, idx) => {
            if (idx > 0) namesSpan.appendChild(document.createTextNode(' / '));
            const isUnknown = !seg.clean || seg.clean.toLowerCase().startsWith('tbd');
            if (isUnknown) {
                const plain = document.createElement('span');
                plain.textContent = seg.display;
                namesSpan.appendChild(plain);
            } else {
                const btn = document.createElement('button');
                btn.className = 'text-blue-600 hover:underline font-medium focus:outline-none';
                btn.textContent = seg.clean;
                btn.addEventListener('click', () => openCoachCard(seg.clean));
                namesSpan.appendChild(btn);
            }
        });
        line.appendChild(namesSpan);
        container.appendChild(line);
    });
}

// ───────────────────── COACH CAREER LOOKUP & AGGREGATION ─────────────────────

let currentCoachSummaries = null;

function getCoachHistory(name) {
    const entries = [];
    const seasons = ['2021', '2022', '2023', '2024', '2025'];
    const roleMeta = [
        { key: 'headCoach', label: 'HC' },
        { key: 'oc',        label: 'OC' },
        { key: 'dc',        label: 'DC' }
    ];
    seasons.forEach(season => {
        Object.keys(COACHES_DATA).forEach(team => {
            const entry = COACHES_DATA[team] && COACHES_DATA[team][season];
            if (!entry) return;
            roleMeta.forEach(({ key, label }) => {
                const segs = splitCoachField(entry[key]);
                if (segs.some(s => s.clean.toLowerCase() === name.toLowerCase())) {
                    entries.push({ team, season, role: label });
                }
            });
        });
    });
    return entries;
}

function buildSeasonSummary(team, season) {
    const stats = calculateTeamStats(team, season);
    const playedGames = stats.games.filter(g => g.hasScoreData);

    let totalOTFor = 0, totalOTAgainst = 0, hadOT = false;
    let totalFinalFor = 0, totalFinalAgainst = 0;
    playedGames.forEach(g => {
        totalFinalFor += g.teamFinal;
        totalFinalAgainst += g.oppFinal;
        if (g.teamScore.length > 4 || g.oppScore.length > 4) {
            hadOT = true;
            totalOTFor += g.teamScore[4] || 0;
            totalOTAgainst += g.oppScore[4] || 0;
        }
    });

    return {
        team, season, stats,
        gamesPlayed: stats.gamesPlayed,
        wins: stats.wins, losses: stats.losses, ties: stats.ties,
        q1For: stats.quarters.Q1.scored, q1Ag: stats.quarters.Q1.allowed,
        q2For: stats.quarters.Q2.scored, q2Ag: stats.quarters.Q2.allowed,
        q3For: stats.quarters.Q3.scored, q3Ag: stats.quarters.Q3.allowed,
        q4For: stats.quarters.Q4.scored, q4Ag: stats.quarters.Q4.allowed,
        h1For: stats.halves.H1.scored, h1Ag: stats.halves.H1.allowed,
        h2For: stats.halves.H2.scored, h2Ag: stats.halves.H2.allowed,
        otFor: totalOTFor, otAg: totalOTAgainst, hadOT,
        finalFor: totalFinalFor, finalAg: totalFinalAgainst,
        games: playedGames
    };
}

function buildCareerTotals(summaries) {
    return summaries.reduce((acc, s) => {
        acc.wins += s.wins; acc.losses += s.losses; acc.ties += s.ties;
        acc.gamesPlayed += s.gamesPlayed;
        acc.q1For += s.q1For; acc.q1Ag += s.q1Ag;
        acc.q2For += s.q2For; acc.q2Ag += s.q2Ag;
        acc.q3For += s.q3For; acc.q3Ag += s.q3Ag;
        acc.q4For += s.q4For; acc.q4Ag += s.q4Ag;
        acc.h1For += s.h1For; acc.h1Ag += s.h1Ag;
        acc.h2For += s.h2For; acc.h2Ag += s.h2Ag;
        acc.otFor += s.otFor; acc.otAg += s.otAg;
        if (s.hadOT) acc.hadOT = true;
        acc.finalFor += s.finalFor; acc.finalAg += s.finalAg;
        // Aggregate per-quarter and per-half W-L-T for records toggle
        const q = s.stats.quarters, h = s.stats.halves;
        acc.q1Wins += q.Q1.wins; acc.q1Losses += q.Q1.losses; acc.q1Ties += q.Q1.ties;
        acc.q2Wins += q.Q2.wins; acc.q2Losses += q.Q2.losses; acc.q2Ties += q.Q2.ties;
        acc.q3Wins += q.Q3.wins; acc.q3Losses += q.Q3.losses; acc.q3Ties += q.Q3.ties;
        acc.q4Wins += q.Q4.wins; acc.q4Losses += q.Q4.losses; acc.q4Ties += q.Q4.ties;
        acc.h1Wins += h.H1.wins; acc.h1Losses += h.H1.losses; acc.h1Ties += h.H1.ties;
        acc.h2Wins += h.H2.wins; acc.h2Losses += h.H2.losses; acc.h2Ties += h.H2.ties;
        return acc;
    }, {
        wins: 0, losses: 0, ties: 0, gamesPlayed: 0,
        q1For: 0, q1Ag: 0, q2For: 0, q2Ag: 0,
        q3For: 0, q3Ag: 0, q4For: 0, q4Ag: 0,
        h1For: 0, h1Ag: 0, h2For: 0, h2Ag: 0,
        otFor: 0, otAg: 0, hadOT: false,
        finalFor: 0, finalAg: 0,
        q1Wins: 0, q1Losses: 0, q1Ties: 0,
        q2Wins: 0, q2Losses: 0, q2Ties: 0,
        q3Wins: 0, q3Losses: 0, q3Ties: 0,
        q4Wins: 0, q4Losses: 0, q4Ties: 0,
        h1Wins: 0, h1Losses: 0, h1Ties: 0,
        h2Wins: 0, h2Losses: 0, h2Ties: 0
    });
}

// ─────────────────── COACH CARD CELL BUILDERS ────────────────────────────────

function ccDiffColor(d) { return d > 0 ? 'text-green-600' : d < 0 ? 'text-red-600' : 'text-blue-400'; }
function ccFmtDiff(d)   { return d > 0 ? `(+${d})` : d < 0 ? `(${d})` : '(0)'; }

function buildQCell(s, key, showRecords) {
    const map = { Q1: [s.q1For, s.q1Ag], Q2: [s.q2For, s.q2Ag], Q3: [s.q3For, s.q3Ag], Q4: [s.q4For, s.q4Ag] };
    const [f, a] = map[key];
    if (showRecords && s.stats && s.stats.quarters[key]) {
        const q = s.stats.quarters[key];
        return `${q.wins}-${q.losses}${q.ties > 0 ? '-' + q.ties : ''}`;
    }
    const d = f - a;
    return `${f}-${a} <span class="${ccDiffColor(d)}">${ccFmtDiff(d)}</span>`;
}

function buildHCell(s, key, showRecords) {
    const map = { H1: [s.h1For, s.h1Ag], H2: [s.h2For, s.h2Ag] };
    const [f, a] = map[key];
    if (showRecords && s.stats && s.stats.halves[key]) {
        const h = s.stats.halves[key];
        return `${h.wins}-${h.losses}${h.ties > 0 ? '-' + h.ties : ''}`;
    }
    const d = f - a;
    return `${f}-${a} <span class="${ccDiffColor(d)}">${ccFmtDiff(d)}</span>`;
}

function buildFinalCell(s, showRecords) {
    if (showRecords) return `<span class="font-bold">${s.wins}-${s.losses}${s.ties > 0 ? '-' + s.ties : ''}</span>`;
    return `${s.finalFor}-${s.finalAg}`;
}

function buildDiffCell(s) {
    const diff = s.finalFor - s.finalAg;
    return `<span class="${ccDiffColor(diff)} font-bold">${diff >= 0 ? '+' : ''}${diff}</span>`;
}

function buildCareerCells(c, showRecords) {
    const qData = [
        [c.q1For, c.q1Ag, c.q1Wins, c.q1Losses, c.q1Ties],
        [c.q2For, c.q2Ag, c.q2Wins, c.q2Losses, c.q2Ties],
        [c.q3For, c.q3Ag, c.q3Wins, c.q3Losses, c.q3Ties],
        [c.q4For, c.q4Ag, c.q4Wins, c.q4Losses, c.q4Ties]
    ];
    const qCells = qData.map(([f, a, w, l, t]) => {
        if (showRecords) return `<td class="px-2 py-2 text-xs text-blue-900">${w}-${l}${t > 0 ? '-' + t : ''}</td>`;
        const d = f - a;
        return `<td class="px-2 py-2 text-xs text-blue-900">${f}-${a} <span class="${ccDiffColor(d)}">${ccFmtDiff(d)}</span></td>`;
    }).join('');
    const otCell = `<td class="px-2 py-2 text-xs text-center text-blue-900">${c.hadOT ? c.otFor + '-' + c.otAg : '-'}</td>`;
    const hData = [
        [c.h1For, c.h1Ag, c.h1Wins, c.h1Losses, c.h1Ties],
        [c.h2For, c.h2Ag, c.h2Wins, c.h2Losses, c.h2Ties]
    ];
    const hCells = hData.map(([f, a, w, l, t]) => {
        if (showRecords) return `<td class="px-2 py-2 text-xs text-blue-900">${w}-${l}${t > 0 ? '-' + t : ''}</td>`;
        const d = f - a;
        return `<td class="px-2 py-2 text-xs text-blue-900">${f}-${a} <span class="${ccDiffColor(d)}">${ccFmtDiff(d)}</span></td>`;
    }).join('');
    const totalDiff = c.finalFor - c.finalAg;
    const finalVal = showRecords
        ? `<span class="font-bold text-blue-900">${c.wins}-${c.losses}${c.ties > 0 ? '-' + c.ties : ''}</span>`
        : `<span class="text-blue-900">${c.finalFor}-${c.finalAg}</span>`;
    return `${qCells}${otCell}${hCells}` +
        `<td class="px-2 py-2 text-xs font-medium">${finalVal}</td>` +
        `<td class="px-2 py-2 text-xs"><span class="${ccDiffColor(totalDiff)} font-bold">${totalDiff >= 0 ? '+' : ''}${totalDiff}</span></td>`;
}

// ─────────────────── DRILL-DOWN GAME LOG ─────────────────────────────────────

function renderDrillDownGames(games) {
    if (!games || games.length === 0) {
        return '<p class="text-xs text-gray-500 italic px-2 py-2">No game data available.</p>';
    }
    const rows = games.map(g => {
        const q1d = g.teamScore[0] - g.oppScore[0];
        const q2d = g.teamScore[1] - g.oppScore[1];
        const q3d = g.teamScore[2] - g.oppScore[2];
        const q4d = g.teamScore[3] - g.oppScore[3];
        const wentOT = g.teamScore.length > 4 || g.oppScore.length > 4;
        const otCell = wentOT ? `${g.teamScore[4] ?? 0}-${g.oppScore[4] ?? 0}` : '-';
        const h1t = g.teamScore[0] + g.teamScore[1], h1o = g.oppScore[0] + g.oppScore[1];
        const h2t = g.teamScore[2] + g.teamScore[3], h2o = g.oppScore[2] + g.oppScore[3];
        const diff = g.teamFinal - g.oppFinal;
        const wl = diff > 0 ? 'W' : diff < 0 ? 'L' : 'T';
        const wlClass = diff > 0 ? 'text-green-700 font-bold' : diff < 0 ? 'text-red-600 font-bold' : 'text-blue-500 font-bold';
        return `<tr class="hover:bg-gray-50">
            <td class="px-2 py-1">${g.week}</td>
            <td class="px-2 py-1 whitespace-nowrap">${g.isHome ? 'vs' : '@'} ${g.opponent}</td>
            <td class="px-2 py-1">${g.teamScore[0]}-${g.oppScore[0]} <span class="${ccDiffColor(q1d)}">${ccFmtDiff(q1d)}</span></td>
            <td class="px-2 py-1">${g.teamScore[1]}-${g.oppScore[1]} <span class="${ccDiffColor(q2d)}">${ccFmtDiff(q2d)}</span></td>
            <td class="px-2 py-1">${g.teamScore[2]}-${g.oppScore[2]} <span class="${ccDiffColor(q3d)}">${ccFmtDiff(q3d)}</span></td>
            <td class="px-2 py-1">${g.teamScore[3]}-${g.oppScore[3]} <span class="${ccDiffColor(q4d)}">${ccFmtDiff(q4d)}</span></td>
            <td class="px-2 py-1 text-center">${otCell}</td>
            <td class="px-2 py-1">${h1t}-${h1o}</td>
            <td class="px-2 py-1">${h2t}-${h2o}</td>
            <td class="px-2 py-1 font-medium">${g.teamFinal}-${g.oppFinal}</td>
            <td class="px-2 py-1 ${wlClass}">${wl} ${diff >= 0 ? '+' : ''}${diff}</td>
        </tr>`;
    }).join('');
    return `<div class="overflow-x-auto">
        <table class="min-w-full text-xs">
            <thead><tr class="bg-gray-100 text-gray-500">
                <th class="px-2 py-1 text-left">Wk</th>
                <th class="px-2 py-1 text-left">Opp</th>
                <th class="px-2 py-1 text-left">Q1</th><th class="px-2 py-1 text-left">Q2</th>
                <th class="px-2 py-1 text-left">Q3</th><th class="px-2 py-1 text-left">Q4</th>
                <th class="px-2 py-1 text-center">OT</th>
                <th class="px-2 py-1 text-left">H1</th><th class="px-2 py-1 text-left">H2</th>
                <th class="px-2 py-1 text-left">Final</th><th class="px-2 py-1 text-left">+/-</th>
            </tr></thead>
            <tbody>${rows}</tbody>
        </table>
    </div>`;
}

// ─────────────────────────── COACH CARD ──────────────────────────────────────

let coachCardShowRecords = false;

function openCoachCard(name) {
    const history = getCoachHistory(name);
    if (history.length === 0) {
        alert(`No data found for "${name}" in seasons 2021–2025.`);
        return;
    }

    coachCardShowRecords = false;
    document.getElementById('coachCardToggle').textContent = 'Show Records';
    document.getElementById('coachCardName').textContent = name;

    const roleLabels = [...new Set(history.map(e => e.role))].join(' / ');
    const subtitle = history.length === 1
        ? `${history[0].season} — ${NFL_TEAMS[history[0].team]?.name || history[0].team} (${history[0].role})`
        : `${roleLabels} · ${history.length} season${history.length > 1 ? 's' : ''} (2021–2025 data)`;
    document.getElementById('coachCardSubtitle').textContent = subtitle;

    const summaries = history.map(e => ({ ...buildSeasonSummary(e.team, e.season), role: e.role }));
    currentCoachSummaries = summaries;

    renderCoachCardBody(name, summaries);
    document.getElementById('coachCardOverlay').classList.remove('hidden');
}

function closeCoachCard() {
    document.getElementById('coachCardOverlay').classList.add('hidden');
    currentCoachSummaries = null;
}

function renderCoachCardBody(name, summaries) {
    const body = document.getElementById('coachCardBody');
    body.innerHTML = '';

    const tableHeader = `<thead><tr class="bg-gray-100 text-gray-500 text-xs">
        <th class="px-2 py-1 text-left w-52">Season / Team</th>
        <th class="px-2 py-1 text-left">Q1</th><th class="px-2 py-1 text-left">Q2</th>
        <th class="px-2 py-1 text-left">Q3</th><th class="px-2 py-1 text-left">Q4</th>
        <th class="px-2 py-1 text-center">OT</th>
        <th class="px-2 py-1 text-left">H1</th><th class="px-2 py-1 text-left">H2</th>
        <th class="px-2 py-1 text-left">Final</th><th class="px-2 py-1 text-left">+/-</th>
    </tr></thead>`;

    summaries.forEach((s) => {
        const teamName = NFL_TEAMS[s.team]?.name || s.team;
        const label = `${s.season} · ${teamName} (${s.role})`;

        const wrapper = document.createElement('div');
        wrapper.className = 'border border-gray-200 rounded-lg overflow-hidden';

        // Clickable header to toggle drill-down
        const headerRow = document.createElement('div');
        headerRow.className = 'bg-gray-50 px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 select-none';
        headerRow.innerHTML = `
            <span class="chevron text-gray-400 text-xs mr-1">▶</span>
            <span class="text-xs font-semibold text-gray-700">${label}</span>`;

        // Totals table row
        const totalsTable = document.createElement('div');
        totalsTable.className = 'overflow-x-auto bg-white';
        totalsTable.innerHTML = `<table class="min-w-full text-xs">${tableHeader}<tbody>
            <tr class="totals-row border-t border-gray-200">
                <td class="px-2 py-1.5 text-xs font-semibold text-gray-700">${label}</td>
                <td class="px-2 py-1.5 text-xs">${buildQCell(s, 'Q1', coachCardShowRecords)}</td>
                <td class="px-2 py-1.5 text-xs">${buildQCell(s, 'Q2', coachCardShowRecords)}</td>
                <td class="px-2 py-1.5 text-xs">${buildQCell(s, 'Q3', coachCardShowRecords)}</td>
                <td class="px-2 py-1.5 text-xs">${buildQCell(s, 'Q4', coachCardShowRecords)}</td>
                <td class="px-2 py-1.5 text-xs text-center">${s.hadOT ? s.otFor + '-' + s.otAg : '-'}</td>
                <td class="px-2 py-1.5 text-xs">${buildHCell(s, 'H1', coachCardShowRecords)}</td>
                <td class="px-2 py-1.5 text-xs">${buildHCell(s, 'H2', coachCardShowRecords)}</td>
                <td class="px-2 py-1.5 text-xs font-medium">${buildFinalCell(s, coachCardShowRecords)}</td>
                <td class="px-2 py-1.5 text-xs">${buildDiffCell(s)}</td>
            </tr>
        </tbody></table>`;

        // Drill-down container (hidden by default)
        const drillDown = document.createElement('div');
        drillDown.className = 'hidden border-t border-gray-200 bg-white px-3 pb-3 pt-1';
        drillDown.innerHTML = renderDrillDownGames(s.games);

        headerRow.addEventListener('click', () => {
            const isOpen = !drillDown.classList.contains('hidden');
            drillDown.classList.toggle('hidden', isOpen);
            headerRow.querySelector('.chevron').textContent = isOpen ? '▶' : '▼';
        });

        wrapper.appendChild(headerRow);
        wrapper.appendChild(totalsTable);
        wrapper.appendChild(drillDown);
        body.appendChild(wrapper);
    });

    // Career totals
    const career = buildCareerTotals(summaries);
    const careerDiv = document.createElement('div');
    careerDiv.className = 'border-2 border-blue-400 rounded-lg overflow-hidden';
    careerDiv.innerHTML = `<div class="overflow-x-auto bg-blue-50">
        <table class="min-w-full text-xs">
            <thead><tr class="bg-blue-100 text-blue-700 text-xs">
                <th class="px-2 py-1 text-left w-52">Career Total</th>
                <th class="px-2 py-1 text-left">Q1</th><th class="px-2 py-1 text-left">Q2</th>
                <th class="px-2 py-1 text-left">Q3</th><th class="px-2 py-1 text-left">Q4</th>
                <th class="px-2 py-1 text-center">OT</th>
                <th class="px-2 py-1 text-left">H1</th><th class="px-2 py-1 text-left">H2</th>
                <th class="px-2 py-1 text-left">Final</th><th class="px-2 py-1 text-left">+/-</th>
            </tr></thead>
            <tbody><tr id="careerTotalsRow" class="font-semibold bg-blue-50">
                <td class="px-2 py-2 text-xs font-bold text-blue-800">
                    ${career.wins}-${career.losses}${career.ties > 0 ? '-' + career.ties : ''} (${career.gamesPlayed} games)
                </td>
                ${buildCareerCells(career, coachCardShowRecords)}
            </tr></tbody>
        </table>
    </div>`;
    body.appendChild(careerDiv);
}

// ─────────────────────── COACH CARD TOGGLE ───────────────────────────────────

function toggleCoachCardMode(summaries) {
    coachCardShowRecords = !coachCardShowRecords;
    document.getElementById('coachCardToggle').textContent = coachCardShowRecords ? 'Show Totals' : 'Show Records';

    const body = document.getElementById('coachCardBody');
    const totalsRows = body.querySelectorAll('.totals-row');
    totalsRows.forEach((tr, idx) => {
        const s = summaries[idx];
        if (!s) return;
        const tds = tr.querySelectorAll('td');
        if (tds.length < 10) return;
        tds[1].innerHTML = buildQCell(s, 'Q1', coachCardShowRecords);
        tds[2].innerHTML = buildQCell(s, 'Q2', coachCardShowRecords);
        tds[3].innerHTML = buildQCell(s, 'Q3', coachCardShowRecords);
        tds[4].innerHTML = buildQCell(s, 'Q4', coachCardShowRecords);
        tds[6].innerHTML = buildHCell(s, 'H1', coachCardShowRecords);
        tds[7].innerHTML = buildHCell(s, 'H2', coachCardShowRecords);
        tds[8].innerHTML = buildFinalCell(s, coachCardShowRecords);
    });

    const careerRow = document.getElementById('careerTotalsRow');
    if (careerRow) {
        const career = buildCareerTotals(summaries);
        careerRow.innerHTML = `
            <td class="px-2 py-2 text-xs font-bold text-blue-800">
                ${career.wins}-${career.losses}${career.ties > 0 ? '-' + career.ties : ''} (${career.gamesPlayed} games)
            </td>
            ${buildCareerCells(career, coachCardShowRecords)}`;
    }
}
