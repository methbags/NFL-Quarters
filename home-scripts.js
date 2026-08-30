// NFL Teams data
const nflTeams = [
    { abbr: 'ARI', name: 'Arizona Cardinals', logo: 'arizona-cardinals.png', color: '#97233F' },
    { abbr: 'ATL', name: 'Atlanta Falcons', logo: 'atlanta-falcons.png', color: '#A71930' },
    { abbr: 'BAL', name: 'Baltimore Ravens', logo: 'baltimore-ravens.png', color: '#241773' },
    { abbr: 'BUF', name: 'Buffalo Bills', logo: 'buffalo-bills.png', color: '#00338D' },
    { abbr: 'CAR', name: 'Carolina Panthers', logo: 'carolina-panthers.png', color: '#0085CA' },
    { abbr: 'CHI', name: 'Chicago Bears', logo: 'chicago-bears.png', color: '#0B162A' },
    { abbr: 'CIN', name: 'Cincinnati Bengals', logo: 'cincinatti-bengals.png', color: '#FB4F14' },
    { abbr: 'CLE', name: 'Cleveland Browns', logo: 'cleveland-browns.png', color: '#311D00' },
    { abbr: 'DAL', name: 'Dallas Cowboys', logo: 'dallas-cowboys.png', color: '#041E42' },
    { abbr: 'DEN', name: 'Denver Broncos', logo: 'denver-broncos.png', color: '#FB4F14' },
    { abbr: 'DET', name: 'Detroit Lions', logo: 'detroit-lions.png', color: '#0076B6' },
    { abbr: 'GB', name: 'Green Bay Packers', logo: 'greenbay-packers.png', color: '#203731' },
    { abbr: 'HOU', name: 'Houston Texans', logo: 'houston-texans.png', color: '#03202F' },
    { abbr: 'IND', name: 'Indianapolis Colts', logo: 'indianapolis-colts.png', color: '#002C5F' },
    { abbr: 'JAX', name: 'Jacksonville Jaguars', logo: 'jacksonville-jaguars.png', color: '#101820' },
    { abbr: 'KC', name: 'Kansas City Chiefs', logo: 'kansascity-chiefs.png', color: '#E31837' },
    { abbr: 'LV', name: 'Las Vegas Raiders', logo: 'lasvegas-raiders.png', color: '#000000' },
    { abbr: 'LAC', name: 'Los Angeles Chargers', logo: 'losangeles-chargers.png', color: '#0080C6' },
    { abbr: 'LAR', name: 'Los Angeles Rams', logo: 'losangeles-rams.png', color: '#003594' },
    { abbr: 'MIA', name: 'Miami Dolphins', logo: 'miami-dolphins.png', color: '#008E97' },
    { abbr: 'MIN', name: 'Minnesota Vikings', logo: 'minnesota-vikings.png', color: '#4F2683' },
    { abbr: 'NE', name: 'New England Patriots', logo: 'newengland-patriots.png', color: '#002244' },
    { abbr: 'NO', name: 'New Orleans Saints', logo: 'neworleans-saints.png', color: '#D3BC8D' },
    { abbr: 'NYG', name: 'New York Giants', logo: 'newyork-giants.png', color: '#0B2265' },
    { abbr: 'NYJ', name: 'New York Jets', logo: 'newyork-jets.png', color: '#125740' },
    { abbr: 'PHI', name: 'Philadelphia Eagles', logo: 'philadelphia-eagles.png', color: '#004C54' },
    { abbr: 'PIT', name: 'Pittsburgh Steelers', logo: 'pittsburgh-steelers.png', color: '#FFB612' },
    { abbr: 'SF', name: 'San Francisco 49ers', logo: 'sanfrancisco-49ers.png', color: '#AA0000' },
    { abbr: 'SEA', name: 'Seattle Seahawks', logo: 'seattle-seahawks.png', color: '#002244' },
    { abbr: 'TB', name: 'Tampa Bay Buccaneers', logo: 'tampabay-buccaneers.png', color: '#D50A0A' },
    { abbr: 'TEN', name: 'Tennessee Titans', logo: 'tennessee-titans.png', color: '#0C2340' },
    { abbr: 'WSH', name: 'Washington Commanders', logo: 'washington-commanders.png', color: '#5A1414' }
];

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

// Global variables
let NFL_DATA = {};
let currentSeason = '2024';
let bests25Mode = 'differential'; // 'differential' or 'records' for Bests of '25
let bests26Mode = 'differential'; // 'differential' or 'records' for Bests of '26
let bestTrendsMode = 'points'; // 'points' or 'records'
let upcomingGames = [];
let teamDifferentials = {};

// Global variables for Best Trends
let bestTrends = [];

// Global variables for Bests sections
let allTeamStats25 = {}; // For Bests of '25
let allTeamStats26 = {}; // For Bests of '26

// Initialize the home page
document.addEventListener('DOMContentLoaded', async function() {
    populateTeamList();
    await loadNFLData(); // Load NFL data for Custom Search
    await loadBestsOf26();
    await loadBestsOf25();
    await loadBestTrends();
    
    // Set up automatic updating for Best Trends every 30 minutes
    setInterval(async () => {
        console.log('Updating Best Trends...');
        await loadBestTrends();
    }, 30 * 60 * 1000); // 30 minutes
    
    // Set up Best Trends toggle button
    const bestTrendsToggle = document.getElementById('bestTrendsToggle');
    if (bestTrendsToggle) {
        bestTrendsToggle.addEventListener('click', function() {
            console.log('Toggle clicked, current mode:', bestTrendsMode);
            bestTrendsMode = bestTrendsMode === 'points' ? 'records' : 'points';
            console.log('New mode:', bestTrendsMode);
            this.textContent = bestTrendsMode === 'points' ? 'Show Records' : 'Show +/-';
            
            // Recalculate trends with new mode
            const currentTime = new Date();
            const upcomingMatchups = upcomingGames.filter(game => {
                const gameTime = new Date(game.date);
                const hoursFromNow = (gameTime - currentTime) / (1000 * 60 * 60);
                return hoursFromNow > -1 && hoursFromNow <= 168;
            });
            
            console.log('Toggle: Recalculating trends with mode:', bestTrendsMode);
            const newTrends = findBestTrends(upcomingMatchups);
            console.log('Toggle: New trends calculated:', newTrends.length);
            bestTrends = newTrends;
            displayBestTrends();
        });
    }
    
    // Add toggle button functionality for Bests of '26
    const bests26Toggle = document.getElementById('bests26Toggle');
    if (bests26Toggle) {
        bests26Toggle.addEventListener('click', function() {
            bests26Mode = bests26Mode === 'differential' ? 'record' : 'differential';
            this.textContent = bests26Mode === 'differential' ? 'Show Records' : 'Show +/-';
            updateBests26Display();
        });
    }

    // Add toggle button functionality for Bests of '25
    const bests25Toggle = document.getElementById('bests25Toggle');
    if (bests25Toggle) {
        bests25Toggle.addEventListener('click', function() {
            bests25Mode = bests25Mode === 'differential' ? 'record' : 'differential';
            this.textContent = bests25Mode === 'differential' ? 'Show Records' : 'Show +/-';
            updateBests25Display();
        });
    }
    
    // Add home button click handler (stays on home page)
    const homeButton = document.getElementById('homeButton');
    if (homeButton) {
        homeButton.addEventListener('click', function() {
            window.location.href = 'home.html';
        });
    }
    
    // Initialize Custom Search functionality
    initializeCustomSearch();
    
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
});

// NFL Team data with logos and divisions
const NFL_TEAMS = {
    'ARI': { name: 'Arizona Cardinals', logo: 'arizona-cardinals.png', division: 'NFC West', conference: 'NFC' },
    'ATL': { name: 'Atlanta Falcons', logo: 'atlanta-falcons.png', division: 'NFC South', conference: 'NFC' },
    'BAL': { name: 'Baltimore Ravens', logo: 'baltimore-ravens.png', division: 'AFC North', conference: 'AFC' },
    'BUF': { name: 'Buffalo Bills', logo: 'buffalo-bills.png', division: 'AFC East', conference: 'AFC' },
    'CAR': { name: 'Carolina Panthers', logo: 'carolina-panthers.png', division: 'NFC South', conference: 'NFC' },
    'CHI': { name: 'Chicago Bears', logo: 'chicago-bears.png', division: 'NFC North', conference: 'NFC' },
    'CIN': { name: 'Cincinnati Bengals', logo: 'cincinatti-bengals.png', division: 'AFC North', conference: 'AFC' },
    'CLE': { name: 'Cleveland Browns', logo: 'cleveland-browns.png', division: 'AFC North', conference: 'AFC' },
    'DAL': { name: 'Dallas Cowboys', logo: 'dallas-cowboys.png', division: 'NFC East', conference: 'NFC' },
    'DEN': { name: 'Denver Broncos', logo: 'denver-broncos.png', division: 'AFC West', conference: 'AFC' },
    'DET': { name: 'Detroit Lions', logo: 'detroit-lions.png', division: 'NFC North', conference: 'NFC' },
    'GB': { name: 'Green Bay Packers', logo: 'greenbay-packers.png', division: 'NFC North', conference: 'NFC' },
    'HOU': { name: 'Houston Texans', logo: 'houston-texans.png', division: 'AFC South', conference: 'AFC' },
    'IND': { name: 'Indianapolis Colts', logo: 'indianapolis-colts.png', division: 'AFC South', conference: 'AFC' },
    'JAX': { name: 'Jacksonville Jaguars', logo: 'jacksonville-jaguars.png', division: 'AFC South', conference: 'AFC' },
    'KC': { name: 'Kansas City Chiefs', logo: 'kansascity-chiefs.png', division: 'AFC West', conference: 'AFC' },
    'LV': { name: 'Las Vegas Raiders', logo: 'lasvegas-raiders.png', division: 'AFC West', conference: 'AFC' },
    'LAC': { name: 'Los Angeles Chargers', logo: 'losangeles-chargers.png', division: 'AFC West', conference: 'AFC' },
    'LAR': { name: 'Los Angeles Rams', logo: 'losangeles-rams.png', division: 'NFC West', conference: 'NFC' },
    'MIA': { name: 'Miami Dolphins', logo: 'miami-dolphins.png', division: 'AFC East', conference: 'AFC' },
    'MIN': { name: 'Minnesota Vikings', logo: 'minnesota-vikings.png', division: 'NFC North', conference: 'NFC' },
    'NE': { name: 'New England Patriots', logo: 'newengland-patriots.png', division: 'AFC East', conference: 'AFC' },
    'NO': { name: 'New Orleans Saints', logo: 'neworleans-saints.png', division: 'NFC South', conference: 'NFC' },
    'NYG': { name: 'New York Giants', logo: 'newyork-giants.png', division: 'NFC East', conference: 'NFC' },
    'NYJ': { name: 'New York Jets', logo: 'newyork-jets.png', division: 'AFC East', conference: 'AFC' },
    'PHI': { name: 'Philadelphia Eagles', logo: 'philadelphia-eagles.png', division: 'NFC East', conference: 'NFC' },
    'PIT': { name: 'Pittsburgh Steelers', logo: 'pittsburgh-steelers.png', division: 'AFC North', conference: 'AFC' },
    'SF': { name: 'San Francisco 49ers', logo: 'sanfrancisco-49ers.png', division: 'NFC West', conference: 'NFC' },
    'SEA': { name: 'Seattle Seahawks', logo: 'seattle-seahawks.png', division: 'NFC West', conference: 'NFC' },
    'TB': { name: 'Tampa Bay Buccaneers', logo: 'tampabay-buccaneers.png', division: 'NFC South', conference: 'NFC' },
    'TEN': { name: 'Tennessee Titans', logo: 'tennessee-titans.png', division: 'AFC South', conference: 'AFC' },
    'WSH': { name: 'Washington Commanders', logo: 'washington-commanders.png', division: 'NFC East', conference: 'NFC' }
};

// Function to initialize Custom Search
function initializeCustomSearch() {
    console.log('Initializing Custom Search...');
    
    // Initialize searchable dropdowns
    initializeSearchableDropdown('team');
    initializeSearchableDropdown('opponent');
    
    // Add submit button event listener
    const submitButton = document.getElementById('customSearchSubmit');
    if (submitButton) {
        submitButton.addEventListener('click', performCustomSearch);
    }
    
    // Add auto-search functionality
    setupAutoSearch();
}

// Function to initialize searchable dropdown
function initializeSearchableDropdown(type) {
    const input = document.getElementById(`${type}Select`);
    const dropdown = document.getElementById(`${type}Dropdown`);
    const search = document.getElementById(`${type}Search`);
    const options = document.getElementById(`${type}Options`);
    
    if (!input || !dropdown || !search || !options) return;
    
    // Store selected value and text
    let selectedValue = '';
    let selectedText = '';
    
    // Style the input with NFL logo initially
    input.style.backgroundImage = "url('team-logos/nfl-logo.png')";
    input.style.backgroundRepeat = 'no-repeat';
    input.style.backgroundPosition = '4px center';
    input.style.backgroundSize = '16px 16px';
    input.style.paddingLeft = '24px';
    input.style.cursor = 'pointer';
    
    // Populate options
    populateDropdownOptions(type, options, '');
    
    // Show dropdown when input is clicked
    input.addEventListener('click', function() {
        dropdown.classList.remove('hidden');
        search.focus();
        search.value = '';
        populateDropdownOptions(type, options, '');
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
    
    // Filter options as user types
    search.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        populateDropdownOptions(type, options, searchTerm);
    });
    
    // Handle option selection
    options.addEventListener('click', function(e) {
        const option = e.target.closest('.dropdown-option');
        if (option) {
            selectedValue = option.dataset.value;
            selectedText = option.textContent;
            
            input.value = selectedText;
            input.setAttribute('data-value', selectedValue);
            
            // Update background image
            if (selectedValue && NFL_TEAMS[selectedValue]) {
                input.style.backgroundImage = `url('team-logos/${NFL_TEAMS[selectedValue].logo}')`;
            } else {
                input.style.backgroundImage = "url('team-logos/nfl-logo.png')";
            }
            
            dropdown.classList.add('hidden');
            
            // Trigger auto-search after selection
            checkAndAutoSearch();
        }
    });
}

// Function to populate dropdown options
function populateDropdownOptions(type, container, searchTerm) {
    container.innerHTML = '';
    
    // Add special options for opponent dropdown
    if (type === 'opponent') {
        const specialOptions = [
            { value: 'division', text: 'Division Rivals' },
            { value: 'afc', text: 'AFC' },
            { value: 'nfc', text: 'NFC' }
        ];
        
        specialOptions.forEach(option => {
            if (option.text.toLowerCase().includes(searchTerm)) {
                const div = document.createElement('div');
                div.className = 'dropdown-option px-3 py-2 hover:bg-blue-100 cursor-pointer';
                div.dataset.value = option.value;
                div.textContent = option.text;
                container.appendChild(div);
            }
        });
        
        // Add separator if we have special options and teams
        if (searchTerm === '' || Object.values(NFL_TEAMS).some(team => team.name.toLowerCase().includes(searchTerm))) {
            const separator = document.createElement('div');
            separator.className = 'border-t border-gray-200 my-1';
            container.appendChild(separator);
        }
    }
    
    // Add team options
    Object.entries(NFL_TEAMS).forEach(([abbr, team]) => {
        if (team.name.toLowerCase().includes(searchTerm) || abbr.toLowerCase().includes(searchTerm)) {
            const div = document.createElement('div');
            div.className = 'dropdown-option px-3 py-2 hover:bg-blue-100 cursor-pointer flex items-center';
            div.dataset.value = abbr;
            div.style.paddingLeft = '24px';
            div.style.backgroundImage = `url('team-logos/${team.logo}')`;
            div.style.backgroundRepeat = 'no-repeat';
            div.style.backgroundPosition = '4px center';
            div.style.backgroundSize = '16px 16px';
            div.textContent = team.name;
            container.appendChild(div);
        }
    });
}

// Function to setup auto-search functionality
function setupAutoSearch() {
    // Add change listeners to all dropdown elements
    const periodSelect = document.getElementById('periodSelect');
    const locationSelect = document.getElementById('locationSelect');
    const fromYearSelect = document.getElementById('fromYearSelect');
    const toYearSelect = document.getElementById('toYearSelect');
    
    if (periodSelect) {
        periodSelect.addEventListener('change', checkAndAutoSearch);
    }
    if (locationSelect) {
        locationSelect.addEventListener('change', checkAndAutoSearch);
    }
    if (fromYearSelect) {
        fromYearSelect.addEventListener('change', checkAndAutoSearch);
    }
    if (toYearSelect) {
        toYearSelect.addEventListener('change', checkAndAutoSearch);
    }
}

// Function to check if all fields are filled and auto-search
function checkAndAutoSearch() {
    // Small delay to ensure DOM updates are complete
    setTimeout(() => {
        const team = document.getElementById('teamSelect').getAttribute('data-value') || '';
        const period = document.getElementById('periodSelect').value;
        const location = document.getElementById('locationSelect').value;
        const opponent = document.getElementById('opponentSelect').getAttribute('data-value') || '';
        const fromYear = document.getElementById('fromYearSelect').value;
        const toYear = document.getElementById('toYearSelect').value;
        
        // Check if all fields are filled
        if (team && period && location && opponent && fromYear && toYear) {
            console.log('All fields filled, auto-searching...');
            performCustomSearch();
        }
    }, 100);
}

// Function to perform custom search
function performCustomSearch() {
    console.log('Performing custom search...');
    console.log('NFL_DATA available:', Object.keys(NFL_DATA));
    
    const team = document.getElementById('teamSelect').getAttribute('data-value') || '';
    const period = document.getElementById('periodSelect').value;
    const location = document.getElementById('locationSelect').value;
    const opponent = document.getElementById('opponentSelect').getAttribute('data-value') || '';
    const fromYear = document.getElementById('fromYearSelect').value;
    const toYear = document.getElementById('toYearSelect').value;
    
    // Validate inputs
    if (!team || !period || !location || !opponent || !fromYear || !toYear) {
        alert('Please fill in all dropdown selections.');
        return;
    }
    
    if (parseInt(fromYear) > parseInt(toYear)) {
        alert('From year cannot be greater than To year.');
        return;
    }
    
    console.log('Search parameters:', { team, period, location, opponent, fromYear, toYear });
    
    // Check if NFL_DATA is loaded
    if (Object.keys(NFL_DATA).length === 0) {
        alert('NFL data is still loading. Please wait a moment and try again.');
        return;
    }
    
    // Get matching games
    const matchingGames = findMatchingGames(team, period, location, opponent, fromYear, toYear);
    
    // Calculate record
    const record = calculateCustomRecord(matchingGames, team, period);
    
    // Display results
    displayCustomSearchResults(team, period, location, opponent, fromYear, toYear, record, matchingGames);
}

// Function to find matching games
function findMatchingGames(team, period, location, opponent, fromYear, toYear) {
    console.log('Finding matching games...');
    console.log('Team:', team, 'NFL_TEAMS has team:', !!NFL_TEAMS[team]);
    let matchingGames = [];
    
    // Loop through years
    for (let year = parseInt(fromYear); year <= parseInt(toYear); year++) {
        const yearData = NFL_DATA[year.toString()];
        console.log(`Year ${year}: ${yearData ? yearData.length : 0} games available`);
        if (!yearData) continue;
        
        // Sample first game to check data structure
        if (yearData.length > 0) {
            console.log('Sample game structure:', Object.keys(yearData[0]));
        }
        
        // Loop through games for this team
        yearData.forEach((game, index) => {
            // Skip null games or games without scores (unplayed games)
            if (!game || !game.finalHome || !game.finalAway || 
                game.finalHome === null || game.finalAway === null ||
                game.finalHome === undefined || game.finalAway === undefined ||
                (game.finalHome === 0 && game.finalAway === 0)) {
                return;
            }
            
            const isHomeGame = game.homeTeam === team;
            const isAwayGame = game.awayTeam === team;
            
            if (index < 5) { // Log first 5 games for debugging
                console.log(`Game ${index}: ${game.homeTeam} vs ${game.awayTeam}, looking for ${team}`);
            }
            
            if (!isHomeGame && !isAwayGame) return;
            
            console.log(`Found game with ${team}: ${game.homeTeam} vs ${game.awayTeam}`);
            
            // Check location filter
            if (location === 'home' && !isHomeGame) return;
            if (location === 'away' && !isAwayGame) return;
            
            // Get opponent team
            const opponentTeam = isHomeGame ? game.awayTeam : game.homeTeam;
            
            // Check opponent filter
            if (opponent === 'division') {
                // Check if opponent is in same division
                if (!NFL_TEAMS[team] || !NFL_TEAMS[opponentTeam] || 
                    NFL_TEAMS[team].division !== NFL_TEAMS[opponentTeam].division) return;
            } else if (opponent === 'afc') {
                if (!NFL_TEAMS[opponentTeam] || NFL_TEAMS[opponentTeam].conference !== 'AFC') return;
            } else if (opponent === 'nfc') {
                if (!NFL_TEAMS[opponentTeam] || NFL_TEAMS[opponentTeam].conference !== 'NFC') return;
            } else if (opponent !== 'division' && opponent !== 'afc' && opponent !== 'nfc') {
                // Specific team selected
                if (opponentTeam !== opponent) return;
            }
            
            matchingGames.push({
                ...game,
                year: year,
                isHome: isHomeGame,
                opponent: opponentTeam
            });
        });
    }
    
    console.log(`Found ${matchingGames.length} matching games`);
    
    // Sort games by year and week (most recent first)
    matchingGames.sort((a, b) => {
        if (a.year !== b.year) {
            return b.year - a.year; // Most recent year first
        }
        return b.week - a.week; // Most recent week first within same year
    });
    
    return matchingGames;
}

// Function to calculate custom record
function calculateCustomRecord(games, team, period) {
    let wins = 0, losses = 0, ties = 0;
    let totalPointsFor = 0, totalPointsAgainst = 0;
    
    games.forEach(game => {
        let teamScore, opponentScore;
        
        if (period === 'full') {
            teamScore = game.isHome ? game.finalHome : game.finalAway;
            opponentScore = game.isHome ? game.finalAway : game.finalHome;
        } else {
            // Quarter or half scoring using homeScore/awayScore arrays
            const teamQuarters = game.isHome ? game.homeScore : game.awayScore;
            const oppQuarters = game.isHome ? game.awayScore : game.homeScore;
            
            if (period === 'Q1') {
                teamScore = teamQuarters[0];
                opponentScore = oppQuarters[0];
            } else if (period === 'Q2') {
                teamScore = teamQuarters[1];
                opponentScore = oppQuarters[1];
            } else if (period === 'Q3') {
                teamScore = teamQuarters[2];
                opponentScore = oppQuarters[2];
            } else if (period === 'Q4') {
                teamScore = teamQuarters[3];
                opponentScore = oppQuarters[3];
            } else if (period === 'H1') {
                teamScore = teamQuarters[0] + teamQuarters[1];
                opponentScore = oppQuarters[0] + oppQuarters[1];
            } else if (period === 'H2') {
                teamScore = teamQuarters[2] + teamQuarters[3];
                opponentScore = oppQuarters[2] + oppQuarters[3];
            }
        }
        
        // Add to totals for differential calculation
        totalPointsFor += teamScore;
        totalPointsAgainst += opponentScore;
        
        if (teamScore > opponentScore) wins++;
        else if (teamScore < opponentScore) losses++;
        else ties++;
    });
    
    const differential = totalPointsFor - totalPointsAgainst;
    return { wins, losses, ties, total: games.length, differential, pointsFor: totalPointsFor, pointsAgainst: totalPointsAgainst };
}

// Function to display custom search results
function displayCustomSearchResults(team, period, location, opponent, fromYear, toYear, record, games) {
    const resultsContainer = document.getElementById('customSearchResults');
    if (!resultsContainer) return;
    
    // Build description
    const teamName = NFL_TEAMS[team]?.name || team;
    const periodText = period === 'full' ? 'Full Game' : 
                      period === 'Q1' ? '1st Quarter' :
                      period === 'Q2' ? '2nd Quarter' :
                      period === 'Q3' ? '3rd Quarter' :
                      period === 'Q4' ? '4th Quarter' :
                      period === 'H1' ? '1st Half' : '2nd Half';
    const locationText = location === 'both' ? 'Home & Away' :
                        location === 'home' ? 'Home' : 'Away';
    const opponentText = opponent === 'division' ? 'Division Rivals' :
                        opponent === 'afc' ? 'AFC' :
                        opponent === 'nfc' ? 'NFC' :
                        NFL_TEAMS[opponent]?.name || opponent;
    
    // Calculate win percentage and differential display
    const winPct = record.total > 0 ? (record.wins + 0.5 * record.ties) / record.total : 0;
    const recordColor = winPct > 0.5 ? 'text-green-600' : 'text-red-600';
    const recordText = record.ties > 0 ? `${record.wins}-${record.losses}-${record.ties}` : `${record.wins}-${record.losses}`;
    
    // Format differential with + sign for positive values
    const differentialText = record.differential >= 0 ? `+${record.differential}` : `${record.differential}`;
    const differentialColor = record.differential >= 0 ? 'text-green-600' : 'text-red-600';
    
    resultsContainer.innerHTML = `
        <div class="mb-4">
            <p class="text-lg font-medium mb-2">
                ${teamName}: ${periodText} record @ ${locationText} vs ${opponentText} from ${fromYear} to ${toYear}
            </p>
            <p class="text-xl font-bold ${recordColor} mb-4">
                Record: ${recordText} (${(winPct * 100).toFixed(1)}%) | <span class="${differentialColor}">+/-: ${differentialText}</span>
            </p>
        </div>
        
        <div class="space-y-2">
            <h3 class="text-lg font-semibold mb-3">Game Results (${games.length} games):</h3>
            ${games.map(game => {
                const gameResult = formatGameResult(game, team, period);
                return `<div class="p-3 bg-gray-50 rounded border">${gameResult}</div>`;
            }).join('')}
        </div>
    `;
}

// Function to format individual game result
function formatGameResult(game, team, period) {
    const opponent = game.opponent;
    const opponentName = NFL_TEAMS[opponent]?.name || opponent;
    const location = game.isHome ? 'vs' : '@';
    const date = `${game.year} Week ${game.week}`;
    
    let teamScore, opponentScore, result;
    
    if (period === 'full') {
        teamScore = game.isHome ? game.finalHome : game.finalAway;
        opponentScore = game.isHome ? game.finalAway : game.finalHome;
    } else {
        // Calculate period-specific scores using homeScore/awayScore arrays
        const teamQuarters = game.isHome ? game.homeScore : game.awayScore;
        const oppQuarters = game.isHome ? game.awayScore : game.homeScore;
        
        if (period === 'Q1') {
            teamScore = teamQuarters[0];
            opponentScore = oppQuarters[0];
        } else if (period === 'Q2') {
            teamScore = teamQuarters[1];
            opponentScore = oppQuarters[1];
        } else if (period === 'Q3') {
            teamScore = teamQuarters[2];
            opponentScore = oppQuarters[2];
        } else if (period === 'Q4') {
            teamScore = teamQuarters[3];
            opponentScore = oppQuarters[3];
        } else if (period === 'H1') {
            teamScore = teamQuarters[0] + teamQuarters[1];
            opponentScore = oppQuarters[0] + oppQuarters[1];
        } else if (period === 'H2') {
            teamScore = teamQuarters[2] + teamQuarters[3];
            opponentScore = oppQuarters[2] + oppQuarters[3];
        }
    }
    
    if (teamScore > opponentScore) result = 'W';
    else if (teamScore < opponentScore) result = 'L';
    else result = 'T';
    
    const resultColor = result === 'W' ? 'text-green-600' : result === 'L' ? 'text-red-600' : 'text-yellow-600';
    
    return `
        <div class="flex justify-between items-center">
            <span>${date} - ${location} ${opponentName}</span>
            <span class="font-bold ${resultColor}">${result} ${teamScore}-${opponentScore}</span>
        </div>
    `;
}

// Function to load NFL data for all years
async function loadNFLData() {
    console.log('Loading NFL data for Custom Search...');
    try {
        const years = ['2021', '2022', '2023', '2024', '2025'];
        
        for (const year of years) {
            try {
                const response = await fetch(`data/nfl-${year}.json`);
                if (response.ok) {
                    const data = await response.json();
                    NFL_DATA[year] = data;
                    console.log(`Loaded ${data.length} games for ${year}`);
                } else {
                    console.warn(`Failed to load data for ${year}`);
                }
            } catch (error) {
                console.warn(`Error loading ${year} data:`, error);
            }
        }
        
        console.log('NFL_DATA loaded:', Object.keys(NFL_DATA));
    } catch (error) {
        console.error('Error loading NFL data:', error);
    }
}

function populateTeamList() {
    const teamList = document.getElementById('teamList');
    if (!teamList) {
        console.log('teamList element not found');
        return;
    }
    
    console.log('Populating team list with', nflTeams.length, 'teams');
    teamList.innerHTML = '';
    
    const favorites = getFavoriteTeams();
    const sortedTeams = [...nflTeams].sort((a, b) => {
        const aFav = favorites.includes(a.abbr);
        const bFav = favorites.includes(b.abbr);
        if (aFav !== bFav) return aFav ? -1 : 1;
        return a.abbr.localeCompare(b.abbr);
    });
    
    sortedTeams.forEach(team => {
        const isFavorite = favorites.includes(team.abbr);
        
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
            logoText.textContent = team.abbr;
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
            toggleFavoriteTeam(team.abbr);
        };
        
        row.appendChild(infoDiv);
        row.appendChild(starButton);
        row.onclick = () => enterTracker(team.abbr);
        teamList.appendChild(row);
    });
    
    console.log('Team list populated successfully');
}

function enterTracker(teamAbbr = null, season = '2026') {
    // Store preferences in localStorage
    if (teamAbbr) {
        localStorage.setItem('selectedTeam', teamAbbr);
    }
    localStorage.setItem('selectedSeason', season);
    
    // Navigate to main tracker
    window.location.href = 'index.html';
}

function loadSeason(season) {
    // Store selected season and navigate to tracker
    localStorage.setItem('selectedSeason', season);
    window.location.href = 'index.html';
}

function showLoading() {
    // Add loading state if needed
    console.log('Loading...');
}

function hideLoading() {
    // Remove loading state if needed
    console.log('Loading complete');
}

function calculateAllTeamStats(seasonData) {
    const teamStats = {};
    
    // Initialize stats for all teams
    nflTeams.forEach(team => {
        teamStats[team.abbr] = {
            Q1: { scored: 0, allowed: 0, games: 0, wins: 0, losses: 0, ties: 0 },
            Q2: { scored: 0, allowed: 0, games: 0, wins: 0, losses: 0, ties: 0 },
            Q3: { scored: 0, allowed: 0, games: 0, wins: 0, losses: 0, ties: 0 },
            Q4: { scored: 0, allowed: 0, games: 0, wins: 0, losses: 0, ties: 0 },
            H1: { scored: 0, allowed: 0, games: 0, wins: 0, losses: 0, ties: 0 },
            H2: { scored: 0, allowed: 0, games: 0, wins: 0, losses: 0, ties: 0 }
        };
    });
    
    // Process each game
    seasonData.forEach(game => {
        const homeTeam = game.homeTeam;
        const awayTeam = game.awayTeam;
        
        // Skip games without score data
        if (!game.homeScore || !game.awayScore || game.finalHome === null || game.finalAway === null) {
            return;
        }
        
        // Process quarters
        for (let q = 0; q < 4; q++) {
            const quarterKey = `Q${q + 1}`;
            const homeQ = game.homeScore[q];
            const awayQ = game.awayScore[q];
            
            if (homeQ !== undefined && awayQ !== undefined) {
                teamStats[homeTeam][quarterKey].scored += homeQ;
                teamStats[homeTeam][quarterKey].allowed += awayQ;
                teamStats[homeTeam][quarterKey].games++;
                
                teamStats[awayTeam][quarterKey].scored += awayQ;
                teamStats[awayTeam][quarterKey].allowed += homeQ;
                teamStats[awayTeam][quarterKey].games++;
                
                // Track wins/losses/ties for quarters
                if (homeQ > awayQ) {
                    teamStats[homeTeam][quarterKey].wins++;
                    teamStats[awayTeam][quarterKey].losses++;
                } else if (homeQ < awayQ) {
                    teamStats[homeTeam][quarterKey].losses++;
                    teamStats[awayTeam][quarterKey].wins++;
                } else {
                    teamStats[homeTeam][quarterKey].ties++;
                    teamStats[awayTeam][quarterKey].ties++;
                }
            }
        }
        
        // Process halves
        const homeH1 = game.homeScore[0] + game.homeScore[1];
        const awayH1 = game.awayScore[0] + game.awayScore[1];
        const homeH2 = game.homeScore[2] + game.homeScore[3];
        const awayH2 = game.awayScore[2] + game.awayScore[3];
        
        teamStats[homeTeam].H1.scored += homeH1;
        teamStats[homeTeam].H1.allowed += awayH1;
        teamStats[homeTeam].H1.games++;
        teamStats[homeTeam].H2.scored += homeH2;
        teamStats[homeTeam].H2.allowed += awayH2;
        teamStats[homeTeam].H2.games++;
        
        teamStats[awayTeam].H1.scored += awayH1;
        teamStats[awayTeam].H1.allowed += homeH1;
        teamStats[awayTeam].H1.games++;
        teamStats[awayTeam].H2.scored += awayH2;
        teamStats[awayTeam].H2.allowed += homeH2;
        teamStats[awayTeam].H2.games++;
        
        // Track wins/losses/ties for halves
        if (homeH1 > awayH1) {
            teamStats[homeTeam].H1.wins++;
            teamStats[awayTeam].H1.losses++;
        } else if (homeH1 < awayH1) {
            teamStats[homeTeam].H1.losses++;
            teamStats[awayTeam].H1.wins++;
        } else {
            teamStats[homeTeam].H1.ties++;
            teamStats[awayTeam].H1.ties++;
        }
        
        if (homeH2 > awayH2) {
            teamStats[homeTeam].H2.wins++;
            teamStats[awayTeam].H2.losses++;
        } else if (homeH2 < awayH2) {
            teamStats[homeTeam].H2.losses++;
            teamStats[awayTeam].H2.wins++;
        } else {
            teamStats[homeTeam].H2.ties++;
            teamStats[awayTeam].H2.ties++;
        }
    });
    
    // Calculate differentials and sort teams
    const categories = ['Q1', 'Q2', 'Q3', 'Q4', 'H1', 'H2'];
    const results = {};
    
    categories.forEach(category => {
        const teamDifferentials = [];
        
        Object.keys(teamStats).forEach(teamAbbr => {
            const stats = teamStats[teamAbbr][category];
            if (stats.games > 0) {
                const differential = stats.scored - stats.allowed;
                const winPct = stats.games > 0 ? (stats.wins + (stats.ties * 0.5)) / stats.games : 0;
                teamDifferentials.push({
                    team: teamAbbr,
                    differential: differential,
                    avgDifferential: differential / stats.games,
                    wins: stats.wins,
                    losses: stats.losses,
                    ties: stats.ties,
                    winPct: winPct,
                    record: `${stats.wins}-${stats.losses}${stats.ties > 0 ? `-${stats.ties}` : ''}`
                });
            }
        });
        
        // Sort by total differential (descending) - this will be used for differential mode
        teamDifferentials.sort((a, b) => b.differential - a.differential);
        results[category] = teamDifferentials;
    });
    
    return results;
}

// Load and populate Bests of '26 data
async function loadBestsOf26() {
    try {
        const response = await fetch('data/nfl-2026.json');
        if (!response.ok) {
            console.error('Failed to load 2026 data');
            return;
        }
        const nfl2026Data = await response.json();
        allTeamStats26 = calculateAllTeamStats(nfl2026Data);
        updateBests26Display();
    } catch (error) {
        console.error('Error loading Bests of 26 data:', error);
    }
}

function populateColumn26(category, teamData) {
    const columnDiv = document.querySelector(`[data-category-26="${category}"]`);
    if (!columnDiv) {
        console.error(`Column for ${category} not found in Bests of '26`);
        return;
    }
    columnDiv.innerHTML = '';
    let sortedData = [...teamData];
    if (bests26Mode === 'record') {
        sortedData.sort((a, b) => {
            if (b.winPct !== a.winPct) return b.winPct - a.winPct;
            return b.wins - a.wins;
        });
    }
    const topTeams = sortedData.slice(0, 8);
    topTeams.forEach((teamInfo, index) => {
        const el = document.createElement('div');
        el.className = 'text-xs text-green-600 font-medium';
        if (bests26Mode === 'record') {
            el.textContent = `${index + 1}. ${teamInfo.team} (${teamInfo.record})`;
        } else {
            const sign = teamInfo.differential >= 0 ? '+' : '';
            el.textContent = `${index + 1}. ${teamInfo.team} (${sign}${teamInfo.differential})`;
        }
        columnDiv.appendChild(el);
    });
    const sep = document.createElement('div');
    sep.className = 'border-t border-gray-200 my-2';
    columnDiv.appendChild(sep);
    const bottomTeams = sortedData.slice(-8);
    bottomTeams.forEach((teamInfo, index) => {
        const el = document.createElement('div');
        el.className = 'text-xs text-red-600 font-medium';
        const rank = sortedData.length - 8 + index + 1;
        if (bests26Mode === 'record') {
            el.textContent = `${rank}. ${teamInfo.team} (${teamInfo.record})`;
        } else {
            const sign = teamInfo.differential >= 0 ? '+' : '';
            el.textContent = `${rank}. ${teamInfo.team} (${sign}${teamInfo.differential})`;
        }
        columnDiv.appendChild(el);
    });
}

function updateBests26Display() {
    if (!allTeamStats26) return;
    ['Q1', 'Q2', 'Q3', 'Q4', 'H1', 'H2'].forEach(cat => {
        if (allTeamStats26[cat] && allTeamStats26[cat].length > 0) {
            populateColumn26(cat, allTeamStats26[cat]);
        }
    });
}

// Load and populate Bests of '25 data
async function loadBestsOf25() {
    try {
        // Load 2025 NFL data
        const response = await fetch('data/nfl-2025.json');
        if (!response.ok) {
            console.error('Failed to load 2025 data');
            return;
        }
        const nfl2025Data = await response.json();
        
        // Calculate team stats for each category
        allTeamStats25 = calculateAllTeamStats(nfl2025Data);
        
        // Initial display
        updateBests25Display();
        
    } catch (error) {
        console.error('Error loading Bests of 25 data:', error);
    }
}

function populateColumn25(category, teamData) {
    const columnDiv = document.querySelector(`[data-category-25="${category}"]`);
    if (!columnDiv) {
        console.error(`Column for ${category} not found in Bests of '25`);
        return;
    }
    
    populateColumnContent25(columnDiv, teamData);
}

function populateColumnContent25(columnDiv, teamData) {
    columnDiv.innerHTML = '';
    
    // Sort data based on current mode
    let sortedData = [...teamData];
    if (bests25Mode === 'record') {
        sortedData.sort((a, b) => {
            // Sort by win percentage first, then by wins as tiebreaker
            if (b.winPct !== a.winPct) {
                return b.winPct - a.winPct;
            }
            return b.wins - a.wins;
        });
    }
    
    // Top 8 teams (green)
    const topTeams = sortedData.slice(0, 8);
    topTeams.forEach((teamInfo, index) => {
        const teamElement = document.createElement('div');
        teamElement.className = 'text-xs text-green-600 font-medium';
        
        if (bests25Mode === 'record') {
            teamElement.textContent = `${index + 1}. ${teamInfo.team} (${teamInfo.record})`;
        } else {
            const diffSign = teamInfo.differential >= 0 ? '+' : '';
            teamElement.textContent = `${index + 1}. ${teamInfo.team} (${diffSign}${teamInfo.differential})`;
        }
        columnDiv.appendChild(teamElement);
    });
    
    // Add separator
    const separator = document.createElement('div');
    separator.className = 'border-t border-gray-200 my-2';
    columnDiv.appendChild(separator);
    
    // Bottom 8 teams (red) - ranks 25-32
    const bottomTeams = sortedData.slice(-8);
    bottomTeams.forEach((teamInfo, index) => {
        const teamElement = document.createElement('div');
        teamElement.className = 'text-xs text-red-600 font-medium';
        const rank = sortedData.length - 8 + index + 1;
        
        if (bests25Mode === 'record') {
            teamElement.textContent = `${rank}. ${teamInfo.team} (${teamInfo.record})`;
        } else {
            const diffSign = teamInfo.differential >= 0 ? '+' : '';
            teamElement.textContent = `${rank}. ${teamInfo.team} (${diffSign}${teamInfo.differential})`;
        }
        columnDiv.appendChild(teamElement);
    });
}

function updateBests25Display() {
    if (!allTeamStats25) return;
    
    // Populate each column with current mode
    populateColumn25('Q1', allTeamStats25.Q1);
    populateColumn25('Q2', allTeamStats25.Q2);
    populateColumn25('Q3', allTeamStats25.Q3);
    populateColumn25('Q4', allTeamStats25.Q4);
    populateColumn25('H1', allTeamStats25.H1);
    populateColumn25('H2', allTeamStats25.H2);
}

// Helper function to get current week of NFL season from 2025 data
function getCurrentWeekOfSeason(seasonData) {
    if (!seasonData || seasonData.length === 0) return 1;
    
    // Find the highest week number with completed games (non-null scores)
    let currentWeek = 1;
    for (const game of seasonData) {
        if (game.finalHome !== null && game.finalAway !== null && game.week > currentWeek) {
            currentWeek = game.week;
        }
    }
    
    // If we have completed games, the current week is the next week
    // If no completed games, we're still in week 1
    const hasCompletedGames = seasonData.some(game => game.finalHome !== null && game.finalAway !== null);
    return hasCompletedGames ? currentWeek + 1 : 1;
}

// Load and populate Best Trends data
async function loadBestTrends() {
    try {
        // Load upcoming schedule from ESPN API
        console.log('Loading Best Trends...');
        upcomingGames = await fetchUpcomingGamesFromAPI();
        console.log('Upcoming games loaded:', upcomingGames.length, 'games');
        
        if (upcomingGames.length === 0) {
            console.warn('No upcoming games found from any API source');
        }
        
        // Load 2025 data first to determine current week
        const data2025Response = await fetch('data/nfl-2025.json');
        if (!data2025Response.ok) {
            console.error('Failed to load 2025 season data');
            return;
        }
        const data2025 = await data2025Response.json();
        
        // Determine current week of 2025 season
        const currentWeek = getCurrentWeekOfSeason(data2025);
        console.log('Current week of 2025 season:', currentWeek);
        
        // Load 2024 data only if we're before week 5 of 2025 season
        let data2024 = [];
        if (currentWeek < 5) {
            console.log('Loading 2024 data (current week < 5)');
            const data2024Response = await fetch('data/nfl-2024.json');
            if (data2024Response.ok) {
                data2024 = await data2024Response.json();
            } else {
                console.warn('Failed to load 2024 data, using 2025 only');
            }
        } else {
            console.log('Skipping 2024 data (current week >= 5)');
        }
        
        // Calculate team differentials
        window.teamDifferentials = calculateTeamDifferentials(data2024, data2025, currentWeek);
        console.log('Team differentials calculated');
        
        // Get upcoming games and find best trends
        const currentTime = new Date();
        const upcomingMatchups = upcomingGames.filter(game => {
            const gameTime = new Date(game.date);
            const hoursFromNow = (gameTime - currentTime) / (1000 * 60 * 60);
            return hoursFromNow > -1 && hoursFromNow <= 168;
        });
        
        bestTrends = findBestTrends(upcomingMatchups);
        console.log('Best trends found:', bestTrends.length, 'trends');
        
        // Display best trends
        displayBestTrends();
        
    } catch (error) {
        console.error('Error loading Best Trends data:', error);
    }
}

function calculateTeamDifferentials(data2024, data2025, currentWeek) {
    const teamStats = {};
    
    // Initialize stats for all teams
    nflTeams.forEach(team => {
        teamStats[team.abbr] = {
            Q1: { scored: 0, allowed: 0, games: 0, wins: 0, losses: 0, ties: 0 },
            Q2: { scored: 0, allowed: 0, games: 0, wins: 0, losses: 0, ties: 0 },
            Q3: { scored: 0, allowed: 0, games: 0, wins: 0, losses: 0, ties: 0 },
            Q4: { scored: 0, allowed: 0, games: 0, wins: 0, losses: 0, ties: 0 },
            H1: { scored: 0, allowed: 0, games: 0, wins: 0, losses: 0, ties: 0 },
            H2: { scored: 0, allowed: 0, games: 0, wins: 0, losses: 0, ties: 0 }
        };
    });
    
    // Process data based on current week
    // If currentWeek >= 5, only use 2025 data; otherwise use both seasons
    const allData = currentWeek >= 5 ? [...data2025] : [...data2024, ...data2025];
    console.log(`Processing ${allData.length} games (week ${currentWeek}, using ${currentWeek >= 5 ? '2025 only' : '2024 + 2025'})`);
    
    allData.forEach(game => {
        const homeTeam = game.homeTeam;
        const awayTeam = game.awayTeam;
        
        // Skip games without score data
        if (!game.homeScore || !game.awayScore || game.finalHome === null || game.finalAway === null) {
            return;
        }
        
        // Process quarters
        for (let q = 0; q < 4; q++) {
            const quarterKey = `Q${q + 1}`;
            const homeQ = game.homeScore[q];
            const awayQ = game.awayScore[q];
            
            if (homeQ !== undefined && awayQ !== undefined && homeQ !== null && awayQ !== null) {
                teamStats[homeTeam][quarterKey].scored += homeQ;
                teamStats[homeTeam][quarterKey].allowed += awayQ;
                teamStats[homeTeam][quarterKey].games++;
                
                teamStats[awayTeam][quarterKey].scored += awayQ;
                teamStats[awayTeam][quarterKey].allowed += homeQ;
                teamStats[awayTeam][quarterKey].games++;
                
                // Calculate wins/losses/ties for this quarter
                if (homeQ > awayQ) {
                    teamStats[homeTeam][quarterKey].wins++;
                    teamStats[awayTeam][quarterKey].losses++;
                } else if (homeQ < awayQ) {
                    teamStats[homeTeam][quarterKey].losses++;
                    teamStats[awayTeam][quarterKey].wins++;
                } else {
                    teamStats[homeTeam][quarterKey].ties++;
                    teamStats[awayTeam][quarterKey].ties++;
                }
            }
        }
        
        // Process halves
        const homeH1 = game.homeScore[0] + game.homeScore[1];
        const awayH1 = game.awayScore[0] + game.awayScore[1];
        const homeH2 = game.homeScore[2] + game.homeScore[3];
        const awayH2 = game.awayScore[2] + game.awayScore[3];
        
        if (!isNaN(homeH1) && !isNaN(awayH1)) {
            teamStats[homeTeam].H1.scored += homeH1;
            teamStats[homeTeam].H1.allowed += awayH1;
            teamStats[homeTeam].H1.games++;
            
            teamStats[awayTeam].H1.scored += awayH1;
            teamStats[awayTeam].H1.allowed += homeH1;
            teamStats[awayTeam].H1.games++;
            
            // Calculate wins/losses/ties for first half
            if (homeH1 > awayH1) {
                teamStats[homeTeam].H1.wins++;
                teamStats[awayTeam].H1.losses++;
            } else if (homeH1 < awayH1) {
                teamStats[homeTeam].H1.losses++;
                teamStats[awayTeam].H1.wins++;
            } else {
                teamStats[homeTeam].H1.ties++;
                teamStats[awayTeam].H1.ties++;
            }
        }
        
        if (!isNaN(homeH2) && !isNaN(awayH2)) {
            teamStats[homeTeam].H2.scored += homeH2;
            teamStats[homeTeam].H2.allowed += awayH2;
            teamStats[homeTeam].H2.games++;
            
            teamStats[awayTeam].H2.scored += awayH2;
            teamStats[awayTeam].H2.allowed += homeH2;
            teamStats[awayTeam].H2.games++;
            
            // Calculate wins/losses/ties for second half
            if (homeH2 > awayH2) {
                teamStats[homeTeam].H2.wins++;
                teamStats[awayTeam].H2.losses++;
            } else if (homeH2 < awayH2) {
                teamStats[homeTeam].H2.losses++;
                teamStats[awayTeam].H2.wins++;
            } else {
                teamStats[homeTeam].H2.ties++;
                teamStats[awayTeam].H2.ties++;
            }
        }
    });
    
    // Calculate differentials
    Object.keys(teamStats).forEach(team => {
        ['Q1', 'Q2', 'Q3', 'Q4', 'H1', 'H2'].forEach(period => {
            const stats = teamStats[team][period];
            stats.differential = stats.scored - stats.allowed;
        });
    });
    
    return teamStats;
}

function findBestTrends(upcomingMatchups) {
    console.log('findBestTrends called with mode:', bestTrendsMode);
    
    console.log('Using passed upcomingMatchups:', upcomingMatchups.length);
    console.log('Team differentials keys:', Object.keys(window.teamDifferentials));
    const sampleTeam = Object.keys(window.teamDifferentials)[0];
    console.log('Sample team differential:', window.teamDifferentials[sampleTeam]);
    console.log('Sample Q1 data:', window.teamDifferentials[sampleTeam].Q1);
    console.log('Best trends mode:', bestTrendsMode);
    
    const trends = [];
    
    upcomingMatchups.forEach(matchup => {
        const homeStats = window.teamDifferentials[matchup.homeTeam];
        const awayStats = window.teamDifferentials[matchup.awayTeam];
        
        if (!homeStats || !awayStats) {
            console.log(`Missing stats for ${matchup.homeTeam} or ${matchup.awayTeam}`);
            return;
        }
        
        // Check each quarter and half
        ['Q1', 'Q2', 'Q3', 'Q4', 'H1', 'H2'].forEach(period => {
            let homeDiff, awayDiff, gap, betterTeam, worseTeam, betterDiff, worseDiff;
            
            if (bestTrendsMode === 'points') {
                // Point differential mode - access the differential property
                homeDiff = homeStats[period].differential;
                awayDiff = awayStats[period].differential;
                gap = Math.abs(homeDiff - awayDiff);
                betterTeam = homeDiff > awayDiff ? matchup.homeTeam : matchup.awayTeam;
                worseTeam = homeDiff > awayDiff ? matchup.awayTeam : matchup.homeTeam;
                betterDiff = Math.max(homeDiff, awayDiff);
                worseDiff = Math.min(homeDiff, awayDiff);
            } else {
                // Record differential mode - check if we have wins/losses data
                console.log(`Checking ${period} stats for ${matchup.homeTeam}:`, homeStats[period]);
                console.log(`Checking ${period} stats for ${matchup.awayTeam}:`, awayStats[period]);
                
                const homeWins = homeStats[period].wins || 0;
                const homeLosses = homeStats[period].losses || 0;
                const homeTies = homeStats[period].ties || 0;
                const awayWins = awayStats[period].wins || 0;
                const awayLosses = awayStats[period].losses || 0;
                const awayTies = awayStats[period].ties || 0;
                
                const homeTotal = homeWins + homeLosses + homeTies;
                const awayTotal = awayWins + awayLosses + awayTies;
                
                console.log(`${matchup.homeTeam} ${period}: ${homeWins}W-${homeLosses}L-${homeTies}T (${homeTotal} total)`);
                console.log(`${matchup.awayTeam} ${period}: ${awayWins}W-${awayLosses}L-${awayTies}T (${awayTotal} total)`);
                
                // Winning Percentage = (Wins + 0.5 * Ties) / Total Games Played
                const homeWinPct = homeTotal > 0 ? ((homeWins + 0.5 * homeTies) / homeTotal) * 100 : 0;
                const awayWinPct = awayTotal > 0 ? ((awayWins + 0.5 * awayTies) / awayTotal) * 100 : 0;
                
                gap = Math.abs(homeWinPct - awayWinPct);
                betterTeam = homeWinPct > awayWinPct ? matchup.homeTeam : matchup.awayTeam;
                worseTeam = homeWinPct > awayWinPct ? matchup.awayTeam : matchup.homeTeam;
                
                // Store records for display
                const homeRecord = `${homeWins}-${homeLosses}${homeTies > 0 ? `-${homeTies}` : ''}`;
                const awayRecord = `${awayWins}-${awayLosses}${awayTies > 0 ? `-${awayTies}` : ''}`;
                
                betterDiff = betterTeam === matchup.homeTeam ? homeRecord : awayRecord;
                worseDiff = betterTeam === matchup.homeTeam ? awayRecord : homeRecord;
                
                console.log(`Win %: ${matchup.homeTeam}=${homeWinPct.toFixed(1)}%, ${matchup.awayTeam}=${awayWinPct.toFixed(1)}%, gap=${gap.toFixed(1)}`);
            }
            
            if (gap > 0) {
                console.log(`Adding trend: ${betterTeam} vs ${worseTeam}, mode: ${bestTrendsMode}, gap: ${gap}, betterDiff: ${betterDiff}, worseDiff: ${worseDiff}`);
                trends.push({
                    homeTeam: matchup.homeTeam,
                    awayTeam: matchup.awayTeam,
                    period: period,
                    gap: bestTrendsMode === 'points' ? Math.round(gap * 10) / 10 : Math.round(gap * 10) / 10,
                    betterTeam: betterTeam,
                    worseTeam: worseTeam,
                    betterDiff: bestTrendsMode === 'points' ? Math.round(betterDiff * 10) / 10 : betterDiff,
                    worseDiff: bestTrendsMode === 'points' ? Math.round(worseDiff * 10) / 10 : worseDiff,
                    gameDate: matchup.date,
                    mode: bestTrendsMode
                });
            }
        });
    });
    
    // Sort by gap (largest first) and return top 5
    return trends.sort((a, b) => b.gap - a.gap).slice(0, 5);
}

function displayBestTrends() {
    console.log('displayBestTrends called, bestTrends:', bestTrends);
    const trendsContainer = document.getElementById('bestTrendsContainer');
    if (!trendsContainer) {
        console.error('Best Trends container not found');
        return;
    }
    
    trendsContainer.innerHTML = '';
    
    if (!bestTrends || bestTrends.length === 0) {
        console.log('No trends to display, bestTrends:', bestTrends);
        trendsContainer.innerHTML = '<p class="text-gray-500 text-sm">No trends available</p>';
        return;
    }
    
    bestTrends.forEach((trend, index) => {
        const gameTime = new Date(trend.gameDate);
        const dayOfWeek = gameTime.toLocaleDateString('en-US', { weekday: 'short' });
        const timeString = gameTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        
        const trendElement = document.createElement('div');
        trendElement.className = 'mb-3 p-3 bg-gray-50 rounded-lg';
        
        const periodName = trend.period.startsWith('H') ? 
            (trend.period === 'H1' ? '1st Half' : '2nd Half') : 
            `${trend.period.slice(1)}${getOrdinalSuffix(trend.period.slice(1))} Quarter`;
        
        trendElement.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h4 class="font-semibold text-sm">${trend.homeTeam} vs ${trend.awayTeam} - ${periodName}</h4>
                    <p class="text-xs text-gray-600 mt-1">
                        <span class="text-green-600 font-medium">${trend.betterTeam}: ${trend.mode === 'points' ? '+' + trend.betterDiff : '(' + trend.betterDiff + ')'}</span> vs 
                        <span class="text-red-600 font-medium">${trend.worseTeam}: ${trend.mode === 'points' ? trend.worseDiff : '(' + trend.worseDiff + ')'}</span>
                    </p>
                    <p class="text-xs text-gray-500 mt-1">Gap: ${trend.gap} ${trend.mode === 'points' ? 'points' : 'percentage points'} • ${dayOfWeek} ${timeString}</p>
                </div>
                <div class="text-lg font-bold text-green-600">#${index + 1}</div>
            </div>
        `;
        
        trendsContainer.appendChild(trendElement);
    });
}

// Fetch upcoming games from ESPN's core API
async function fetchUpcomingGamesFromAPI() {
    try {
        console.log('Fetching upcoming games from ESPN core API...');
        
        // Try multiple ESPN API endpoints
        const approaches = [
            () => fetchFromESPNCoreAPI(),
            () => fetchFromESPNEventsAPI(),
            () => fetchFromESPNWithProxy()
        ];
        
        for (const approach of approaches) {
            try {
                const games = await approach();
                if (games && games.length > 0) {
                    console.log(`Successfully fetched ${games.length} games`);
                    return games;
                }
            } catch (error) {
                console.warn('Approach failed, trying next:', error.message);
            }
        }
        
        console.warn('All API approaches failed, returning empty array');
        return [];
        
    } catch (error) {
        console.error('Error in fetchUpcomingGamesFromAPI:', error);
        return [];
    }
}

// Try ESPN Core API (often has better CORS support)
async function fetchFromESPNCoreAPI() {
    console.log('Trying ESPN Core API...');
    
    const response = await fetch('https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events', {
        headers: {
            'Accept': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`ESPN Core API failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('ESPN Core API response:', data);
    
    return parseESPNCoreResponse(data);
}

// Try ESPN Events API
async function fetchFromESPNEventsAPI() {
    console.log('Trying ESPN Events API...');
    
    const currentDate = new Date();
    const twoWeeksFromNow = new Date(currentDate.getTime() + (14 * 24 * 60 * 60 * 1000));
    
    const startDate = formatDateForAPI(currentDate);
    const endDate = formatDateForAPI(twoWeeksFromNow);
    
    const response = await fetch(`https://site.web.api.espn.com/apis/fantasy/v2/games/ffl/games?dates=${startDate}-${endDate}&pbpOnly=false`, {
        headers: {
            'Accept': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`ESPN Events API failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('ESPN Events API response:', data);
    console.log('Events array length:', data.events ? data.events.length : 0);
    
    return parseESPNEventsResponse(data);
}

// Parse ESPN Core API response
function parseESPNCoreResponse(data) {
    const games = [];
    
    if (data && data.items) {
        data.items.forEach(item => {
            if (item && item.$ref) {
                // This API returns references, we'd need to make additional calls
                // For now, return empty to try other approaches
                console.log('ESPN Core API returned references, trying other approaches...');
            }
        });
    }
    
    return games;
}

// Parse ESPN Events API response (the one with 32 events)
function parseESPNEventsResponse(data) {
    const games = [];
    
    if (data && data.events && Array.isArray(data.events)) {
        console.log('Parsing', data.events.length, 'events from ESPN Events API');
        
        data.events.forEach((event, index) => {
            // ESPN Events API has competitors directly in event
            if (event && event.competitors && Array.isArray(event.competitors)) {
                if (event.competitors.length >= 2) {
                    const homeTeam = event.competitors.find(c => c.homeAway === 'home');
                    const awayTeam = event.competitors.find(c => c.homeAway === 'away');
                    
                    if (homeTeam && awayTeam && event.date) {
                        // Try multiple ways to get team abbreviations
                        const homeAbbr = homeTeam.team?.abbreviation || homeTeam.abbreviation || homeTeam.team?.displayName || homeTeam.displayName;
                        const awayAbbr = awayTeam.team?.abbreviation || awayTeam.abbreviation || awayTeam.team?.displayName || awayTeam.displayName;
                        
                        const game = {
                            date: event.date,
                            homeTeam: convertESPNTeamAbbr(homeAbbr),
                            awayTeam: convertESPNTeamAbbr(awayAbbr),
                            week: event.week?.number || 1,
                            status: event.status?.type?.name || 'scheduled'
                        };
                        
                        // Only include future games or games within 1 hour of start
                        const gameTime = new Date(game.date);
                        const now = new Date();
                        const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));
                        
                        if (gameTime > oneHourAgo) {
                            games.push(game);
                            console.log('Added game:', game.awayTeam, '@', game.homeTeam, 'on', gameTime.toLocaleString());
                        }
                    }
                }
            }
            // Also try the original competitions structure as fallback
            else if (event && event.competitions && event.competitions[0]) {
                const competition = event.competitions[0];
                const competitors = competition.competitors;
                
                if (competitors && competitors.length >= 2) {
                    const homeTeam = competitors.find(c => c.homeAway === 'home');
                    const awayTeam = competitors.find(c => c.homeAway === 'away');
                    
                    if (homeTeam && awayTeam && event.date) {
                        const game = {
                            date: event.date,
                            homeTeam: convertESPNTeamAbbr(homeTeam.team?.abbreviation || homeTeam.team?.displayName),
                            awayTeam: convertESPNTeamAbbr(awayTeam.team?.abbreviation || awayTeam.team?.displayName),
                            week: event.week?.number || 1,
                            status: event.status?.type?.name || 'scheduled'
                        };
                        
                        // Only include future games or games within 1 hour of start
                        const gameTime = new Date(game.date);
                        const now = new Date();
                        const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));
                        
                        if (gameTime > oneHourAgo) {
                            games.push(game);
                            console.log('Added game:', game.awayTeam, '@', game.homeTeam, 'on', gameTime.toLocaleString());
                        }
                    }
                }
            }
        });
    }
    
    console.log('Parsed', games.length, 'upcoming games from ESPN Events API');
    return games;
}

// Try ESPN API with CORS proxy
async function fetchFromESPNWithProxy() {
    const currentDate = new Date();
    const twoWeeksFromNow = new Date(currentDate.getTime() + (14 * 24 * 60 * 60 * 1000));
    
    const startDate = formatDateForAPI(currentDate);
    const endDate = formatDateForAPI(twoWeeksFromNow);
    
    // Use CORS proxy
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const espnUrl = `https://site.web.api.espn.com/apis/fantasy/v2/games/ffl/games?dates=${startDate}-${endDate}&pbpOnly=false`;
    const apiUrl = proxyUrl + encodeURIComponent(espnUrl);
    
    console.log('Trying ESPN API with CORS proxy...');
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(apiUrl, { 
        signal: controller.signal,
        headers: {
            'Accept': 'application/json'
        }
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
        console.error(`ESPN proxy failed: ${response.status} - ${response.statusText}`);
        throw new Error(`ESPN proxy failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('ESPN proxy response received:', data);
    const games = parseESPNResponse(data);
    console.log('Parsed games from ESPN proxy:', games.length);
    return games;
}

// Try ESPN API directly (might work in some browsers)
async function fetchFromESPNDirect() {
    const currentDate = new Date();
    const twoWeeksFromNow = new Date(currentDate.getTime() + (14 * 24 * 60 * 60 * 1000));
    
    const startDate = formatDateForAPI(currentDate);
    const endDate = formatDateForAPI(twoWeeksFromNow);
    
    const apiUrl = `https://site.web.api.espn.com/apis/fantasy/v2/games/ffl/games?dates=${startDate}-${endDate}&pbpOnly=false`;
    
    console.log('Trying ESPN API directly...');
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
        throw new Error(`ESPN direct failed: ${response.status}`);
    }
    
    const data = await response.json();
    return parseESPNResponse(data);
}

// Try alternative ESPN endpoint
async function fetchFromAlternativeAPI() {
    console.log('Trying alternative ESPN endpoint...');
    
    // Try the core API endpoint for current week
    const currentYear = new Date().getFullYear();
    const currentWeek = getCurrentNFLWeek();
    
    const apiUrl = `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/${currentYear}/types/2/weeks/${currentWeek}/events`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
        throw new Error(`Alternative API failed: ${response.status}`);
    }
    
    const data = await response.json();
    return parseAlternativeESPNResponse(data);
}

// Parse ESPN fantasy API response
function parseESPNResponse(data) {
    const games = [];
    
    if (data && data.events) {
        data.events.forEach(event => {
            if (event.competitions && event.competitions[0]) {
                const competition = event.competitions[0];
                const competitors = competition.competitors;
                
                if (competitors && competitors.length === 2) {
                    const homeTeam = competitors.find(c => c.homeAway === 'home');
                    const awayTeam = competitors.find(c => c.homeAway === 'away');
                    
                    if (homeTeam && awayTeam) {
                        games.push({
                            date: event.date,
                            homeTeam: convertESPNTeamAbbr(homeTeam.team.abbreviation),
                            awayTeam: convertESPNTeamAbbr(awayTeam.team.abbreviation),
                            week: event.week?.number || getCurrentNFLWeek()
                        });
                    }
                }
            }
        });
    }
    
    return games;
}

// Parse alternative ESPN API response
function parseAlternativeESPNResponse(data) {
    const games = [];
    
    if (data && data.items) {
        data.items.forEach(async (eventRef) => {
            try {
                // Each item is a reference, we'd need to fetch individual events
                // For now, return empty to avoid too many API calls
                console.log('Alternative API returned event references, need individual fetches');
            } catch (error) {
                console.warn('Error parsing alternative response:', error);
            }
        });
    }
    
    return games;
}

// Get current NFL week (rough estimate)
function getCurrentNFLWeek() {
    const now = new Date();
    const seasonStart = new Date(now.getFullYear(), 8, 5); // Rough NFL season start (Sept 5)
    
    if (now < seasonStart) {
        return 1;
    }
    
    const weeksSinceStart = Math.floor((now - seasonStart) / (7 * 24 * 60 * 60 * 1000));
    return Math.min(Math.max(weeksSinceStart + 1, 1), 18);
}

// No fallback needed - removed static schedule file

// Format date for ESPN API (YYYYMMDD)
function formatDateForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

// Convert ESPN team abbreviations to our format
function convertESPNTeamAbbr(espnAbbr) {
    const conversionMap = {
        'WSH': 'WSH', // Washington Commanders
        'WAS': 'WSH', // Old Washington abbreviation
        // Add other conversions if needed
    };
    return conversionMap[espnAbbr] || espnAbbr;
}

function getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    if (j == 1 && k != 11) return "st";
    if (j == 2 && k != 12) return "nd";
    if (j == 3 && k != 13) return "rd";
    return "th";
}

// Export functions for potential use in other files
window.HomePageUtils = {
    enterTracker,
    loadSeason,
    showLoading,
    hideLoading,
    loadBestsOf24,
    loadBestTrends,
    nflTeams
};
