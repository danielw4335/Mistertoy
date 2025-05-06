import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

const PAGE_SIZE =10

export const toyService = {
    remove,
    query,
    getById,
    add,
    update,
    addToyMsg,
    removeToyMsg,
}

async function query(filterBy = {}) {
    try {
            const { filterCriteria, sortCriteria, pageCriteria } = buildCriteria(filterBy)
            const collection = await dbService.getCollection('toys')

            const sortField = sortCriteria.type || 'createdAt'
            const sortDir = sortCriteria.sortDir || 1
    
            const pageIdx = pageCriteria.pageIdx || 0
            const skipCount = pageIdx * PAGE_SIZE

            const totalCount = await collection.countDocuments(filterCriteria)
            const maxPage = Math.ceil(totalCount / PAGE_SIZE)

            const toys = await collection.find(filterCriteria)
            .sort({ [sortField]: sortDir })
            .skip(skipCount)
            .limit(PAGE_SIZE)
            .toArray()

            return { toys, maxPage }
        } catch (err) {
            logger.error('cannot find toys', err)
            throw err
        }
}

function buildCriteria(filterBy) {
    const filterCriteria = {}
    const sortCriteria = {}
    const pageCriteria = {}

    if (filterBy.txt) {
        filterCriteria.name = { $regex: filterBy.txt, $options: 'i' }
    }
    if (filterBy.maxPrice) {
        filterCriteria.price = { $lte: +filterBy.maxPrice }
    }
    if (filterBy.inStock !== undefined) {
        filterCriteria.inStock = filterBy.inStock === 'true' || filterBy.inStock === true
    }
    if (filterBy.labels && filterBy.labels.length) {
        filterCriteria.labels = { $all: filterBy.labels }
    }
    const sortBy = filterBy.sortBy
    if (sortBy.type) {
        sortCriteria.type = sortBy.type
        sortCriteria.sortDir = +sortBy.sortDir || 1
    }
    if (filterBy.pageIdx !== undefined) {
        pageCriteria.pageIdx = +filterBy.pageIdx || 0
    }
    
    return { filterCriteria, sortCriteria, pageCriteria }
}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
		const toy = await collection.findOne({ _id: ObjectId.createFromHexString(toyId) })
        toy.createdAt = toy._id.getTimestamp()
        return toy
    } catch (err) {
		logger.error(`while finding toy ${toyId}`, err)
		throw err
	}  
}

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        const { deletedCount } = await collection.deleteOne({ _id: ObjectId.createFromHexString(toyId)})
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}

async function add(toy) {
    try {
        const collection = await dbService.getCollection('toy')
		await collection.insertOne(toy)
        return toy
    } catch (err) {
        logger.error('cannot insert toy', err)
		throw err
    }
}

async function update(toy) {
        try {
            const toyToSave = {
                name: toy.name,
                price: toy.price,
            }
            const collection = await dbService.getCollection('toy')
            await collection.updateOne({ _id: ObjectId.createFromHexString(toy._id) }, { $set: toyToSave })
            return toy
        } catch (err) {
            logger.error(`cannot update toy ${toy._id}`, err)
            throw err
        }
    }

    async function addToyMsg(toyId, msg) {
        try {
            msg.id = utilService.makeId()
    
            const collection = await dbService.getCollection('toy')
            await collection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $push: { msgs: msg } })
            return msg
        } catch (err) {
            logger.error(`cannot add toy msg ${toyId}`, err)
            throw err
        }
    }
    
    async function removeToyMsg(toyId, msgId) {
        try {
            const collection = await dbService.getCollection('toy')
            await collection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $pull: { msgs: { id: msgId }}})
            return msgId
        } catch (err) {
            logger.error(`cannot add toy msg ${toyId}`, err)
            throw err
        }
    }
