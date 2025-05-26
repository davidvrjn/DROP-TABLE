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
    email: "a.senna@admin.compareit.co.za",
    password: "Password#19"
}
```
Response Example
```
{
    status: "success",
    data: {
        user: {
            id: 3,
            email: "a.senna@admin.compareit.co.za",
            first_name: "Ayrton",
            username: "CompareIt_Senna,
            last_name: "Senna",
            role: "admin",
            watchlist_id: 2,
            preferences: "dark",
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
+ 200

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
+ 200

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
+ 201

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
+ 201


## Add/Product
Example request
```
{
    userid: 3
    category_id: 3,
    brand_id: 2,
    title: "Redragon DRAGONBORN Mechanical 60% RGB Gaming Keyboard",
    description: "The Redragon K630 DRAGONBORN 60% RGB Mechanical Gaming Keyboard is perfect for the PC gamer
                  who wants to have the most efficient and compact keyboard setup.",
    created_at: current_time
    updated_at: current_time
    specifications: ,
    features:,
    image_url: https://redragon.co.za/Redragon%20DRAGONBORN%20Mechanical%2060%25%20RGB%20Gaming%20Keyboard&imgurl=https%3A%2F%2Fredragon.co.za,
    retail_details:[
        {
            retailer_id: 3,
            initial_price: 843.74,
            final_price: 649.23
        }
    ]
}
```
Example response
```
{
    status: "success", 
    message: "Product inserted successfully"
}
```
Possible response codes:
+ 201

## Add/Category OR Retailer OR Brand
Example request
```
{
    name: "Appliances",
    userid: 2
}
```
Example response
```
{
    status: "success",
    message: "New Item added to Category"
}
```
Possible response codes:
+ 201

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
    status: "success",
    message: "Product updated successfully"
}
```
Possible response codes:
+ 200

## Update/Category OR Retailer OR Brand
Example request
```
{
    name: "Appliances",
    id: 3,
    userid: 4
}
```
Example response
```
{
    status: "success",
    message: "Categories successfully updated"
}
```
Possible response codes:
+ 200

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
    status: "success",
    message: "Watchlist updated successfully"
}
```
Possible response codes:
+ 200

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
    id: 4,
    userid: 3
}
```
Example response
```
{
    status: "success",
    message: "Product deleted successfully"
}
```
Possible response codes:
+ 200

## Remove/Category OR Retailer OR Brand
Example request
```
{
    id: 3,
    userid: 2
}
```
Example response
```
{
    status: "success",
    message: "Category removed"
}
```
Possible response codes:
+ 200

## Remove/Watchlist
Example request
```
{
    userid: 5,
    product_id: 7
}
```
Example response
```
{
    status: "success",
    message: "Product removed from Watchlist deleted successfully"
}
```
Possible response codes:
+ 200
