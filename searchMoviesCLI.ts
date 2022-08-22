import { question } from "readline-sync";
import { Client } from "pg";

//As your database is on your local machine, with default port,
//and default username and password,
//we only need to specify the (non-default) database name.
async function searchMovies() {

    const client = new Client({ database: 'omdb' });
    console.log("Welcome to search-movies-cli!");
    let searchTerm = question("Search for what movie? (or 'q' to quit): ");
    let text = 'SELECT id, name, date, runtime, budget, revenue, vote_average, votes_count FROM movies WHERE name ILIKE $1 AND kind=$2 ORDER BY date DESC LIMIT 10';
    let values = [`%${searchTerm}%`, 'movie']
    client.connect();

    while (!(searchTerm === 'q')) {
        try {
            const res = await client.query(text, values);
            console.table(res.rows)
        } catch(err) {
            console.log(err.stack)
        }
        searchTerm = question("Search for what movie? (or 'q' to quit): ");
        values = [`%${searchTerm}%`, 'movie']
    } await client.end();
}
searchMovies();