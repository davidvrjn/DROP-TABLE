## Used packages
+ Express
+ mariadb connector

## Install instructions
go to API folder in terminal, make sure node is installed, and run npm install
to run
```
node --env-file=.env API.js
```

# API Documentation
endpoint: http://localhost:3000/

## Get/Products
Request example
```
{
    apikey:
    filters: {
        brands: [],
        departments: [],
        retailers: [],
        prices: [min, max],
        rating:,
        search:
    }
    ordering:{
        field:,
        order:
    }
    limit:
}
```
Response example
```
{
    status: "success/error",
    //If error
    message:
    //if success
    data: [
        {
            id:,
            image_url:,
            title:,
            final_price:,
            retailer_name:,
            rating:,
            initial_price:,
            discount:,
            watchlist: false or true
        }
    ]
    total: 
}
```
Possible response codes:
+ 200
+ 400
+ 415
+ 500

## Get/Product/:productId/:retailerId
example url host/Get/Product/1/1 (means product id 1 and retailer id 1)
Request Example
```
{
    apikey:
}
```
Response Example
```
{
    status: success or error
    //if error
    message:
    //if success
    data: {
        id:
        image_url:
        title:
        final_price:,
        retailer_name:,
        rating:,
        initial_price:,
        discount:,
        reviews: [
            {
                r_Id:,
                r_Username:,
                r_Rating:,
                r_Date:,
                r_Text:,
            },
            {
                ...
            }
        ]
    }
}
```
Possible Response Codes:
+ 200
+ 400
+ 404
+ 415
+ 500

## User/Login
Request Example
```
{
    email:,
    password:
}
```
Response Example
```
{
    status: success or error
    //if error
    message:
    //if success
    data: {
        token: apikey,
        user: {
            id:,
            email:,
            first_name:,
            last_name:,
            role:,
        }
    }
}
```
Possible response codes:
+ 200
+ 400
+ 401
+ 404
+ 415
+ 500

## User/Register
Example request
```
{
    email:,
    first_name:,
    last_name:,
    password:,
    role:,
}
```
Example response
```
{
    status: success or error
    //if error
    message:
    //if success
    data: {
        user:{
            email:,
            first_name:,
            last_name:,
            role:,
            apikey:,
        }
    }
}
```
Possible response codes:
+ 201
+ 400
+ 409
+ 415
+ 422
+ 500