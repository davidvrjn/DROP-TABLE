//Packages
const express = require('express');
const app = express();
const mariadb = require('mariadb');

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

//API CONNECT
app.listen(port, () => {
    console.log(`API listening on localhost:${port}`);
})