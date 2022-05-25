const async = require('async')
    ,fs = require('fs')
    ,http = require('http')
    ,ws = require('websocket')
    ;

const APPID = process.env.APPID;
let connections = [];
const WebSocketServer = ws.server


//create a raw http server (this will help us create the TCP which will then pass to the websocket to do the job)
const httpserver = http.createServer(function(request, response) {  
    response.writeHeader(200, {"Content-Type": "text/html"});
    fs.readFile('./index.html', 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        console.log(data);
        response.write(data);
        response.end();
    });
})

//pass the httpserver object to the WebSocketServer library to do all the job, this class will override the req/res 
const websocket = new WebSocketServer({
    "httpServer": httpserver
})


httpserver.listen(8081, () => console.log("My server is listening on port 8081"))

//Object to manage connection state

function Handler(con) {
    this.con = con;
    this.authenticatedAs = -1;
    
    this.authenticate = async function(uname,pass) {
        // Your authentication code
    }
    this.redeemAuth = async function(token) {
        // lookup token in db

        // set auth to token uid
        this.authenticatedAs = 1234; // TODO REMOVE AND REPLACE WITH DB

        this.con.send("loginSuc " + this.authenticatedAs);

        // if not in db
        //this.con.send("loginFail ");
    }    
}

//when a legit websocket request comes listen to it and get the connection .. once you get a connection thats it! 
websocket.on("request", request=> {

    const con = request.accept(null, request.origin)
    console.log("open");
    con.on("close", () => console.log("CLOSED!!!"))

    const hand = new Handler(con);
    // When someone sends us stuff
    con.on("message", message => {
        console.log(`${APPID} Received message: ${message.utf8Data}`)
    });



    con.send(`Connected successfully to server ${APPID}`);
    let m = '[50000,50,"Wow You Are Crazy",false,null]';
    con.send("Hello World");
    connections.push(hand);
})
  
//client code 
//let ws = new WebSocket("ws://localhost:8080");
//ws.onmessage = message => console.log(`Received: ${message.data}`);
//ws.send("Hello! I'm client")


/*
    //code clean up after closing connection
    subscriber.unsubscribe();
    subscriber.quit();
    publisher.quit();
    */