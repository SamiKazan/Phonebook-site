const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI
mongoose.connect(url)
  .then(result => {
    console.log('connected to mongoDB')
  })
  .catch((error) => {
    console.log('error connetcting to mongoDB', error)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [3, 'name must be at least 3 characters long'],
    required: true,
  },
  number: {
    type: String,
    minlength: [8, 'number must be at least 8 characters long'],
    required: true
  }
})

personSchema.set('toJSON', {
  transform: (document, returnObject) => {
    returnObject.id = returnObject._id.toString()
    delete returnObject._id
    delete returnObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)