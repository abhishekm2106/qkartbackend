const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/config");

let server =  config.mongoose.url;

mongoose.connect(server)
.then(()=>console.log("db connected successfully"))
.catch(()=>console.log("db connection failed"))
app.listen(config.port,()=>
    console.log("server started on port : ",config.port))
// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Create Mongo connection and get the express app to listen on config.port
