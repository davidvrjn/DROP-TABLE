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
app.post('/Get/Login',express.json(),async (req,res) =>{
    let conn;
    
    if(!req.is('application/json')){
        return res.status(400).json({status: 'fail', message: 'Expected application/json'});
    }

    try{
        conn= await pool.getConnection();

        const {username,password} =req.body;

        if (!username){
            return res.status(400).json({ status: 'fail', message: 'Username missing.' });
        }

        if (!password){
            return res.status(400).json({ status: 'fail', message: 'Password missing.' });
        }

        const rows= await conn.query('SQL query ?',[username]) //<==============sql query for a user here

        if (rows.length === 0){
            return res.status(401).json({ status: 'fail', message: 'User with this username does not exist.' });
        }

        const storedPassword = rows[0].password;

        const match=await bcrypt.compare(password,storedPassword);
        
        if(!match){
            return res.status(401).json({ status: 'fail', message: 'Incorrect password.' });
        } else{
            return res.status(200).json({ status: 'success', message: 'Login successful.' });
        }
        
    }catch (e){
        console.error(e);
        return res.status(500).json({ status: 'error', message: 'Server error' });
    } finally{
        if(conn){
            conn.release();
        }
    }
})


//API CONNECT
app.listen(port, () => {
    console.log(`API listening on localhost:${port}`);
})
