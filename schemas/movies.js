const z = require("zod")

const movieSchema = z.object({
    tittle: z.string({
        invalid_type_error: "Movie tittle must be a string",
        required_error: "Movie tittle is required"
    }),
    year: z.number().int().min(1990).max(2024),
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10).default(5),
    poster: z.string().url({
        message: 'Poster must be a valid URL'
    }),
    genre: z.array(
        z.enum(['Action', 'Adventure', 'Crime', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi']),
        {
            invalid_type_error:"Movie genre must be an array of enum Genre",
            required_error: "Movie genre is required."
        }
    )
})

function validateMovie(input){
    return movieSchema.safeParse(input)
}

//el partial hace que cada una de las prop sean opcionales, si no esta no pasa nada, pero si esta la valida segun lo definimos arriba -.-
function validatePartialMovie(input){
    return movieSchema.partial().safeParse(input)
}

module.exports = {
    validateMovie,
    validatePartialMovie
}