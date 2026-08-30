import json
import re

# Read the JSON file
with open('data/nfl-2024.json', 'r') as f:
    content = f.read()

# Replace all homeScore arrays with 4 elements to have 5 elements (adding "-" for OT)
content = re.sub(r'"homeScore": \[([0-9, ]+)\]', r'"homeScore": [\1, "-"]', content)

# Replace all awayScore arrays with 4 elements to have 5 elements (adding "-" for OT)
content = re.sub(r'"awayScore": \[([0-9, ]+)\]', r'"awayScore": [\1, "-"]', content)

# Write the updated content back to the file
with open('data/nfl-2024.json', 'w') as f:
    f.write(content)

print("Successfully added overtime column to all game scores!")
