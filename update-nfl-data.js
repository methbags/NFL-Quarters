// Fetches and reconciles NFL score data for a given season against ESPN's
// public scoreboard API. Fills in missing (null) games, corrects final-score
// mismatches (e.g. OT games previously recorded as ties), and normalizes the
// quarters/OT format so every season file is represented the same way:
//   - homeScore/awayScore are arrays of plain numbers.
//   - Length 4 = game ended in regulation (no 5th element at all).
//   - Length 5 = game went to overtime, index [4] is the real OT score
//     (including 0 if a team didn't score in OT - never a placeholder).
//
// Safe to re-run at any time. Usage: node update-nfl-data.js [season]
// Defaults to the 2025 season if no argument is given.

const fs = require('fs');
const path = require('path');

const SEASON = process.argv[2] || '2025';
const WEEKS = 18;
const DATA_FILE = path.join(__dirname, 'data', `nfl-${SEASON}.json`);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWeekScoreboard(week) {
    const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${SEASON}&seasontype=2&week=${week}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} for week ${week}`);
    }
    const data = await response.json();
    return data.events || [];
}

// Build a lookup of completed games keyed by "week|HOME|AWAY" abbreviations.
async function buildEspnResultsMap() {
    const results = new Map();

    for (let week = 1; week <= WEEKS; week++) {
        try {
            const events = await fetchWeekScoreboard(week);

            for (const event of events) {
                const competition = event.competitions && event.competitions[0];
                if (!competition) continue;

                const completed = !!(competition.status && competition.status.type && competition.status.type.completed);
                if (!completed) continue;

                const home = competition.competitors.find(c => c.homeAway === 'home');
                const away = competition.competitors.find(c => c.homeAway === 'away');
                if (!home || !away) continue;

                // Keep all periods (including OT) as plain numbers - never
                // truncate and never use a placeholder for "no OT".
                const homeQuarters = (home.linescores || []).map(p => Number(p.value ?? p.displayValue) || 0);
                const awayQuarters = (away.linescores || []).map(p => Number(p.value ?? p.displayValue) || 0);

                if (homeQuarters.length < 4 || awayQuarters.length < 4) continue;

                const key = `${week}|${home.team.abbreviation}|${away.team.abbreviation}`;
                results.set(key, {
                    homeScore: homeQuarters,
                    awayScore: awayQuarters,
                    finalHome: Number(home.score),
                    finalAway: Number(away.score),
                });
            }

            console.log(`Week ${week}: fetched ${events.length} events`);
        } catch (error) {
            console.error(`Error fetching week ${week}: ${error.message}`);
        }

        await sleep(200);
    }

    return results;
}

// True if any element isn't a plain number (catches string OT scores like
// "3", and placeholder entries like "-").
function hasBadFormatting(arr) {
    return Array.isArray(arr) && arr.some(v => typeof v !== 'number');
}

async function main() {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const games = JSON.parse(raw);

    const resultsMap = await buildEspnResultsMap();

    let updatedCount = 0;
    let correctedCount = 0;

    for (const game of games) {
        const key = `${game.week}|${game.homeTeam}|${game.awayTeam}`;
        const result = resultsMap.get(key);
        if (!result) continue;

        const alreadyFilled = game.homeScore !== null && game.awayScore !== null &&
            game.finalHome !== null && game.finalAway !== null;

        if (!alreadyFilled) {
            game.homeScore = result.homeScore;
            game.awayScore = result.awayScore;
            game.finalHome = result.finalHome;
            game.finalAway = result.finalAway;
            updatedCount++;
            console.log(`Updated Week ${game.week}: ${game.awayTeam} @ ${game.homeTeam} - ${result.finalAway}-${result.finalHome}`);
            continue;
        }

        // Fix mismatches against ESPN's authoritative data. This catches:
        //  - OT games previously recorded as ties (final score wrong)
        //  - games missing the OT period in the quarters array
        //  - non-numeric formatting (string OT scores, "-" placeholders)
        const finalMismatch = game.finalHome !== result.finalHome || game.finalAway !== result.finalAway;
        const periodsMismatch = game.homeScore.length !== result.homeScore.length ||
            game.awayScore.length !== result.awayScore.length;
        const formatMismatch = hasBadFormatting(game.homeScore) || hasBadFormatting(game.awayScore);
        const mismatched = finalMismatch || periodsMismatch || formatMismatch;

        if (mismatched) {
            console.log(`Correcting Week ${game.week}: ${game.awayTeam} @ ${game.homeTeam} - was ${JSON.stringify(game.homeScore)}/${JSON.stringify(game.awayScore)} (${game.finalAway}-${game.finalHome}), now ${JSON.stringify(result.homeScore)}/${JSON.stringify(result.awayScore)} (${result.finalAway}-${result.finalHome})`);
            game.homeScore = result.homeScore;
            game.awayScore = result.awayScore;
            game.finalHome = result.finalHome;
            game.finalAway = result.finalAway;
            correctedCount++;
        }
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(games, null, 4) + '\n');
    console.log(`\nDone. Updated ${updatedCount} game(s), corrected ${correctedCount} mismatched game(s) in ${DATA_FILE}`);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
