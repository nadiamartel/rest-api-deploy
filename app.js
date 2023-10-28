const express = require("express")
const movies = require("./movies.json")
const crypto = require("node:crypto")
const { validateMovie, validatePartialMovie } = require("./schemas/movies")
const app = express()

app.disable("x-powered-by") //quita el header x-powered-by: Express
app.use(express.json())

app.get("/", (req, res) => {
    res.json({ message: "Hola Mundo" })
})

// *** CORS ***
// métodos normales: GET/HEAD/POST
// métodos complejos: PUT/PATCH/DELETE --> CORS PRE-Flight = req una petiicion especial OPTIONS


//Todos los recurso que sean Movies se identifican con /movies
app.get("/movies", (req, res) => {
    res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5500")

    const { genre } = req.query
    if (genre) {
        const moviesFiltered = movies.filter(movie => movie.genre.some(g => g.toLocaleLowerCase() === genre.toLocaleLowerCase()))
        return res.json(moviesFiltered)
    }
    res.json(movies)
})

app.get("/movies/:id", (req, res) => {
    const { id } = req.params
    const movie = movies.find(movie => movie.id === id)
    if (movie) return res.json(movie)

    res.status(404).json({ message: "Movie not found" })
})

app.post("/movies", (req, res) => {
    const result = validateMovie(req.body)

    if (result.error) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    //esto ira a parar a la base de datos luego
    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data
        // title,
        // genre,
        // year,
        // director,
        // duration,
        // rate: rate ?? 0,
        // poster
    }

    //esto no seria REST porq queda guardado en el estado de aplicacion en memoria:
    movies.push(newMovie)

    res.status(201).json(newMovie)
})

app.delete('/movies/:id', (req, res) => {
    res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5500")

    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' })
    }

    movies.splice(movieIndex, 1)

    return res.json({ message: 'Movie deleted' })
})

app.patch("/movies/:id", (req, res) => {
    const result = validatePartialMovie(req.body)

    if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    const { id } = req.params

    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' })
    }
    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie

    return res.json(updateMovie)
})

//configuracion OPTIONS para que funcione el botin de eliminar:
app.options("/movies/:id", (req, res) => {
    res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
    res.header("Access-Control-Allow-Methods", "GET, PATCH, DELETE, PUT, POST");
    
    res.status(200).send();
});


const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`);
})