const express = require('express')

require('dotenv').config()

const app = express()
app.use(express.static('dist'))
const cors = require('cors')
app.use(cors())
app.use(express.json())
const Person = require("./models/person")

const morgan = require('morgan')
morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


app.get('/info', async (request, response) => {
        const amount = await Person.countDocuments({})
        const time = new Date

        const info = `
            <html>
                <head>
                    <title>info</title>
                </head>
                <body>
                    <p>Phonebook has info of ${amount} people</p>
                    <p>${time}</p>
                </body>
            </html>
        `;
        response.send(info)
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
    
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
    .then(person => {
        if (person) {
            response.json(person)
        }   else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    } if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    let parts = body.number.split('-')

    if (parts.length !== 2) {
        return response.status(400).json({ error: "Phone number must have exactly two parts separated by a hyphen" })
    }
    if ([2, 3].indexOf(parts[0].length) === -1) {
        return response.status(400).json({ error: "First part of the phone number must have 2 or 3 digits" })
    }
    if (parts[1].length < 4) {
        return response.status(400).json({ error: "Second part of the phone number must have at least 4 digits" })
    }

    const person = new Person({
        name: body.name,
        number: body.number
      })
    
      person.save()
        .then(savedPerson => {
          response.json(savedPerson)
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true, context: "query" })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === "CastError") {
        return response.status(400).send({ error: "malformatted id" })
    } else if (error.name === "ValidationError") {
        return response.status(400).json({ error: error.message })
    }
  
    next(error)
}
app.use(errorHandler)
  
const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`)