import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import { logger } from './services/logger.service.js'
logger.info('server.js loaded...')

const app = express()

app.use(cookieParser())
app.use(express.json())
app.use(express.static('public'))

if (process.env.NODE_ENV === 'production') {
    // Express serve static files on production environment
    app.use(express.static(path.resolve(__dirname, 'public')))
    console.log('__dirname: ', __dirname)
} else {
    const corsOptions = {
        origin: [
            'http://127.0.0.1:5173',
            'http://localhost:5173',

            'http://127.0.0.1:3000',
            'http://localhost:3000',
        ],
        credentials: true,
    }
    app.use(cors(corsOptions))
}

import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { toyRoutes } from './api/toy/toy.routes.js'

// routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/toy', toyRoutes)

app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = process.env.PORT || 3030

app.listen(port, () => {
    logger.info('Server is running on port: ' + port)
})

// app.get('/api/toy', (req, res) => {
//     const { txt, maxPrice, inStock, labels, pageIdx, sortBy } = req.query

//     const filterBy = {
//         txt: txt || '',
//         maxPrice: +maxPrice || 0,
//         inStock: inStock || null,
//         labels: labels || [],
//         pageIdx: +pageIdx || 0,
//         sortBy: sortBy || { type: '', sortDir: 1 },
//     }

//     toyService.query(filterBy)
//         .then(toys => {
//             res.send(toys)
//         })
//         .catch(err => {
//             logger.error('Cannot load toys', err)
//             res.status(400).send('Cannot load toys')
//         })
// })

// app.get('/api/toy/:toyId', (req, res) => {
//     const { toyId } = req.params

//     toyService.get(toyId)
//         .then(toy => {
//             res.send(toy)
//         })
//         .catch(err => {
//             logger.error('Cannot get toy', err)
//             res.status(400).send(err)
//         })
// })

// app.post('/api/toy', (req, res) => {
//     const { name, price, labels } = req.body

//     const toy = {
//         name,
//         price: +price,
//         labels,
//     }

//     toyService.save(toy)
//         .then(savedToy => {
//             res.send(savedToy)
//         })
//         .catch(err => {
//             logger.error('Cannot add toy', err)
//             res.status(400).send('Cannot add toy')
//         })
// })

// app.put('/api/toy/:toyId', (req, res) => {
//     const { name, price, labels } = req.body
//     const { toyId } = req.params

//     const toy = {
//         _id: toyId,
//         name,
//         price: +price,
//         labels,
//     }

//     toyService.save(toy)
//         .then(savedToy => {
//             res.send(savedToy)
//         })
//         .catch(err => {
//             logger.error('Cannot update toy', err)
//             res.status(400).send('Cannot update toy')
//         })
// })

// app.delete('/api/toy/:toyId', (req, res) => {
//     const { toyId } = req.params

//     toyService.remove(toyId)
//         .then(() => {
//             res.send()
//         })
//         .catch(err => {
//             logger.error('Cannot delete toy', err)
//             res.status(400).send('Cannot delete toy, ' + err)
//         })
// })

// app.get('/*all', (req, res) => {
//     res.sendFile(path.resolve('public/index.html'))
// })

// const port = process.env.PORT || 3030
// app.listen(port, () => {
//     logger.info(`Server listening on port http://127.0.0.1:${port}/`)
// })