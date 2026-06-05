$csvPath = "c:\Users\chand\Downloads\movies_metadata.csv"
$outputPath = "c:\Users\chand\Desktop\MOvies_Recommender\data.js"
$limit = 2000

Write-Host "Reading CSV..."
$data = Import-Csv -Path $csvPath | Select-Object -First $limit

$movies = @()

foreach ($row in $data) {
    if (-not $row.title -or -not $row.poster_path -or -not $row.release_date) { continue }

    # Extract genres using regex to avoid JSON parsing issues with single quotes
    $genres = @()
    $matches = [regex]::Matches($row.genres, "'name': '([^']+)'")
    foreach ($match in $matches) {
        $genres += $match.Groups[1].Value
    }

    $year = if ($row.release_date.Length -ge 4) { $row.release_date.Substring(0, 4) } else { "Unknown" }
    
    $movie = @{
        id = $row.id
        title = $row.title
        genre = $genres
        rating = $row.vote_average
        type = "Movie"
        year = $year
        description = $row.overview
        image = "https://image.tmdb.org/t/p/w500" + $row.poster_path
    }
    
    $movies += $movie
}

$json = $movies | ConvertTo-Json -Depth 4
$jsContent = "const moviesData = $json;`n`n// Group unique genres for the filter UI`nconst allGenres = [...new Set(moviesData.flatMap(movie => movie.genre))].sort();"

$jsContent | Out-File -FilePath $outputPath -Encoding utf8
Write-Host "Done. Wrote $($movies.Count) movies to $outputPath"
