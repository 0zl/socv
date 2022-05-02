(async () => {
    'use strict'

    const { WebSocketServer } = require('ws')

    const bufferJson = {
        encode: (data) => {
            return Buffer.from(JSON.stringify(data))
        },

        decode: (data) => {
            return JSON.parse(data.toString())
        }
    }

    const port = process.env.PORT || 55550
    const SocketServer = new WebSocketServer({
        port, perMessageDeflate: false
    })

    const send = (type, data) => {
        SocketServer.clients.forEach(client => {
            if ( client.readyState === client.OPEN ) {
                client.send(bufferJson.encode([ type, data ]))
            }
        })
    }

    SocketServer.on('connection', ws => {
        ws.on('message', raw => {
            let packet = bufferJson.decode(raw)

            switch ( packet[0] ) {
                // global packet types implementation
                case 0:
                    return console.log(...payload[1])
                case 1:
                    return console.log('broker:', `${payload[1]} successfully connected`)
                
                // custom packet types implementation
                case 2: // send to server
                    return send(2, packet)
                case 3: // send to client
                    return send(3, packet)
                case 4: // send to all
                    return send(4, packet)
            }
        })
    })

    console.log(`broker: listening on port ${port}`)
})()