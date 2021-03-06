var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/rodovia'
var port = 7171,
    WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        port: port
    })
var randomstring = require("randomstring")

console.log('listening on port: ' + port)

wss.on('connection', function connection(ws) {

    ws.on('message', function (message) {
        var data
        //accepting only JSON messages 
        try {
            data = JSON.parse(message)
        } catch (e) {
            console.log("Invalid JSON")
            data = {}
        }
        switch (data.ptype) {
            case "accel":
            console.log("dados accel: ",data)
            MongoClient.connect(url, function(err, db) {
                console.log(err)
                const rodoviaDB = db.db("rodovia")
                rodoviaDB.collection('accel').insertOne(data, function(err, r) {
                    console.log(err)
                    console.log(r.insertedCount)
                    db.close()
                })
            })
            break
            case "geo":
            console.log("dados geo: ",data)
            MongoClient.connect(url, function(err, db) {
                console.log(err)
                const rodoviaDB = db.db("rodovia")
                rodoviaDB.collection('geo').insertOne(data, function(err, r) {
                    console.log(err)
                    console.log(r.insertedCount)
                    db.close()
                })
            })
            break
            case "rrunID":
            ws.send(JSON.stringify({ptype:"rrunID",runID:randomstring.generate(10)}))
            break
        }


    })

    console.log('new client connected!')
})
