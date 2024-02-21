const express = require('express')
const app = express()
app.use(express.static('dist'))
const cors = require('cors')
app.use(cors())
app.use(express.json())

const morgan = require('morgan')
morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


let persons = [
    {
        id: 1,
        name: "Pekka Python",
        number: "123-98765"
    },
    {
        id: 2,
        name: "Maija Cee",
        number: "050-98765"
    }
]



app.get('/info', (request, response) => {
    const time = new Date

    const info = `
        <html>
            <head>
                <title>info</title>
            </head>
            <body>
                <p>Phonebook has info of ${persons.length} people</p>
                <p>${time}</p>
            </body>
        </html>
    `;
    response.send(info)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

//Using this temporarily because i cant get the frontend
//to go to the correct url
app.get('/persons', (request, response) => {
    response.redirect('/api/persons')
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const generateId = () => {
    const newId = Math.random * 1000
    return newId
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    } if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    } if (persons.find(person => person.name === body.name)) {
        return response.status(418).json({
            error: 'name is already in use'
        })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)
    response.json(person)
})

//Using this temporarily because i cant get the frontend
//to go to the correct url
app.post('/persons', (request, response) => {
    const body = request.body
    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    } if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    } if (persons.find(person => person.name === body.name)) {
        return response.status(418).json({
            error: 'name is already in use'
        })
    }
    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }
    persons = persons.concat(person)
    response.json(person)
})


const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)