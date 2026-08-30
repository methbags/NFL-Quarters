# NFL Box Score Tracker

A comprehensive web application that tracks detailed quarter and half statistics for all NFL teams.

## Features

- **Complete Team Statistics**: Track quarter-by-quarter and half-by-half performance for all 32 NFL teams
- **Interactive Team Selection**: Easy-to-use sidebar with all NFL teams
- **Detailed Analytics**:
  - Quarter performance (points scored/allowed, records, +/-)
  - Half performance (1st/2nd half stats, records, +/-)
  - Average points per quarter/half
  - Point differentials by quarter/half
  - Win/loss records by quarter/half
- **Visual Charts**: Interactive charts showing points by quarter and point differentials
- **Game Log**: Detailed breakdown of each game with quarter scores, half scores, and +/-
- **Season Selection**: Support for multiple seasons (2021-2024)
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

1. Open `index.html` in your web browser
2. Select a season from the dropdown (defaults to 2024)
3. Click on any team from the sidebar to view their statistics
4. Explore the different sections:
   - **Quarter Statistics**: See how the team performs in each quarter
   - **Half Statistics**: View 1st and 2nd half performance
   - **Charts**: Visual representation of scoring patterns
   - **Game Log**: Detailed breakdown of every game

## Technical Details

- **Frontend**: HTML5, CSS3 (Tailwind CSS), JavaScript
- **Charts**: Chart.js for data visualization
- **Data**: Sample 2024 NFL season data with accurate quarter breakdowns
- **Responsive**: Mobile-friendly design using Tailwind CSS

## Data Structure

The app tracks the following statistics for each team:
- Points scored and allowed per quarter (Q1, Q2, Q3, Q4)
- Points scored and allowed per half (1st Half, 2nd Half)
- Win/loss/tie records for each quarter and half
- Point differentials (+/-) for quarters and halves
- Average scoring by period
- Complete game-by-game breakdown

## Sample Data

The application includes sample data from Week 1 of the 2024 NFL season with accurate quarter-by-quarter scoring breakdowns. This demonstrates the full functionality of the tracking system.

## Future Enhancements

- Add complete 2024 season data (all 272 games)
- Include playoff games
- Add team comparison features
- Export statistics to CSV/PDF
- Add more advanced analytics (trends, streaks, etc.)
- Integration with live NFL APIs for real-time data

## Running the Application

Simply open `index.html` in any modern web browser. No server setup required - it's a client-side application that runs entirely in the browser.
