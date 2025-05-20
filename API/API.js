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
        var WHEREQuery = "WHERE 1 = 1 " // 1 = 1 is used so that additional statements can be appended easily.
        if(req.body['filters']){
            //Ensure WHERE query is inserted as a prepared statement as a whole, these cant be done individually because which params are included are variable.
            const filters = req.body['filters'];
            //I wish i could use a switch here but multiple conditions need to be able to trigger
            if(filters['brands']){
                const brands = filters['brands'];
                var brandWhere = "AND brand IN (";
                brandWhere += `${brands.map(brand => `'${brand}'`).join(", ")}`
                brandWhere += ") ";
                WHEREQuery += brandWhere;
            }
            if(filters['departments']){
                const departments = filters['departments'];
                var departmentWhere = "AND department IN (";
                brandWhere += `${departments.map(department => `'${brand}'`).join(", ")}`
                brandWhere += ") ";
                WHEREQuery += departmentWhere;
            }
            //SQL person implement the retailers array, should just be a copy paste as shown above
            if(filters['retailers']){

            }
            if(filters['prices']){
                const prices = filters['prices'];
                //AND BETWEEN prices[0] AND prices[1]
            }
            if(filters['rating']){
                const rating = filters['rating'];
                //AND rating > this.rating, youre going to have to find out how the average rating is calculated and joined, probably a nested query
                //This can be moved to last to make the query neater if need be.
            }
            if(filters['search']){
                const search = filters['search'];
                //AND product_name = ''
            }
        }
        var ORDERQuery = "ORDER BY Rand(), " //Used to cause random product order.
        if(req.body['ordering']){
            ORDERQuery += `${req.body['order']['field']} ${req.body['order']['order']}`
        }
        var LIMITQuery = "";
        if(req.body['limit']){
            LIMITQuery = `LIMIT BY ${req.body['limit']}`;
        }
        


        const rows = await conn.query("SQL QUERY ?, ?", ["param1", "param2"]);
        //apikey will be used later to determine which selected products are wishlisted.
        
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