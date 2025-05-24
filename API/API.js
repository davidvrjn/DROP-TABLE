//Packages
const express = require('express');
const app = express();
const mariadb = require('mariadb');
const fs = require('fs');
const bcrypt=require('bcryptjs');

//By default,generates an apikey. Can be repurposed by providing a length
function generateAlphanumeric(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    result += chars.charAt(idx);
  }
  return result;
}

//hashing function
async function hashString(input, saltRounds = 10) {
  try {
    return await bcrypt.hash(input, saltRounds);
  } catch (err) {
    throw new Error(`Hashing failed: ${err.message}`);
  }
}

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
app.post('/Get/Products', express.json(), async (req, res) => {
    let conn;
    if(!req.is('application/json')){
        res.status(415).send({
            status: "error",
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

        //Retrieved products without wishlist field, that will be added later
        //product.name is from retailer entity, rename it if need be
        //If discount needs to be calculated here, tell me and I will update, otherwise calculate it with the query.
        var productJSON = [];
        await rows.forEach(product => {
            productJSON.push({
               "id": product.id,
               "image_url": product.image_url,
               "title": product.title,
               "final_price": product.final_price,
               "retailer_name": product.name,
               "rating": product.avgRating,
               "initial_price": product.initial_price,
               "discount": product.discount,
               "watchlist": false
            })
        });

        //NB add later, find a way to get the user id from the apikey,
        //and then use that, and the retailer_product to determine if it exists in the watchlist
        //with those 3 keys, and if it does change watchlist to true

        res.status(200).send({
            status: "success",
            data: productJSON,
            total: productJSON.length()
        })
    }
    catch(err){
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({
            status: "error",
            message: "Error retrieving data, detailed error in server_logs, please investigate server logs"
        });
    }
    finally{
        if(conn){
            conn.end();
        } 
    }
})

app.post('Get/Product/:productID/:retailerID', express.json(), async (req, res) => {
    let conn;
    if(!req.is('application/json')){
        res.status(415).send({
            status: "error",
            message: "Request must be in JSON format, if it is, check request headers are set properly"
        })
    }
    try{
        conn = await pool.getConnection();
        const productID = req.params.productID;
        const retailerID = req.params.retailerID;

        //Used to determine if the product is wishlisted, but optional
        var isWatchlisted = false;
        if(req.body['apikey']){
            //Take the product id and retailer id and determine if that instance is in this users watchlist, 
            //if it exists, set isWatchlisted to true. nothing else should need to be done.
        }

        var rows = conn.query("SQL QUERY", ["Params"]);
        if(rows.length == 0){
           res.status(404).send({
            status: "error",
            message: "Specified retailer product not found"
           }) 
           return;
        }
        else if(rows.length > 1){
            res.status(500).send({
                status: "error",
                message: "Error in the database, 2 or more products retrieved, there should be 1"
            });
            return;
        }

        const product = row[0];
        const allReviews = [];
        //Query to retrieve all reviews of selected product, retailer shouldnt be involved from what I understand.
        rows = conn.query("SQL Query", "PARAMS");
        rows.foreach(review => {
            allReviews.push({
                r_Id: review.id,
                r_Username: review.username,
                r_Rating: review.rating,
                r_Date: review.date,
                r_Text: review.message
            });
        });

        const productJSON = {
            id: product.id,
            image_url: product.image_url,
            title: product.title,
            final_price: product.final_price,
            retailer_name: product.name,
            rating: product.rating,
            initial_price: product.initial_price,
            discount: product.discount,
            reviews: allReviews
        }

        res.status(200).send({
            status: "success",
            data: productJSON
        });
    }
    catch(err){
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({
            status: "error",
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
    res.status(500).send({status: "error", message: "Error in the API, detailed error in error.log, please investigate error.log"});
})

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
        res.status(415).send({status: 'error', message: 'Expected application/json'});
        return;
    }

    try{
        conn= await pool.getConnection();

        const {email,password} =req.body;

        if (!email || !password){
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        const rows= await conn.query('SQL query ?',[email]) //<==============sql query for a user here

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

//Register method
//Adding validation to determine it succeeded.
app.post('/User/Register',express.json(),async (req,res) =>{
    let conn;

    if(!req.is('application/json')){
        res.status(415).send({status: 'error', message: 'Expected application/json'});
        return;
    }

    try{
        conn= await pool.getConnection();
        const {first_name,last_name,email,password,role} =req.body;

        if(!first_name || !last_name || !email || !password || !role){
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        if(role!='normal' && role!='admin'){
            res.status(422).send({ status: 'error', message: 'Failed Validation' });
            return;
        }

        //check password
        if(password.length>72){
            res.status(422).send({ status: 'error', message: 'Failed Validation' });
            return;
        }

        //validate email. regex sourced from https://www.geeksforgeeks.org/how-to-validate-email-address-using-regexp-in-javascript/
        let regex=/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if(!regex.test(email)){
            res.status(422).send({ status: 'error', message: 'Failed Validation' });
            return;
        }


        //ATP: the 4 params are retrieved. password is length 72 or less. Check if user already exists.
        const rows= await conn.query('SQL query ?',[email]) //<==============sql query for a user here. check for a matching email

        if(rows.length === 0){
            //there is no matching email
            
            //generate api key
            const apikey=generateAlphanumeric();

            //hash new password
            const new_Password=await hashString(password);

            const inserted = await conn.query('SQL query to insert a user??????',[first_name,last_name,email,role,new_Password,apikey]); //<=========sql for insert user here
            if(inserted.affectedRows == 1){
              res.status(201).send({ status: 'success',  data: {
                user: {
                    email: email,
                    first_name: first_name,
                    last_name: last_name,
                    role: role,
                    apikey: apikey
                }
            }});
            return;
            }
            //0 or 2 or more users were inserted, investigate the database immeaditely, and fix any errors
            else{
              res.status(500).send({ status: 'error', message: 'Inserted an invalid amount of users, database errors expected, investigate and fix immeaditely' });
            }
        
        } else{
            //there is a matching email
            res.status(409).send({ status: 'error', message: 'User with email exists.' });
            return;
        }
    } catch(err){
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error registering user, detailed error in server_logs, please investigate server logs' });
        return;
    } finally{
        if(conn){
            conn.end();
        }
    }
})

app.post('Get/Retailers',express.json(),async (req,res)=>{
    let conn;
    
    if(!req.is('application/json')){
        res.status(415).send({status: 'error', message: 'Expected application/json'});
        return;
    }

    try{
        const {search}=req.body;
        conn= await pool.getConnection();

        if(!search){
            //get all retailers here, no search provided
            const rows= await conn.query('SQL HERE');  //<==============no search provided, just a select unique  
            let retailerJSON=[];
            
            for(let i=0;i<rows.length;i++){
                let temp={
                retailer_name: rows[i].name,
                retailer_id: rows[i].id
                }

                retailerJSON.push(temp);
            }

            
            res.status(200).send({ status: 'success',  data: retailerJSON})
            return;
        } else{
            //the user did provide a search, use search
            const rows= await conn.query('SQL HERE ?',[search]); //<===============search provided, use it as a fuzzy search
            let retailerJSON=[];

            for(let i=0;i<rows.length;i++){
                let temp={
                retailer_name: rows[i].name,
                retailer_id: rows[i].id
                }

                retailerJSON.push(temp)
            }

            
            res.status(200).send({ status: 'success',  data: retailerJSON})
            return;
        }

    } catch (err){
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error retrieving data, detailed error in server_logs, please investigate server logs' });
        return;
    } finally{
        if(conn){
            conn.end();
        }
    }
})

app.post('Get/Brands',express.json(),async (req,res)=>{
    let conn;
    
    if(!req.is('application/json')){
        res.status(415).send({status: 'error', message: 'Expected application/json'});
        return;
    }

    try{
        const {search}=req.body;
        conn= await pool.getConnection();

        if(!search){
            //get all brands here, no search provided
            const rows= await conn.query('SQL HERE');  //<==============no search provided, just a select unique  
            let brandJSON=[];
            
            for(let i=0;i<rows.length;i++){
                let temp={
                brand_name: rows[i].name,
                brand_id: rows[i].id
                }

                brandJSON.push(temp);
            }

            
            res.status(200).send({ status: 'success',  data: brandJSON})
            return;
        } else{
            //the user did provide a search, use search
            const rows= await conn.query('SQL HERE ?',[search]); //<===============search provided, use it as a fuzzy search
            let brandJSON=[];

            for(let i=0;i<rows.length;i++){
                let temp={
                brand_name: rows[i].name,
                brand_id: rows[i].id
                }

                brandJSON.push(temp)
            }

            
            res.status(200).send({ status: 'success',  data: brandJSON})
            return;
        }
      } catch (err){
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error retrieving data, detailed error in server_logs, please investigate server logs' });
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
