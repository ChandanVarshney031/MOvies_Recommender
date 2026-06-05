import csv
import json
import ast
import os

csv_path = r'c:\Users\chand\Downloads\movies_metadata.csv'
output_path = r'c:\Users\chand\Desktop\MOvies_Recommender\data.js'
limit = 2000 # User asked for 2000 movies, but we can process more if valid

movies = []

print(f"Reading from {csv_path}...")

try:
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        count = 0
        for row in reader:
            if count >= limit:
                break
                
            try:
                # Basic validation
                if not row['title'] or not row['poster_path'] or not row['release_date']:
                    continue

                # Parse Genres
                # The CSV has genres as: "[{'id': 16, 'name': 'Animation'}, ...]"
                # This is python-like string representation of list of dicts
                try:
                    genres_list = ast.literal_eval(row['genres'])
                    genre_names = [g['name'] for g in genres_list]
                except:
                    genre_names = []
                
                # Parse Year
                year = row['release_date'].split('-')[0] if row['release_date'] else "Unknown"
                
                # Parse Rating
                try:
                    rating = float(row['vote_average'])
                except:
                    rating = 0.0

                movie = {
                    "id": row['id'],
                    "title": row['title'],
                    "genre": genre_names,
                    "rating": rating,
                    "type": "Movie", # Defaulting to Movie
                    "year": year,
                    "description": row['overview'].replace('"', '\\"').replace('\n', ' '), # Simple escape
                    "image": f"https://image.tmdb.org/t/p/w500{row['poster_path']}"
                }
                
                movies.append(movie)
                count += 1
                
            except Exception as e:
                # print(f"Skipping row due to error: {e}")
                continue

    # Generate JS content
    js_content = "const moviesData = " + json.dumps(movies, indent=4) + ";\n\n"
    js_content += "// Group unique genres for the filter UI\n"
    js_content += "const allGenres = [...new Set(moviesData.flatMap(movie => movie.genre))].sort();\n"

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(js_content)

    print(f"Successfully wrote {len(movies)} movies to {output_path}")

except Exception as e:
    print(f"Error: {e}")
