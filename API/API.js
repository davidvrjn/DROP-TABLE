//Packages
const express = require('express');
const app = express();
const mariadb = require('mariadb');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const cors = require('cors');
app.use(cors());

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
    if (!req.is('application/json')) {
        res.status(415).send({
            status: "error",
            message: "Request must be in JSON format, if it is, check request headers are set properly"
        })
    }
    try {
        conn = await pool.getConnection();
        let where = [];
        let values = [];
        values.push(req.body['userid'] || 0);
        if (req.body['filters']) {
            const filters = req.body['filters'];
            if (filters['brands'] && filters['brands'].length > 0) {
                const brands = filters['brands'];
                where.push(`B.name IN (${brands.map(() => '?').join(', ')})`);
                values.push(...brands);
            }
            if (filters['departments'] && filters['departments'].length > 0) {
                const departments = filters['departments'];
                where.push(`cat_name IN (${departments.map(() => '?').join(', ')})`);
                values.push(...departments);
            }
            if (filters['retailers'] && filters['retailers'].length > 0) {
                const retailers = filters['retailers'];
                where.push(`R.name IN (${retailers.map(() => '?').join(', ')})`);
                values.push(...retailers);
            }
            if (filters['prices'] && filters['prices'].length > 0) {
                const prices = filters['prices'];
                where.push(`final_price BETWEEN ? AND ?`);
                values.push(prices[0], prices[1]);
            }
            if (filters['rating']) {
                const rating = filters['rating'];
                where.push(`score >= ?`);
                values.push(rating);
            }
            if (filters['search']) {
                const search = filters['search'];
                where.push(`title LIKE ?`);
                values.push(`%${search}%`);
            }
        }

        
        let baseQuery = "SELECT P.id, P.image_url, P.title, PR.final_price, PR.initial_price, R.name, R.id AS rID, ((PR.initial_price - PR.final_price)/PR.initial_price) AS Discount, AVG(RT.score) AS Rating, B.name AS brand, C.cat_name, CASE WHEN EXISTS (SELECT 1 FROM Watchlist_Item WHERE user_id = ? AND product_id = P.id) THEN TRUE ELSE FALSE END AS watchlist FROM Product AS P INNER JOIN Product_Retailer AS PR ON P.id = PR.product_id INNER JOIN Retailer AS R ON R.id = PR.retailer_id INNER JOIN Brand AS B ON B.id = P.brand_id INNER JOIN Category AS C ON C.id = P.category_id LEFT JOIN Review AS RT ON RT.product_id = P.id";
        if (where.length > 0) {
            baseQuery += " WHERE " + where.join(" AND ");
        }

        baseQuery += " GROUP BY P.id, C.id, B.id, R.id";

        let orderConditions = [];
        const allowedFields = ["title", "final_price", "initial_price", "Discount", "Rating"];
        const allowedOrders = ["ASC", "DESC"];

        if (req.body['ordering']) {
            const orderField = req.body['ordering']['field'];
            const orderType = req.body['ordering']['order'];

            if (allowedFields.includes(orderField) && allowedOrders.includes(orderType)) {
                orderConditions.push(`${orderField} ${orderType}`);
            }
        }

        let ORDERQuery = "ORDER BY RAND()";
        if (orderConditions.length > 0) {
            ORDERQuery += `, ${orderConditions.join(", ")}`;
        }

        baseQuery += ` ${ORDERQuery}`;
        
        if (req.body['limit']) {
            values.push(req.body['limit']);
            baseQuery += `LIMIT ?`;
        }

        const rows = await conn.query(baseQuery, values);

        var productJSON = [];
        await rows.forEach(product => {
            productJSON.push({
               "id": product.id,
               "image_url": product.image_url,
               "title": product.title,
               "final_price": product.final_price,
               "retailer_name": product.name,
               "retailer_id": product.rID,
               "rating": product.Rating,
               "initial_price": product.initial_price,
               "discount": Math.floor((product.Discount * 100 )),
               "watchlist": product.watchlist
            })
        });


        res.status(200).send({
            status: "success",
            data: productJSON,
            total: productJSON.length
        })
    }
    catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({
            status: "error",
            message: "Error retrieving data, detailed error in server_logs, please investigate server logs"
        });
    }
    finally {
        if (conn) {
            conn.release();
        }
    }
})

app.post('/Get/Product/:productID/:retailerID', express.json(), async (req, res) => {
    let conn;
    if (!req.is('application/json')) {
        res.status(415).send({
            status: "error",
            message: "Request must be in JSON format, if it is, check request headers are set properly"
        })
    }
    try {
        conn = await pool.getConnection();
        const productID = req.params.productID;
        const retailerID = req.params.retailerID;

        var rows = await conn.query("SELECT P.id AS id, image_url, title, description, final_price, initial_price, R.name, R.id AS rID, ((initial_price - final_price)/initial_price) AS Discount, AVG(RT.score) AS Rating, images, specifications, features, CASE WHEN EXISTS (SELECT 1 FROM Watchlist_Item WHERE user_id = ? AND product_id = P.id) THEN TRUE ELSE FALSE END AS watchlist FROM Product_Retailer AS PR INNER JOIN Retailer AS R ON R.id = PR.retailer_id INNER JOIN Product AS P ON P.id = PR.product_id LEFT JOIN Review AS RT ON RT.product_id = PR.product_id WHERE P.id = ? AND retailer_id = ?", [`${req.body['userid'] || 0}`,`${productID}`, `${retailerID}`]);
        if (rows.length == 0) {
            res.status(404).send({
                status: "error",
                message: "Specified retailer product not found"
            })
            return;
        }
        else if (rows.length > 1) {
            res.status(500).send({
                status: "error",
                message: "Error in the database, 2 or more products retrieved, there should be 1"
            });
            return;
        }

        const product = rows[0];
        const allReviews = [];
        //Query to retrieve all reviews of selected product, retailer shouldnt be involved from what I understand.
        //Correct
        rows = await conn.query("SELECT CONCAT(first_name, ' ', last_name) AS username, score, comment FROM Review AS R INNER JOIN User AS U ON U.user_id = R.user_id WHERE product_id = ?", [`${productID}`]);
        rows.forEach(review => {
            allReviews.push({
                r_Username: review.username,
                r_Rating: review.score,
                r_Text: review.comment
            });
        });

        const productJSON = {
            id: product.id,
            image_url: product.image_url,
            title: product.title,
            description: product.description,
            final_price: product.final_price,
            retailer_name: product.name,
            rating: product.Rating,
            initial_price: product.initial_price,
            discount: Math.floor((product.Discount * 100 )),
            images: product.images,
            watchlist: product.watchlist,
            specifications: product.specifications,
            features: product.features,
            reviews: allReviews
        }

        res.status(200).send({
            status: "success",
            data: productJSON
        });
    }
    catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({
            status: "error",
            message: "Error retrieving data, detailed error in server_logs, please investigate server logs"
        });
    }
    finally {
        if (conn) {
            conn.release();
        }
    }
})


//Error logging
app.use((err, req, res, next) => {
    console.error(err.stack);
    fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
    res.status(500).send({ status: "error", message: "Error in the API, detailed error in error.log, please investigate error.log" });
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
app.post('/User/Login', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
        return;
    }

    try {
        conn = await pool.getConnection();

        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        const rows= await conn.query('SELECT user_id, first_name, last_name, email, type, password FROM User WHERE email = ?',[`${email}`]) //<==============sql query for a user here

        if (rows.length === 0) {
            res.status(404).send({ status: 'error', message: 'Specified user not found' });
            return;
        }

        const storedPassword = await rows[0].password;

        const match = await bcrypt.compare(password, storedPassword);

        if (!match) {
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

    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error logging in, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

//Register method
//Adding validation to determine it succeeded.
app.post('/User/Register', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
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
        if (password.length > 72) {
            res.status(422).send({ status: 'error', message: 'Failed Validation' });
            return;
        }

        //validate email. regex sourced from https://www.geeksforgeeks.org/how-to-validate-email-address-using-regexp-in-javascript/
        let regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!regex.test(email)) {
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
            else {
                res.status(500).send({ status: 'error', message: 'Inserted an invalid amount of users, database errors expected, investigate and fix immeaditely' });
            }

        } else {
            //there is a matching email
            res.status(409).send({ status: 'error', message: 'User with email exists.' });
            return;
        }
    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error registering user, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

app.post('/Get/Retailers', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
        return;
    }

    try {
        const { search } = req.body;
        conn = await pool.getConnection();

        if (!search) {
            //get all retailers here, no search provided
            const rows = await conn.query('SELECT * FROM Retailer');  //<==============no search provided, just a select unique  
            let retailerJSON = [];

            for (let i = 0; i < rows.length; i++) {
                let temp = {
                    retailer_name: rows[i].name,
                    retailer_id: rows[i].id
                }

                retailerJSON.push(temp);
            }


            res.status(200).send({ status: 'success', data: retailerJSON })
            return;
        } else {
            //the user did provide a search, use search
            const rows = await conn.query('SELECT * FROM Retailer WHERE name LIKE ?', [`%${req.body['search']}%`]); //<===============search provided, use it as a fuzzy search
            let retailerJSON = [];

            for (let i = 0; i < rows.length; i++) {
                let temp = {
                    retailer_name: rows[i].name,
                    retailer_id: rows[i].id
                }

                retailerJSON.push(temp)
            }


            res.status(200).send({ status: 'success', data: retailerJSON })
            return;
        }

    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error retrieving data, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

app.post('/Get/Brands', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
        return;
    }

    try {
        const { search } = req.body;
        conn = await pool.getConnection();

        if (!search) {
            //get all brands here, no search provided
            const rows = await conn.query('SELECT * FROM Brand');  //<==============no search provided, just a select unique  
            let brandJSON = [];

            for (let i = 0; i < rows.length; i++) {
                let temp = {
                    brand_name: rows[i].name,
                    brand_id: rows[i].id
                }

                brandJSON.push(temp);
            }


            res.status(200).send({ status: 'success', data: brandJSON })
            return;
        } else {
            //the user did provide a search, use search
            const rows = await conn.query('SELECT * FROM Brand WHERE name LIKE ?', [`%${req.body['search']}%`]); //<===============search provided, use it as a fuzzy search
            let brandJSON = [];

            for (let i = 0; i < rows.length; i++) {
                let temp = {
                    brand_name: rows[i].name,
                    brand_id: rows[i].id
                }

                brandJSON.push(temp)
            }


            res.status(200).send({ status: 'success', data: brandJSON })
            return;
        }
    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error retrieving data, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

app.post('/Get/Categories', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
        return;
    }

    try {
        const { search } = req.body;
        conn = await pool.getConnection();

        if (!search) {
            //get all categories here, no search provided

            const rows = await conn.query('SELECT * FROM Category');  //<==============no search provided, just a select unique  
            let categoryJSON = [];

            for (let i = 0; i < rows.length; i++) {
                let temp = {
                    cat_name: rows[i].cat_name,
                    id: rows[i].id
                }

                categoryJSON.push(temp);
            }


            res.status(200).send({ status: 'success', data: categoryJSON })
            return;
        } else {
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


            res.status(200).send({ status: 'success', data: categoryJSON })
            return;
        }
    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error retrieving data, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

app.post('/Update/Category', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
        return;
    }

    try {
        const { id, name, userid } = req.body;

        if (!id || !name || !userid) {
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        //validate userid
        conn = await pool.getConnection();
        const user_details = await conn.query('SELECT type FROM User WHERE user_id = ?', [userid]); //<==============sql to get a the user

        if (user_details.length === 0) {
            res.status(404).send({ status: 'error', message: 'User not found' });
            return;
        } else if (user_details[0].type != 'admin') {
            res.status(401).send({ status: 'error', message: 'Unauthorized' });
            return;
        }

        //validate x_name
        const catVal = await conn.query('SELECT cat_name FROM Category WHERE cat_name = ?', [name]); //<================sql to get category with this name

        if (catVal.length != 0) {
            res.status(409).send({ status: 'error', message: 'Category already exists' });
            return;
        }

        //validate id
        const idVal = await conn.query('SELECT id FROM Category WHERE id = ?', [id]); //<===========================sql to find user with this id

        if (idVal.length === 0) {
            res.status(404).send({ status: 'error', message: 'Category id mismatch' });
            return;
        }

        //now evrything is valid. perform the update
        const update = await conn.query('UPDATE Category SET cat_name = ? WHERE id = ?', [name, id]); //<========sql query for the cat update

        if (update.affectedRows > 0) {
            res.status(200).send({ status: 'success', message: 'Categories successfully updated' });
            return;
        } else {
            res.status(200).send({ status: 'success', message: 'Success, no rows affected' });
            return;
        }
    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error updating category, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

app.post('/Update/Retailer', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
        return;
    }

    try {
        const { id, name, userid } = req.body;

        if (!id || !name || !userid) {
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        //validate userid
        conn = await pool.getConnection();
        const user_details = await conn.query('SELECT type FROM User WHERE user_id = ?', [userid]); //<==============sql to get a the user

        if (user_details.length === 0) {
            res.status(404).send({ status: 'error', message: 'User not found' });
            return;
        } else if (user_details[0].type != 'admin') {
            res.status(401).send({ status: 'error', message: 'Unauthorized' });
            return;
        }

        //validate x_name
        const retVal = await conn.query('SELECT name FROM Retailer WHERE name = ?', [name]); //<================sql to get retailer with this name

        if (retVal.length != 0) {
            res.status(409).send({ status: 'error', message: 'Retailer already exists' });
            return;
        }

        //validate id
        const idVal = await conn.query('SELECT id FROM Retailer WHERE id = ?', [id]); //<===========================sql to find retailer with this id

        if (idVal.length === 0) {
            res.status(404).send({ status: 'error', message: 'Retailer not found' });
            return;
        }

        //now evrything is valid. perform the update
        const update = await conn.query('UPDATE Retailer SET name = ? WHERE id = ?', [name, id]);

        if (update.affectedRows > 0) {
            res.status(200).send({ status: 'success', message: 'Retailers successfully updated' });
            return;
        } else {
            res.status(200).send({ status: 'success', message: 'Success, no rows affected' });
            return;
        }
    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error updating retailer, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

app.post('/Update/Brand', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
        return;
    }

    try {
        const { id, name, userid } = req.body;

        if (!id || !name || !userid) {
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        //validate userid
        conn = await pool.getConnection();
        const user_details = await conn.query('SELECT type FROM User WHERE user_id = ?', [userid]); //<==============sql to get a the user

        if (user_details.length === 0) {
            res.status(404).send({ status: 'error', message: 'User not found' });
            return;
        } else if (user_details[0].type != 'admin') {
            res.status(401).send({ status: 'error', message: 'Unauthorized' });
            return;
        }

        //validate x_name
        const brandVal = await conn.query('SELECT name FROM Brand WHERE name = ?', [name]); //<================sql to get brand with this name

        if (brandVal.length != 0) {
            res.status(409).send({ status: 'error', message: 'Brand already exists' });
            return;
        }

        //validate id
        const idVal = await conn.query('SELECT id FROM Brand WHERE id = ?', [id]); //<===========================sql to find brand with this id

        if (idVal.length === 0) {
            res.status(404).send({ status: 'error', message: 'Brand not found' });
            return;
        }

        //now evrything is valid. perform the update
        const update = await conn.query('UPDATE Brand SET name = ? WHERE id = ?', [name, id]);

        if (update.affectedRows > 0) {
            res.status(200).send({ status: 'success', message: 'Brands successfully updated' });
            return;
        } else {
            res.status(200).send({ status: 'success', message: 'Success, no rows affected' });
            return;
        }
    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error updating brand, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

app.post('/Remove/Brand', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
        return;
    }

    try {
        const { id, userid } = req.body;

        //handle missing JSON values
        if (!id || !userid) {
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        //validate userid
        conn = await pool.getConnection();
        const user_details = await conn.query('SELECT type FROM User WHERE user_id = ?', [userid]); //<==============sql to get a the user

        if (user_details.length === 0) {
            res.status(404).send({ status: 'error', message: 'User not found' });
            return;
        } else if (user_details[0].type != 'admin') {
            res.status(401).send({ status: 'error', message: 'Unauthorized' });
            return;
        }

        //validate id
        const idVal = await conn.query('SELECT id from Brand WHERE id = ?', [id]); //<===========================sql to find brand with this id

        if (idVal.length === 0) {
            res.status(404).send({ status: 'error', message: 'Brand not found' });
            return;
        }

        //Catching a foreign key error
        try{
            const del = await conn.query('DELETE FROM Brand WHERE id = ?', [id]);

            if (del.affectedRows > 0) {
                res.status(200).send({ status: 'success', message: 'Brand removed' });
                return;
            } else {
                res.status(409).send({ status: 'error', message: 'Brand was not removed' });
                return;
            }
        }
        //Foreign key violation
        catch(err){
            if(err.errno === 1451){
                res.status(400).send({status: "error", message: "Foreign Key Violation, make sure no products reference this."});
                return;
            }
        }
        

    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error removing brand, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

app.post('/Remove/Retailer', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
        return;
    }

    try {
        const { id, userid } = req.body;

        //handle missing JSON values
        if (!id || !userid) {
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        //validate userid
        conn = await pool.getConnection();
        const user_details = await conn.query('SELECT type FROM User WHERE user_id = ?', [userid]); //<==============sql to get a the user

        if (user_details.length === 0) {
            res.status(404).send({ status: 'error', message: 'User not found' });
            return;
        } else if (user_details[0].type != 'admin') {
            res.status(401).send({ status: 'error', message: 'Unauthorized' });
            return;
        }

        //validate id
        const idVal = await conn.query('SELECT id from Retailer WHERE id = ?', [id]); //<===========================sql to find retailer with this id

        if (idVal.length === 0) {
            res.status(404).send({ status: 'error', message: 'Retailer not found' });
            return;
        }

        //At this point, id and userid is valid. perform remove
        try{
            const del = await conn.query('DELETE FROM Retailer WHERE id = ?', [id]);

            if (del.affectedRows > 0) {
                res.status(200).send({ status: 'success', message: 'Retailer removed' });
                return;
            } else {
                res.status(409).send({ status: 'error', message: 'Retailer was not removed' });
                return;
            }
        }
        //Foreign key violation
        catch(err){
            if(err.errno === 1451){
                res.status(400).send({status: "error", message: "Foreign Key Violation, make sure no products reference this."});
                return;
            }
        }

    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error removing retailer, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

app.post('/Remove/Category', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
        return;
    }

    try {
        const { id, userid } = req.body;

        //handle missing JSON values
        if (!id || !userid) {
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        //validate userid
        conn = await pool.getConnection();
        const user_details = await conn.query('SELECT type FROM User WHERE user_id = ?', [userid]); //<==============sql to get a the user

        if (user_details.length === 0) {
            res.status(404).send({ status: 'error', message: 'User not found' });
            return;
        } else if (user_details[0].type != 'admin') {
            res.status(401).send({ status: 'error', message: 'Unauthorized' });
            return;
        }

        //validate id
        const idVal = await conn.query('SELECT id from Category WHERE id = ?', [id]); //<===========================sql to find cat with this id

        if (idVal.length === 0) {
            res.status(404).send({ status: 'error', message: 'Category not found' });
            return;
        }

        //At this point, id and userid is valid. perform remove
        try{
            const del = await conn.query('DELETE FROM Category WHERE id = ?', [id]);

            if (del.affectedRows > 0) {
                res.status(200).send({ status: 'success', message: 'Category removed' });
                return;
            } else {
                res.status(409).send({ status: 'error', message: 'Category was not removed' });
                return;
            }
        }
        //Foreign key violation
        catch(err){
            if(err.errno === 1451){
                res.status(400).send({status: "error", message: "Foreign Key Violation, make sure no products reference this."});
                return;
            }
        }

    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error removing category, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

app.post('/Get/Watchlist', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
        return;
    }

    try {
        const { userid } = req.body;

        if (!userid) {
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        conn = await pool.getConnection();
        const watchlist_Details = await conn.query('SELECT W.product_id, initial_price, final_price, AVG(R.score) AS rating, title, image_url, retailer_name  FROM Watchlist_Item AS W INNER JOIN Product AS P ON W.product_id = P.id LEFT JOIN Review AS R ON R.product_ID = P.id WHERE W.user_id = ? GROUP BY W.product_id', [userid]);
        let watchlistJSON = [];
        for (let i = 0; i < watchlist_Details.length; i++) {
            if(watchlist_Details[i].product_id != null){
                let temp = {
                    id: watchlist_Details[i].product_id,
                    image_url: watchlist_Details[i].image_url,
                    title: watchlist_Details[i].title,
                    final_price: watchlist_Details[i].final_price,
                    retailer_name: watchlist_Details[i].retailer_name,
                    rating: watchlist_Details[i].rating,
                    initial_price: watchlist_Details[i].initial_price
                }
                watchlistJSON.push(temp);
            }
        }

        res.status(200).send({ status: 'success', data: watchlistJSON })
        return;
    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error getting Watchlist, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

app.post('/Get/RetailPrices', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
        return;
    }

    try {
        const { product_id } = req.body;

        if (!product_id) {
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        conn = await pool.getConnection();
        const price_Details = await conn.query('SELECT initial_price, final_price, name FROM Product_Retailer INNER JOIN Retailer ON Retailer.id = Product_Retailer.retailer_id WHERE product_id = ? ORDER BY final_price', [product_id]);

        let priceJSON = [];

        for (let i = 0; i < price_Details.length; i++) {
            let temp = {
                retailer_name: price_Details[i].name,
                initial_price: price_Details[i].initial_price,
                final_price: price_Details[i].final_price,
                discount: price_Details[i].discount
            }

            priceJSON.push(temp);
        }

        res.status(200).send({ status: 'success', data: priceJSON });
        return;
    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error getting all retail prices, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

app.post('/Add/Watchlist', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
        return;
    }

    try {
        const { product_id, retailer_id, userid } = req.body;

        if (!product_id || !retailer_id || !userid) {
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        conn = await pool.getConnection();

        //First check if the product is not already on the watchlist
        const watchlist = await conn.query('SELECT product_id FROM Watchlist_Item WHERE product_id = ? AND user_id = ?', [product_id, userid]);
        if(watchlist.length != 0){
            res.status(400).send({status: "error", message: "The product already exists on this user's watchlist"});
            return;
        }

        //Get current static data
        const product = await conn.query('SELECT initial_price, final_price, name FROM Product_Retailer INNER JOIN Retailer ON Retailer.id = Product_Retailer.retailer_id WHERE retailer_id = ? AND product_id = ?', [retailer_id, product_id]);
        if(product.length === 0 || product[0].initial_price == null){
            res.status(400).send({status: "error", message: "The combination of retailer and product does not exist on the database"});
            return;
        }

        const inserted = await conn.query('INSERT INTO Watchlist_Item VALUES(?,?,?,?,?)', [userid, product[0].name, product_id, product[0].initial_price, product[0].final_price]); //<=========sql for insert user here
        if (inserted.affectedRows == 1) {
            res.status(201).send({ status: 'success', message: 'New Item added to Watchlist' });
            return;
        }
        //0 or 2 or more users were inserted, investigate the database immeaditely, and fix any errors
        else {
            res.status(500).send({ status: 'error', message: 'Invalid insert into watchlist, database errors expected, investigate and fix immeaditely' });
        }
        return;
    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error adding to watchlist, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

app.post('/Add/Review', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
        return;
    }

    try {
        const { product_id, score, userid, message } = req.body;

        if (!product_id || !score || !userid || !message) {
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        conn = await pool.getConnection();

        //Check to see if this product has not already been reviewed
        const review = await conn.query('SELECT score FROM Review WHERE user_id = ? AND product_id = ?', [userid, product_id]);
        if(review.length != 0){
            res.status(400).send({status: "error", message: "Review from this user already exists on the product"});
            return;
        }

        const inserted = await conn.query('INSERT INTO Review VALUES(?,?,?,?)', [userid, product_id, score, message]); //<=========sql for insert user here
        if (inserted.affectedRows == 1) {
            res.status(201).send({ status: 'success', message: 'New Item added to Review' });
            return;
        }
        //0 or 2 or more users were inserted, investigate the database immeaditely, and fix any errors
        else {
            res.status(500).send({ status: 'error', message: 'Invalid insert into review, database errors expected, investigate and fix immeaditely' });
        }
        return;
    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error adding to review, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

app.post('/Add/Product', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
        return;
    }

    try {
        const { userid, category_id, brand_id, title, description, specifications, features, image_url, images, retail_details } = req.body;

        if (!userid || !category_id || !brand_id || !title || !description || !specifications || !features || !image_url || !images) {
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        conn = await pool.getConnection();

        const user_details = await conn.query('SELECT type FROM User WHERE user_id = ?', [userid]); //<==============sql to get a the user

        if (user_details.length === 0) {
            res.status(404).send({ status: 'error', message: 'User not found' });
            return;
        } else if (user_details[0].type != 'admin') {
            res.status(401).send({ status: 'error', message: 'Unauthorized' });
            return;
        }

        const product = await conn.query('SELECT id FROM Product WHERE title = ? AND category_id = ? AND brand_id = ?', [title, category_id, brand_id]);
        if(product.length != 0){
            res.status(400).send({status: "error", message: "Product with matching title, category and brand already exists."});
            return;
        }

        const inserted = await conn.query('INSERT INTO Product(`category_id`,`brand_id`,`title`,`description`,`created_at`,`updated_at`, `image_url`, `images`, `specifications`, `features`) VALUES(?,?,?,?,?,?,?,?,?,?)', [category_id, brand_id, title, description, new Date().toISOString().slice(0, 19).replace("T", " "), new Date().toISOString().slice(0, 19).replace("T", " "), image_url, `[${images}]`, JSON.stringify(specifications), JSON.stringify(features)]); //<=========sql for insert user here
        if(inserted.affectedRows != 1){
            res.status(409).send({status: "error", message:"An unexpected amount of rows was inserted into the database investigate immeaditely"});
            return;
        }
        const pid = inserted.insertId;

        var values = [];
        placeholder = "";
        for (const detail of retail_details) {
            const { retailer_id, initial_price, final_price } = detail;

            if (!retailer_id || initial_price == null || final_price == null) {
                res.status(400).send({status: "error", message: "product successfully added, but retail details invalid, please fix in update."});
                return;
            }

            placeholder += "(?,?,?,?,?), ";
            values.push(pid);
            values.push(retailer_id);
            values.push("Dummy Link");
            values.push(initial_price);
            values.push(final_price);
        }
        if(values.length == 0){
            res.status(200).send({status: "error", message: "product successfully added, but no retailers specified"});
            return;
        }
        placeholder = placeholder.slice(0, -2);

        const baseQuery = `INSERT INTO Product_Retailer VALUES ${placeholder}`
        await conn.query(baseQuery, values) 

        res.status(201).send({ status: 'success', message: 'Product inserted successfully' });
        return;
    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error adding to Product, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

app.post('/Add/Category', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
        return;
    }

    try {
        const { name, userid } = req.body;

        if (!userid || !name) {
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        conn = await pool.getConnection();
        const user_details = await conn.query('SELECT type FROM User WHERE user_id = ?', [userid]); //<==============sql to get a the user

        if (user_details.length === 0) {
            res.status(404).send({ status: 'error', message: 'User not found' });
            return;
        } else if (user_details[0].type != 'admin') {
            res.status(401).send({ status: 'error', message: 'Unauthorized' });
            return;
        }

        //validate x_name
        const catVal = await conn.query('SELECT cat_name FROM Category WHERE cat_name = ?', [name]); //<================sql to get category with this name

        if (catVal.length != 0) {
            res.status(409).send({ status: 'error', message: 'Category already exists' });
            return;
        }

        const inserted = await conn.query('INSERT INTO Category(`cat_name`) VALUES(?)', [name]); //<=========sql for insert user here

        if (inserted.affectedRows == 1) {
            res.status(201).send({ status: 'success', message: 'New Item added to Category' });
            return;
        }
        else {
            res.status(500).send({ status: 'error', message: 'Invlaid Insert into Category, database errors expected, investigate and fix immeaditely' });
        }
        return;
    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error adding to Category, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

app.post('/Add/Retailer', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
        return;
    }

    try {
        const { name, userid, url } = req.body;

        if (!userid || !name || !url) {
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        conn = await pool.getConnection();
        const user_details = await conn.query('SELECT type FROM User WHERE user_id = ?', [userid]); //<==============sql to get a the user

        if (user_details.length === 0) {
            res.status(404).send({ status: 'error', message: 'User not found' });
            return;
        } else if (user_details[0].type != 'admin') {
            res.status(401).send({ status: 'error', message: 'Unauthorized' });
            return;
        }

        //validate x_name
        const catVal = await conn.query('SELECT name FROM Retailer WHERE name = ?', [name]); //<================sql to get category with this name

        if (catVal.length != 0) {
            res.status(409).send({ status: 'error', message: 'Retailer already exists' });
            return;
        }

        const inserted = await conn.query('INSERT INTO Retailer(`name`, `web_page_url`) VALUES(?,?)', [name, url]); //<=========sql for insert user here

        if (inserted.affectedRows == 1) {
            res.status(201).send({ status: 'success', message: 'New Item added to Retailer' });
            return;
        }
        else {
            res.status(500).send({ status: 'error', message: 'Invlaid Insert into Retailer, database errors expected, investigate and fix immeaditely' });
        }
        return;
    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error adding to Retailer, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

app.post('/Add/Brand', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
        return;
    }

    try {
        const { name, userid } = req.body;

        if (!userid || !name) {
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        conn = await pool.getConnection();
        const user_details = await conn.query('SELECT type FROM User WHERE user_id = ?', [userid]); //<==============sql to get a the user

        if (user_details.length === 0) {
            res.status(404).send({ status: 'error', message: 'User not found' });
            return;
        } else if (user_details[0].type != 'admin') {
            res.status(401).send({ status: 'error', message: 'Unauthorized' });
            return;
        }

        //validate x_name
        const catVal = await conn.query('SELECT name FROM Brand WHERE name = ?', [name]); //<================sql to get category with this name

        if (catVal.length != 0) {
            res.status(409).send({ status: 'error', message: 'Brand already exists' });
            return;
        }

        const inserted = await conn.query('INSERT INTO Brand(`name`) VALUES(?)', [name]); //<=========sql for insert user here

        if (inserted.affectedRows == 1) {
            res.status(201).send({ status: 'success', message: 'New Item added to Brand' });
            return;
        }
        else {
            res.status(500).send({ status: 'error', message: 'Invlaid Insert into Brand, database errors expected, investigate and fix immeaditely' });
        }
        return;
    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error adding to Brand, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

app.post('/Update/Product', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
        return;
    }

    try {
        const { name, user_id, product_id, category_id, brand_id, title, description, update_at, specifications, features, image_url, retail_details } = req.body;

        if (!user_id || !name) {
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        conn = await pool.getConnection();
        const user_details = await conn.query('SELECT * FROM ... WHERE ...=?', [userid]); //<==============sql to get a the user

        if (user_details.length === 0) {
            res.status(404).send({ status: 'error', message: 'User not found' });
            return;
        } else if (user_details[0].role != 'admin') {
            res.status(401).send({ status: 'error', message: 'Unauthorized' });
            return;
        }

        conn = await pool.getConnection();
        const updated = await conn.query('SQL query to update a product???', [name]);

        // for (const detail of retail_details) {
        //     const { retailer_id, initial_price, final_price } = detail;

        //     if (!retailer_id || initial_price == null || final_price == null) {
        //         throw new Error('Invalid retail detail entry');
        //     }

        //     await conn.query(
        //         `INSERT INTO product_retailers (product_id, retailer_id, initial_price, final_price)
        //      VALUES (?, ?, ?, ?)`,
        //         [product_id, retailer_id, initial_price, final_price]
        //     );
        // }

        // for (const detail of retail_details) {
        //     const { retailer_id, initial_price, final_price } = detail;

        //     if (!retailer_id || initial_price == null || final_price == null) {
        //         throw new Error('Invalid retail detail entry');
        //     }

        //     values += `(${product_id}, ${retailer_id}, 'dummy link', ${initial_price}, ${final_price}),`
        // }

        // values = values.substring(0, values.length - 1);

        // const retailProducts = await conn.query("INSERT INTO Product_Retailer VALUES ?", [values]) 

        if (updated.affectedRows === 1) {
            res.status(200).send({ status: 'success', message: 'Product updated successfully' });
        } else {
            res.status(404).send({ status: 'error', message: 'No Product found with the provided ID' });
        }
        return;
    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error updating product, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})


app.post('/Update/Watchlist', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
        return;
    }

    try {
        const { user_id, product_id, initial_price, final_price, retailer_name } = req.body;

        if (!user_id || !product_id || !initial_price || !final_price || !retailer_name) {
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        conn = await pool.getConnection();
        const user_details = await conn.query('SELECT * FROM ... WHERE ...=?', [user_id]); //<==============sql to get a the user

        if (user_details.length === 0) {
            res.status(404).send({ status: 'error', message: 'User not found' });
            return;
        } else if (user_details[0].role != 'admin') {
            res.status(401).send({ status: 'error', message: 'Unauthorized' });
            return;
        }

        conn = await pool.getConnection();
        const updated = await conn.query('SQL query to update a watchlist???', [user_id]);

        if (updated.affectedRows === 1) {
            res.status(200).send({ status: 'success', message: 'Watchlist updated successfully' });
        } else {
            res.status(404).send({ status: 'error', message: 'No Watchlist found with the provided ID' });
        }
        return;
    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error updating Watchlist, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

app.post('/Remove/Product', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
        return;
    }

    try {
        const { user_id, product_id } = req.body;

        if (!user_id || !product_id) {
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        conn = await pool.getConnection();
        const user_details = await conn.query('SELECT * FROM ... WHERE ...=?', [user_id]); //<==============sql to get a the user

        if (user_details.length === 0) {
            res.status(404).send({ status: 'error', message: 'User not found' });
            return;
        } else if (user_details[0].role != 'admin') {
            res.status(401).send({ status: 'error', message: 'Unauthorized' });
            return;
        }

        conn = await pool.getConnection();
        const updated = await conn.query('SQL query to delete a product???', [user_id]);

        if (updated.affectedRows === 1) {
            res.status(200).send({ status: 'success', message: 'Product deleted successfully' });
        } else {
            res.status(404).send({ status: 'error', message: 'No Product found with the provided ID' });
        }
        return;
    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error deleting Product, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

app.post('/Remove/Watchlist', express.json(), async (req, res) => {
    let conn;

    if (!req.is('application/json')) {
        res.status(415).send({ status: 'error', message: 'Expected application/json' });
        return;
    }

    try {
        const { user_id, product_id } = req.body;

        if (!user_id || !product_id) {
            res.status(400).send({ status: 'error', message: 'Required parameters missing' });
            return;
        }

        conn = await pool.getConnection();
        const user_details = await conn.query('SELECT * FROM ... WHERE ...=?', [user_id]); //<==============sql to get a the user

        if (user_details.length === 0) {
            res.status(404).send({ status: 'error', message: 'User not found' });
            return;
        } else if (user_details[0].role != 'admin') {
            res.status(401).send({ status: 'error', message: 'Unauthorized' });
            return;
        }

        conn = await pool.getConnection();
        const updated = await conn.query('SQL query to delete a product???', [user_id]);

        if (updated.affectedRows === 1) {
            res.status(200).send({ status: 'success', message: 'Product remove from Watchlist deleted successfully' });
        } else {
            res.status(404).send({ status: 'error', message: 'No Product found with the provided ID' });
        }
        return;
    } catch (err) {
        console.error(err);
        fs.appendFileSync(`error.log`, `${new Date().toLocaleString()} - ${err.stack}\n`);
        res.status(500).send({ status: 'error', message: 'Error deleting Product from Watchlist, detailed error in server_logs, please investigate server logs' });
        return;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})


//API CONNECT
app.listen(port, () => {
    console.log(`API listening on localhost:${port}`);
})
