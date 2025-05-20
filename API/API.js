//Packages
const express = require('express');
const app = express();
const mariadb = require('mariadb');
const bcrypt=require('bcryptjs');

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

//Login
//Changelog by Stephan after review
//Changed Action Based URL to be more clear
//Merged both password and user check for security reasons to minimalize brute force
//Changed fail status to error
//Changed 401 to 404, its not found, not unauthorized
//Editted success response to match required documentation
//Editted error logic
//Might be race conditions, will determine if awaits are needed more in testing
//.json replaced with send
//It is conn.end(), that returns the connection to the pool
app.post('/User/Login',express.json(),async (req,res) =>{
    let conn;
    
    if(!req.is('application/json')){
        res.status(400).send({status: 'error', message: 'Expected application/json'});
        return;
    }

    try{
        conn= await pool.getConnection();

        const {username,password} =req.body;

        if (!username || !password){
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        const rows= await conn.query('SQL query ?',[username]) //<==============sql query for a user here

        if (rows.length === 0){
            res.status(404).send({ status: 'error', message: 'Specified user not found' });
            return;
        }

        const storedPassword = rows[0].password;

        const match=await bcrypt.compare(password,storedPassword);
        
        if(!match){
            res.status(401).send({ status: 'error', message: 'Failed Validation' });
            return;
        } else{
            //unclear what jwt-token-string is
            res.status(200).send({ status: 'success',  data: {
                token: rows[0].apikey,
                user: {
                    id: rows[0].id,
                    email: rows[0].email,
                    first_name: rows[0].first_name,
                    last_name: rows[0].last_name,
                    role: rows[0].role
                }
            }});
            return;
        }
        
    }catch (err){
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error logging in, detailed error in server_logs, please investigate server logs' });
        return;
    } finally{
        if(conn){
            conn.end();
        }
    }
})


//API CONNECT
app.listen(port, () => {
    console.log(`API listening on localhost:${port}`);
})
