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
        // console.log(data);
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

function Handler(con,position) {
    this.con = con;
    this.con.on("close", () => {
        console.log("CLOSED!!!")
        // Remove self from connection list
        // console.log(connections);
        // console.log(
            connections.splice(position,1)
        // );
        // console.log(connections);
    })
    this.con.on("message", message => {
        console.log(`${APPID} Received message: ${message.utf8Data}`)
        if (message.utf8Data.split("\0")[0] == "update:"){
            this.updateTxt(message.utf8Data.replace("update:\0",""));
        }
    });

    this.authenticatedAs = -1;

    this.txtBoxContent = "";

    this.updateTxt = async function(txtU) {
        this.txtBoxContent = txtU;
    }
    
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
    
    con.send(`Connected successfully to server ${APPID}`);
    
    const hand = new Handler(con, connections.length);
    connections.push(hand);
})