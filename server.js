import cors from 'cors'
import express from 'express'
import path from 'path'

import { loggerService } from './services/logger.service.js'
import { toyService } from './services/toy.service.js'

const app = express()

const corsOptions = {
    origin: [
        'http://127.0.0.1:3000',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://localhost:5173',
    ],
    credentials: true,
}

app.use(express.static('public'))
app.use(express.json())
app.use(cors(corsOptions))
app.set('query parser', 'extended')

app.get('/api/toy', (req, res) => {
    const { txt, maxPrice, inStock, labels, pageIdx, sortBy } = req.query

    const filterBy = {
        txt: txt || '',
        maxPrice: +maxPrice || 0,
        inStock: inStock || null,
        labels: labels || [],
        pageIdx: +pageIdx || 0,
        sortBy: sortBy || { type: '', sortDir: 1 },
    }

    toyService.query(filterBy)
    .then(toys => {
        res.send(toys)
    })
    .catch(err => {
        loggerService.error('Cannot load toys', err)
        res.status(400).send('Cannot load toys')
    })
})

app.get('/api/toy/:toyId', (req, res) => {
    const { toyId } = req.params

    toyService.get(toyId)
        .then(toy => {
            res.send(toy)
        })
        .catch(err => {
            loggerService.error('Cannot get toy', err)
            res.status(400).send(err)
        })
})

app.post('/api/toy', (req, res) => {
    const { name, price, labels } = req.body

    const toy = {
        name,
        price: +price,
        labels,
    }

    toyService.save(toy)
        .then(savedToy => {
            res.send(savedToy)
        })
        .catch(err => {
            loggerService.error('Cannot add toy', err)
            res.status(400).send('Cannot add toy')
        })
})

app.put('/api/toy/:toyId', (req, res) => {
    const { name, price, labels } = req.body
    const { toyId } = req.params

    const toy = {
        _id: toyId,
        name,
        price: +price,
        labels,
    }

    toyService.save(toy)
        .then(savedToy => {
            res.send(savedToy)
        })
        .catch(err => {
            loggerService.error('Cannot update toy', err)
            res.status(400).send('Cannot update toy')
        })
})

app.delete('/api/toy/:toyId', (req, res) => {
    const { toyId } = req.params

    toyService.remove(toyId)
        .then(() => {
            res.send()
        })
        .catch(err => {
            loggerService.error('Cannot delete toy', err)
            res.status(400).send('Cannot delete toy, ' + err)
        })
})

app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = process.env.PORT || 3030
app.listen(port, () => {
    loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
})