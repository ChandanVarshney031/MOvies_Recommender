const fs = require('fs');

const csvPath = 'c:\\Users\\chand\\Downloads\\movies_metadata.csv';
const outputJsPath = 'c:\\Users\\chand\\Desktop\\MOvies_Recommender\\data.js';

console.log('Reading full CSV dataset...');
const data = fs.readFileSync(csvPath, 'utf8');

console.log('Parsing CSV rows...');
function parseCSV(text) {
    let p = '', row = [''], ret = [row], i = 0, r = 0, s = !0, l;
    for (l of text) {
        if ('"' === l) {
            if (s && l === p) row[i] += l;
            s = !s;
        } else if (',' === l && s) l = row[++i] = '';
        else if ('\n' === l && s) {
            if ('\r' === p) row[i] = row[i].slice(0, -1);
            row = ret[++r] = [l = '']; i = 0;
        } else row[i] += l;
        p = l;
    }
    return ret;
}

const rows = parseCSV(data);
console.log(`Total rows parsed: ${rows.length}`);

const headers = rows[0];
const hm = {};
headers.forEach((h, i) => hm[h.trim()] = i);

const limit = 2000;
const movies = [];

for (let i = 1; i < rows.length; i++) {
    if (movies.length >= limit) break;
    const r = rows[i];
    if (!r || r.length < Object.keys(hm).length) continue;

    const title = r[hm['title']];
    const poster_path = r[hm['poster_path']];
    const release_date = r[hm['release_date']];

    if (!title || typeof title !== 'string' || !poster_path || typeof poster_path !== 'string' || !release_date) continue;

    let genre_names = [];
    try {
        const genRaw = r[hm['genres']];
        if (genRaw && genRaw.length > 5) {
            // Replace single quotes with double quotes for valid JSON
            // Also need to handle cases where there is a real single quote inside Name
            // e.g. 'name': 'Science Fiction'
            let genJson = genRaw.replace(/'id':/g, '"id":').replace(/'name':/g, '"name":');
            genJson = genJson.replace(/:\s*'([^']+)'/g, ':"$1"');
            const arr = JSON.parse(genJson);
            if (Array.isArray(arr)) genre_names = arr.map(x => x.name);
        }
    } catch (e) { } // Ignore genre parse errors and just leave empty

    const year = String(release_date).split('-')[0] || "Unknown";
    const rating = parseFloat(r[hm['vote_average']]) || 0.0;
    const overview = r[hm['overview']] || "";

    movies.push({
        id: r[hm['id']] || limit + i,
        title: title,
        genre: genre_names,
        rating: rating,
        type: "Movie",
        year: year,
        description: typeof overview === 'string' ? overview.replace(/"/g, '\\"').replace(/\n/g, ' ') : "",
        image: `https://image.tmdb.org/t/p/w500${poster_path}`
    });
}

console.log(`Extracted ${movies.length} valid movies.`);

let js_content = "const moviesData = " + JSON.stringify(movies, null, 4) + ";\n\n";
js_content += "// Group unique genres for the filter UI\n";
js_content += "const allGenres = [...new Set(moviesData.flatMap(movie => movie.genre))].sort();\n";

fs.writeFileSync(outputJsPath, js_content, 'utf8');
console.log("Successfully wrote " + movies.length + " movies to data.js!");
