import { question } from "readline-sync";
import { Client } from "pg";

//As your database is on your local machine, with default port,
//and default username and password,
//we only need to specify the (non-default) database name.
async function searchMovies() {

    
    let quit = false;
    console.log("Welcome to search-movies-cli!");

    while (!quit) {
        const client = new Client({ database: 'omdb' });
        client.connect();
        console.log(`
        [1] Search
        [2] See Favourites
        [3] Quit`);
        let action = question("Choose an action! [1, 2, 3]: ");

        if (action === '1') {
            let searchTerm = question("Search term: ")
            let text = 'SELECT id, name, date, runtime, budget, revenue, vote_average, votes_count FROM movies WHERE name ILIKE $1 AND kind=$2 ORDER BY date DESC LIMIT 10';
            let values = [`%${searchTerm}%`, 'movie'];
            try {
                const res = await client.query(text, values);
                console.table(res.rows);
                for (let i = 0; i < res.rows.length; i++) {
                    console.log(`[${i}] ${res.rows[i].name}`);
                }
                let favSelection = question(`Choose a movie row number to favourite [0...${res.rows.length - 1} / q]: `);
                if ((typeof parseInt(favSelection) === 'number') && (parseInt(favSelection) < res.rows.length)) {
                    let favIndex = parseInt(favSelection);
                    let favMovie = res.rows[favIndex]
                    try {
                        let favText = 'INSERT INTO favourites (movie_id) VALUES($1)';
                        let favValues = [favMovie.id];
                        console.log(`Saving favourite movie: ${favMovie.name}`);
                        await client.query(favText, favValues);
                    } catch(err) {
                        console.log(err.stack);
                        console.log("Movie could not be saved to favourites");
                    }
                } else if (!(favSelection === 'q')) {
                    console.log("Invalid selection");
                }
                
            } catch(err) {
                console.log(err.stack)
            }
        } else if (action === '2') {
            console.log("Here are your saved favourites!");
            let text = 'SELECT movies.id, name, date, runtime, budget, revenue, vote_average, votes_count FROM movies JOIN favourites ON movies.id=favourites.movie_id ORDER BY date DESC LIMIT 10';
            try {
                const res = await client.query(text);
                console.table(res.rows)
            } catch(err) {
                console.log(err.stack)
            }
        } else if (action === '3') {
            quit = true;
        }
        await client.end();
    } 
}
searchMovies();