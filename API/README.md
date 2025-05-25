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
    userid:
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
    userid:
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
        specifications:,
        features:,
        initial_price:,
        discount:,
        watchlist: true or false
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
        user: {
            id:,
            email:,
            first_name:,
            username:,
            last_name:,
            role:,
            watchlist_id:,
            preferences:,
            DOB?:, (Possibly removed)
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
    username:,
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
            id:,
            email:,
            first_name:,
            username:,
            last_name:,
            role:,
            watchlist_id:,
            preferences:,
            DOB?:, (Possibly removed)
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

## Get/Retailers OR Brands OR Categories
Example request
```
{
    search:,
}
```
Example response
```
{
    data: [
        {
            retailer_name:
            retailer_id:
        }
    ]
}
```
Possible response codes:
unknown

## Get/Watchlist
Example request
```
{
    watchlist_id:, //could be userid not fully convinced on watchlist_id
}
```
Example response
```
{
    data: [
        {
            id:,
            image_url:,
            title:,
            final_price:,
            retailer_name:,
            rating:,
            initial_price:,
        }
    ]
}
```
Possible response codes:
unknown

## Get/allRetailPrices
Example request
```
{
    product_id:
}
```
Example response
```
{
    status:
    [message]:
    [data]: {
        retailer_name:,
        initial_price:,
        final_price:,
        discount:,
    }
}
```
Possible response codes:
unknown

## Add/ToWishlist
Example request
```
{
    product_id:
    retailer_id: //used to get name and prices
    watchlist/userid:
}
```
Example response
```
{
    status:
    message: Error or something along the lines of inserted watchlist successfully
}
```
Possible response codes:
unknown

## Add/Review
Example request
```
{
    product_id:
    userid:
    score:
    message:
}
```
Example response
```
{
    status: //if success add the review to the page
    message: Error or something along the lines of inserted watchlist successfully
}
```
Possible response codes:
unknown


## Add/Product
Example request
```
{
    userid: //validation
    category_id:,
    brand_id:,
    title:,
    description:,
    created_at: current_time
    updated_at: current_time
    specifications:,
    features:,
    image_url:,
    retail_details:[
        {
            retailer_id:,
            initial_price:,
            final_price:,
        }
    ]
}
```
Example response
```
{
    status: 
    message: 
}
```
Possible response codes:
unknown

## Add/Category OR Retailer OR Brand
Example request
```
{
    x_name:
    userid: //validation
}
```
Example response
```
{
    status: //if success add the review to the page
    message: Error or something along the lines of inserted successfully
}
```
Possible response codes:
unknown

## Update/Product
//Used to remove a retailer from the list
Example request
```
{
    userid: //validation
    productid:
    category_id:,
    brand_id:,
    title:,
    description:,
    updated_at: current_time //do not modify creation_time
    specifications:,
    features:,
    image_url:
    retail_details:[
        {
            retailer_id:,
            initial_price:,
            final_price:,
        }
    ]
}
```
Example response
```
{
    status: 
    message: 
}
```

## Update/Category OR Retailer OR Brand
Example request
```
{
    x_name:
    id:
    userid: //validation
}
```
Example response
```
{
    status: //if success add the review to the page
    message: Error or something along the lines of inserted successfully
}
```

## Update/Watchlist
Example request
```
{
    watchlist/userid:,
    product_id:,
    initial_price:,
    final_price:,
    retailer_name:,
}
```
Example response
```
{
    status: //if success add the review to the page
    message: Error or something along the lines of inserted successfully
}
```
## Update/Preferences
Example request
```
{
    userid:
    preferences:
}
```
Example response
```
{
    status: //if success add the review to the page
    message: Error or something along the lines of inserted successfully
}
```

## Remove/Product
//Remove retailer from update
Example request
```
{
    id:
    userid: //validation
}
```
Example response
```
{
    status: //if success add the review to the page
    message: Error or something along the lines of inserted successfully
}
```

## Remove/Category OR Retailer OR Brand
Example request
```
{
    id:
    userid: //validation
}
```
Example response
```
{
    status: //if success add the review to the page
    message: Error or something along the lines of inserted successfully
}
```

## Remove/Watchlist
Example request
```
{
    watchlist_id/userid:
    product_id:
}
```
Example response
```
{
    status: //if success add the review to the page
    message: Error or something along the lines of inserted successfully
}
```
