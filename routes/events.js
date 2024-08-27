const express = require('express')
const router = express.Router();
const { randomUUID } = require('crypto')

let clients = [];

router.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // this means send the headers and keep the connection open

    const clientId = randomUUID();

    const newClient = {
        id: clientId,
        res,
    }

    clients.push(newClient);

    res.write(`data: ${JSON.stringify({ message: `Connected to SSE with ID ${clientId}` })}\n\n`);

    req.on('close', () => {
        clients = clients.filter(client => client.id !== clientId);
    })

})

function sendEventsToAll(newData) {
    clients.forEach(client =>
        client.res.write(`data: ${JSON.stringify(newData)}\n\n`)
    );
}

module.exports = { router, sendEventsToAll }