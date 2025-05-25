//Packages
const express = require('express');
const app = express();
const mariadb = require('mariadb');
const fs = require('fs');
const bcrypt = require('bcryptjs');

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
    host: `${process.env.MARIADB_HOST}`,
    user: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    port: process.env.MARIADB_PORT,
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
        


        const rows = await conn.query("SELECT id, image_url, title, final_price, initial_price,");
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
            conn.release();
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
            conn.release();
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

        const rows= await conn.query('SELECT user_id, first_name, last_name, email, type, password FROM User WHERE email = ?',[`${email}`]) //<==============sql query for a user here

        if (rows.length === 0){
            res.status(404).send({ status: 'error', message: 'Specified user not found' });
            return;
        }

        const storedPassword = await rows[0].password;

        const match=await bcrypt.compare(password,storedPassword);
        
        if(!match){
            res.status(401).send({ status: 'error', message: 'Failed Validation' });
            return;
        } else{
            res.status(200).send({ status: 'success',  data: {
                user: {
                    id: rows[0].user_id,
                    email: rows[0].email,
                    first_name: rows[0].first_name,
                    last_name: rows[0].last_name,
                    type: rows[0].type
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
            conn.release();
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
        const {first_name,last_name,email,password} =req.body;

        if(!first_name || !last_name || !email || !password){
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
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
        const rows= await conn.query('SELECT email FROM User WHERE email = ?',[`${email}`]) //<==============sql query for a user here. check for a matching email

        if(rows.length === 0){

            //hash new password
            const new_Password=await hashString(password);

            const inserted = await conn.query('INSERT INTO User(`first_name`, `last_name`, `password`, `email`, `type`) VALUES (?, ?, ?, ?, "user")',[first_name,last_name,new_Password,email]); //<=========sql for insert user here
            if(inserted.affectedRows == 1){
              res.status(201).send({ status: 'success',  data: {
                user: {
                    id: inserted.insertID,
                    email: email,
                    first_name: first_name,
                    last_name: last_name
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
            conn.release();
        }
    }
})

app.post('/Get/Retailers',express.json(),async (req,res)=>{
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
            const rows= await conn.query('SELECT * FROM Retailer');  //<==============no search provided, just a select unique  
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
            const rows= await conn.query('SELECT * FROM Retailer WHERE name LIKE ?',[`%${req.body['search']}%`]); //<===============search provided, use it as a fuzzy search
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
            conn.release();
        }
    }
})

app.post('/Get/Brands',express.json(),async (req,res)=>{
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
            const rows= await conn.query('SELECT * FROM Brand');  //<==============no search provided, just a select unique  
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
            const rows= await conn.query('SELECT * FROM Brand WHERE name LIKE ?',[`%${req.body['search']}%`]); //<===============search provided, use it as a fuzzy search
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
            conn.release();
        }
    }
})

app.post('/Get/Categories',express.json(),async (req,res)=>{
    let conn;
    
    if(!req.is('application/json')){
        res.status(415).send({status: 'error', message: 'Expected application/json'});
        return;
    }

    try{
        const {search}=req.body;
        conn= await pool.getConnection();

        if(!search){
            //get all categories here, no search provided
            const rows= await conn.query('SELECT * FROM Category');  //<==============no search provided, just a select unique  
            let categoryJSON=[];
            
            for(let i=0;i<rows.length;i++){
                let temp={
                    cat_name: rows[i].cat_name,
                    id: rows[i].id
                }

                categoryJSON.push(temp);
            }

            
            res.status(200).send({ status: 'success',  data: categoryJSON})
            return;
        } else{
            //the user did provide a search, use search
            const rows= await conn.query('SELECT * FROM Category WHERE cat_name LIKE ?',[`%${req.body['search']}%`]); //<===============search provided, use it as a fuzzy search
            let categoryJSON=[];

            for(let i=0;i<rows.length;i++){
                let temp={
                    cat_name: rows[i].cat_name,
                    id: rows[i].id
                }

                categoryJSON.push(temp)
            }

            
            res.status(200).send({ status: 'success',  data: categoryJSON})
            return;
        }
      } catch (err){
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error retrieving data, detailed error in server_logs, please investigate server logs' });
        return;
    } finally{
        if(conn){
            conn.release();
        }
    }
})

app.post('/Update/Category',express.json(),async (req,res)=>{
    let conn;

    if(!req.is('application/json')){
        res.status(415).send({status: 'error', message: 'Expected application/json'});
        return;
    }

    try{
        const {cat_id,cat_name,userid}=req.body;

        if(!cat_id || !cat_name || !userid){
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        //validate userid
        conn= await pool.getConnection();
        const user_details= await conn.query('SELECT * FROM ... WHERE ...=?',[userid]); //<==============sql to get a the user

        if(user_details.length===0){
            res.status(404).send({ status: 'error', message: 'User not found' });
            return;
        } else if(user_details[0].role!='admin'){
            res.status(401).send({ status: 'error', message: 'Unauthorized' });
            return;
        }

        //validate x_name
        const catVal= await conn.query('SELECT * from ... WHERE ...=?',[cat_name]); //<================sql to get category with this name

        if(catVal.length!=0){
            res.status(409).send({ status: 'error', message: 'Category already exists' });
            return;
        }

        //validate id
        const idVal=await conn.query('SELECT * from ... WHERE ...=?',[cat_id]); //<===========================sql to find user with this id

        if(idVal.length===0){
            res.status(404).send({ status: 'error', message: 'Category not found' });
            return;
        }
    
        //now evrything is valid. perform the update
        const update=await conn.query('UPDATE catTableName SET cat_name=? WHERE cat_id=?',[cat_name,cat_id]); //<========sql query for the cat update

        if(update.affectedRows>0){
            res.status(200).send({ status: 'success', message: 'Categories successfully updated' });
            return;
        } else{
            res.status(200).send({ status: 'success', message: 'Success, no rows affected' });
            return;
        }
      } catch(err){
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error updating category, detailed error in server_logs, please investigate server logs' });
        return;
    } finally{
        if(conn){
            conn.release();
        }
    }
})

app.post('/Update/Retailer',express.json(),async (req,res)=>{
    let conn;

    if(!req.is('application/json')){
        res.status(415).send({status: 'error', message: 'Expected application/json'});
        return;
    }

    try{
        const {id,name,userid}=req.body;

        if(!id || !name || !userid){
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        //validate userid
        conn= await pool.getConnection();
        const user_details= await conn.query('SELECT * FROM ... WHERE ...=?',[userid]); //<==============sql to get a the user

        if(user_details.length===0){
            res.status(404).send({ status: 'error', message: 'User not found' });
            return;
        } else if(user_details[0].role!='admin'){
            res.status(401).send({ status: 'error', message: 'Unauthorized' });
            return;
        }

        //validate x_name
        const retVal= await conn.query('SELECT * from ... WHERE ...=?',[name]); //<================sql to get retailer with this name

        if(retVal.length!=0){
            res.status(409).send({ status: 'error', message: 'Retailer already exists' });
            return;
        }

        //validate id
        const idVal=await conn.query('SELECT * from ... WHERE ...=?',[id]); //<===========================sql to find retailer with this id

        if(idVal.length===0){
            res.status(404).send({ status: 'error', message: 'Retailer not found' });
            return;
        }
    
        //now evrything is valid. perform the update
        const update=await conn.query('UPDATE RetailerTableName SET name=? WHERE id=?',[name,id]);

        if(update.affectedRows>0){
            res.status(200).send({ status: 'success', message: 'Retailers successfully updated' });
            return;
        } else{
            res.status(200).send({ status: 'success', message: 'Success, no rows affected' });
            return;
        }
    } catch(err){
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error updating retailer, detailed error in server_logs, please investigate server logs' });
        return;
    } finally{
        if(conn){
            conn.release();
        }
    }
})

app.post('/Update/Brand',express.json(),async (req,res)=>{
    let conn;

    if(!req.is('application/json')){
        res.status(415).send({status: 'error', message: 'Expected application/json'});
        return;
    }

    try{
        const {id,name,userid}=req.body;

        if(!id || !name || !userid){
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        //validate userid
        conn= await pool.getConnection();
        const user_details= await conn.query('SELECT * FROM ... WHERE ...=?',[userid]); //<==============sql to get a the user

        if(user_details.length===0){
            res.status(404).send({ status: 'error', message: 'User not found' });
            return;
        } else if(user_details[0].role!='admin'){
            res.status(401).send({ status: 'error', message: 'Unauthorized' });
            return;
        }

        //validate x_name
        const brandVal= await conn.query('SELECT * from ... WHERE ...=?',[name]); //<================sql to get brand with this name

        if(brandVal.length!=0){
            res.status(409).send({ status: 'error', message: 'Retailer already exists' });
            return;
        }

        //validate id
        const idVal=await conn.query('SELECT * from ... WHERE ...=?',[id]); //<===========================sql to find brand with this id

        if(idVal.length===0){
            res.status(404).send({ status: 'error', message: 'Brand not found' });
            return;
        }
    
        //now evrything is valid. perform the update
        const update=await conn.query('UPDATE BrandTableName SET name=? WHERE id=?',[name,id]);

        if(update.affectedRows>0){
            res.status(200).send({ status: 'success', message: 'Brands successfully updated' });
            return;
        } else{
            res.status(200).send({ status: 'success', message: 'Success, no rows affected' });
            return;
        }
    } catch(err){
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error updating brand, detailed error in server_logs, please investigate server logs' });
        return;
    } finally{
        if(conn){
            conn.release();
        }
    }
})

app.post('/Remove/Brand',express.json(),async (req,res)=>{
  let conn;

    if(!req.is('application/json')){
        res.status(415).send({status: 'error', message: 'Expected application/json'});
        return;
    }

  try{
    const {id,userid} =req.body;

    //handle missing JSON values
    if(!id || !userid){
      res.status(400).send({ status: 'error', message: 'Required parameters missing' });
      return;
    }

    //validate userid
    conn= await pool.getConnection();
    const user_details= await conn.query('SELECT * FROM ... WHERE ...=?',[userid]); //<==============sql to get a the user

    if(user_details.length===0){
        res.status(404).send({ status: 'error', message: 'User not found' });
        return;
    } else if(user_details[0].role!='admin'){
        res.status(401).send({ status: 'error', message: 'Unauthorized' });
        return;
    }

    //validate id
    const idVal=await conn.query('SELECT * from ... WHERE ...=?',[id]); //<===========================sql to find brand with this id

    if(idVal.length===0){
      res.status(404).send({ status: 'error', message: 'Brand not found' });
      return;
    }

    //At this point, id and userid is valid. perform remove
    const del=await conn.query('DELETE * FROM BrandTableName WHERE id=?',[id]);

    if(del.affectedRows>0){
      res.status(204).send({ status: 'success', message: 'Brand removed' });
      return;
    } else{
      res.status(409).send({ status: 'error', message: 'Brand was not removed' });
      return;
    }
    
  } catch (err) {
    console.error(err);
    fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
    res.status(500).send({ status: 'error', message: 'Error removing brand, detailed error in server_logs, please investigate server logs' });
    return;
  } finally{
    if(conn){
      conn.release();
    }
  }
})

app.post('/Remove/Retailer',express.json(),async (req,res)=>{
  let conn;

    if(!req.is('application/json')){
        res.status(415).send({status: 'error', message: 'Expected application/json'});
        return;
    }

  try{
    const {id,userid} =req.body;

    //handle missing JSON values
    if(!id || !userid){
      res.status(400).send({ status: 'error', message: 'Required parameters missing' });
      return;
    }

    //validate userid
    conn= await pool.getConnection();
    const user_details= await conn.query('SELECT * FROM ... WHERE ...=?',[userid]); //<==============sql to get a the user

    if(user_details.length===0){
        res.status(404).send({ status: 'error', message: 'User not found' });
        return;
    } else if(user_details[0].role!='admin'){
        res.status(401).send({ status: 'error', message: 'Unauthorized' });
        return;
    }

    //validate id
    const idVal=await conn.query('SELECT * from ... WHERE ...=?',[id]); //<===========================sql to find retailer with this id

    if(idVal.length===0){
      res.status(404).send({ status: 'error', message: 'Retailer not found' });
      return;
    }

    //At this point, id and userid is valid. perform remove
    const del=await conn.query('DELETE * FROM retailerTableName WHERE id=?',[id]); //<==========sql to delete here

    if(del.affectedRows>0){
      res.status(204).send({ status: 'success', message: 'Retailer removed' });
      return;
    } else{
      res.status(409).send({ status: 'error', message: 'Retailer was not removed' });
      return;
    }
    
  } catch (err) {
    console.error(err);
    fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
    res.status(500).send({ status: 'error', message: 'Error removing retailer, detailed error in server_logs, please investigate server logs' });
    return;
  } finally{
    if(conn){
      conn.release();
    }
  }
})

app.post('/Remove/Category',express.json(),async (req,res)=>{
  let conn;

    if(!req.is('application/json')){
        res.status(415).send({status: 'error', message: 'Expected application/json'});
        return;
    }

  try{
    const {cat_id,userid} =req.body;

    //handle missing JSON values
    if(!cat_id || !userid){
      res.status(400).send({ status: 'error', message: 'Required parameters missing' });
      return;
    }

    //validate userid
    conn= await pool.getConnection();
    const user_details= await conn.query('SELECT * FROM ... WHERE ...=?',[userid]); //<==============sql to get a the user

    if(user_details.length===0){
        res.status(404).send({ status: 'error', message: 'User not found' });
        return;
    } else if(user_details[0].role!='admin'){
        res.status(401).send({ status: 'error', message: 'Unauthorized' });
        return;
    }

    //validate id
    const idVal=await conn.query('SELECT * from ... WHERE ...=?',[cat_id]); //<===========================sql to find cat with this id

    if(idVal.length===0){
      res.status(404).send({ status: 'error', message: 'Category not found' });
      return;
    }

    //At this point, id and userid is valid. perform remove
    const del=await conn.query('DELETE * FROM CatTableName WHERE id=?',[cat_id]); //<=======sql for remove category here

    if(del.affectedRows>0){
      res.status(204).send({ status: 'success', message: 'Category removed' });
      return;
    } else{
      res.status(409).send({ status: 'error', message: 'Category was not removed' });
      return;
    }
    
  } catch (err) {
    console.error(err);
    fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
    res.status(500).send({ status: 'error', message: 'Error removing category, detailed error in server_logs, please investigate server logs' });
    return;
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
