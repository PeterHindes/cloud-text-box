const async = require('async')
    ,fs = require('fs')
    ,http = require('http')
    ,ws = require('websocket')
    ;

const APPID = process.env.APPID;
let connections = [];
let resumableConnections = [];
const WebSocketServer = ws.server


//create a raw http server (this will help us create the TCP which will then pass to the websocket to do the job)
const public = "./frontend/public"
const httpserver = http.createServer(function (req, res) {
    if (req.url == "/") {
        req.url = "/index.html"
    }
    fs.readFile(public + req.url, function (err,data) {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    });
})

//pass the httpserver object to the WebSocketServer library to do all the job, this class will override the req/res 
const websocket = new WebSocketServer({
    "httpServer": httpserver
})


httpserver.listen(8081, () => console.log("My server is listening on port 8081"))

//Object to manage connection state

function Handler(con,position) {
    this.authenticatedAs = 1234; // Test value
    this.txtBoxContent = "serverside";

    this.con = con;
    this.position = position;

    /*Lifecycle
    * The client opens the page
    * The client opens the websocket connection
    * The user types some new stuff
    * The client authenticates
    * The server gets the in memory value from the database and appends the current value to the database
    * The server pushes the users textbox to the client
    *   potential features:
    *       offline editing and send updates on serviceworker
    *       multiple users edit shared note
    *       edit history
    * The user types and it is sent to the server every keystroke (the full message) (update to send the key that was pressed, then return the message the user will see) (data returned will be symbolUTF8 + position)
    * After the user stops sending updates or a timeout, the textbox is pushed to the database
    * The user disconnects
    */
    this.clientFunctions = {
        update: async (txtU,pos) => {
            // console.log(txtU);
            t = this.txtBoxContent;
            this.txtBoxContent = t.slice(0,pos)+txtU+t.slice(pos);
            // console.log(this.txtBoxContent);
            // console.log(this);
            this.con.send("update\0"+this.txtBoxContent)
        },
        authenticate: async (uname,pass) => {
            // Your authentication code
            resumableConnections[this.authenticatedAs] = connections[this.position];
            connections.splice(this.position,1)
        },
        redeemAuth: async (token) => {
            // lookup token in db
    
            // set auth to token uid
            let resuming = 1234; // TODO REMOVE AND REPLACE WITH DB
            this.con.send("loginSuc " + this.authenticatedAs);
    
            resumableConnections[resuming] = this.con;
            connections.splice(this.position,1)
    
    
            // if not in db
            //this.con.send("loginFail ");
        }    
    }

    this.con.on("close", () => {
        console.log("CLOSED!!!")
        // Remove self from connection list
        if(this.authenticatedAs != -1){
            console.log("terminating con");
            connections.splice(this.position,1)
        }
    })
    this.con.on("message", message => {
        console.log(`Received message: ${message.utf8Data}`)
        let slices = message.utf8Data.split("\0");
        this.clientFunctions[slices.shift()].apply(this,slices);
        // if (message.utf8Data.split(":\0")[0] == "update"){
        //     this.update(message.utf8Data.replace("update\0",""));
        //     this.con.send("update\0"+this.txtBoxContent)
        // }
    });
    // while (true) {
    this.con.send("update\0"+this.txtBoxContent)
    // }
    
}

//when a legit websocket request comes listen to it and get the connection .. once you get a connection thats it! 
websocket.on("request", request=> {

    const con = request.accept(null, request.origin)
    console.log("open");
    
    // con.send(`Connected successfully to server ${APPID}`);
    con.send('Opening Greeting')

    const hand = new Handler(con, connections.length);
    connections.push(hand);
})