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

    SocketServer.setMaxListeners(0)

    SocketServer.on('connection', ws => {
        ws.setMaxListeners(0)
        ws.clientName = null

        ws.on('message', raw => {
            let packet = bufferJson.decode(raw)

            switch ( packet[0] ) {
                // global packet types implementation
                case 0:
                    return console.log(...packet[1])
                case 1:
                    return console.error(...packet[1])
                case 2:
                    ws.clientName = packet[1]
                    return console.log('broker:', `${packet[1]} successfully connected`)

                // custom packet types implementation
                case 3: // send to server
                    return send(3, packet)
                case 4: // send to client
                    return send(4, packet)
                case 5: // send to all
                    return send(5, packet)
            }
        })

        ws.on('close', () => {
            if ( ws.clientName ) {
                console.log('broker:', `${ws.clientName} disconnected`)
            } else {
                console.log('broker:', 'unnamed client disconnected')
            }

            ws.removeAllListeners()
            ws.terminate()
        })

        ws.on('error', err => {
            console.error(ws.clientName || 'unnamed client', 'error:', err)
        })
    })

    // handle all process error and uncaught exception for not crashing the process
    process.on('uncaughtException', (err) => {
        console.error(err)
    })

    process.on('unhandledRejection', (err) => {
        console.error(err)
    })

    process.on('warning', (warning) => {
        console.warn(warning.name)
        console.warn(warning.message)
        console.warn(warning.stack)
    })

    console.log(`broker: listening on port ${port}`)
})()