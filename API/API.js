//Packages
const express = require('express');
const app = express();
const mariadb = require('mariadb');

//variables for connections
const port = 3000;
//Pooling database connection for quick connections
const pool = mariadb.createPool({
    
});

//API CALLS

//API CONNECT
app.listen(port, () => {
    console.log(`API listening on localhost:${port}`);
})