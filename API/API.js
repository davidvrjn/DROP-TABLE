//Packages
const express = require('express');
const app = express();
const mariadb = require('mariadb');
const fs = require('fs');

//variables for connections
const port = 3000;
//Pooling database connection for quick connections
const pool = mariadb.createPool({
    host: `${process.env.MARIADB_HOST}:${process.env.MARIADB_PORT}`,
    user: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    database: process.env.MARIADB_DB,
    connectionLimit: 5

});

//API CALLS
//Get products
app.get('/Get/Products', express.json(), async (req, res) => {
    let conn;
    if(!req.is('application/json')){
        res.status(400).send({
            status: "Error",
            message: "Request must be in JSON format, if it is, check request headers are set properly"
        })
    }
    try{
        conn = await pool.getConnection();

        const rows = await conn.query("SQL QUERY ?, ?", ["param1", "param2"]);
    }
    catch(err){
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({
            status: "Error",
            message: "Error retrieving data, detailed error in server_logs, please investigate server logs"
        });
    }
    finally{
        if(conn){
            conn.end();
        } 
    }
})


//Error logging
app.use((err, req, res, next) => {
    console.error(err.stack);
    fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
    res.status(500).send({status: "Error", message: "Error in the API, detailed error in error.log, please investigate error.log"});
})

//API CONNECT
app.listen(port, () => {
    console.log(`API listening on localhost:${port}`);
})