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
            watchlist: true
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
            last_name: "Senna",
            type: "admin",
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
    email: "l.hamilton@gmail.com",
    first_name: "Lewis",
    last_name: "Hamilton",
    password: "Red>Silver2025"
}
```
Example response
```
{
    status: "success",
    data: {
        user:{
            id: 44,
            email: "l.hamilton@gmail.com",
            first_name: "Lewis",
            last_name: "Hamilton"
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
    search: "Appliances"
}
```
Example response
```
{
    data: [
        {
            retailer_name: "Amazon",
            retailer_id: 3
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
    userid: 3
}
```
Example response
```
{
    status: "success",
    data: [
        {
            id: 3,
            image_url: "https://m.media-amazon.com/images/I/61uk5YYRa+L._AC_SL1500_.jpg",
            title: "Disney Stitch Soft Touch Light with Bluetooth Speaker",
            final_price: 300,
            retailer_name: "Amazon",
            rating: 4,
            initial_price: 750
        }
    ]
}
```
Possible response codes:
+ 200

## Get/RetailPrices
Example request
```
{
    product_id: 13
}
```
Example response
```
{
    status: "success"
    [data]: {
        retailer_name: "Amazon",
        initial_price: 1000,
        final_price: 500,
        discount: 50,
    }
}
```
Possible response codes:
unknown

## Add/Watchlist
Example request
```
{
    product_id: 3,
    retailer_id: 2,
    userid: 3
}
```
Example response
```
{
    status: "success",
    message: "New Item added to Watchlist"
}
```
Possible response codes:
+ 201

## Add/Review
Example request
```
{
    product_id: 3,
    userid: 6,
    score: 4,
    message: "Product performs as expected."
}
```
Example response
```
{
    status: "success",
    message: "New Item added to Review"
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
    images: [],
    image_url: "https://redragon.co.za/Redragon%20DRAGONBORN%20Mechanical%2060%25%20RGB%20Gaming%20Keyboard&imgurl=https%3A%2F%2Fredragon.co.za",
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
    userid: 5,
    productid: 12,
    category_id: 3,
    brand_id: 2,
    title: "REDDRAGON 60% keyboard",
    description: ["60% mechanical keyboard with light and ergonomic design. Perfect for gamers with limited desk space."],
    specifications: ,
    features: ["Wrist support","Mechanical Tactical (RED) switches"],
    image_url: "https://redragon.co.za/Redragon%20DRAGONBORN%20Mechanical%2060%25%20RGB%20Gaming%20Keyboard&imgurl=https%3A%2F%2Fredragon.co.za",
    images: ["https://shopnow.com/Red-dragon-keyboard-x91","https://gadgethub.io/Red-dragon-keyboard-deal","https://buyit.tech/Red-dragon-keyboard-pro"],
    retail_details:[
        {
            retailer_id: 3,
            initial_price: 2000,
            final_price: 1400
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
    userid: 3,    
    product_id: 12,
    initial_price: 2000,
    final_price: 1500,
    retailer_name: "Amazon"
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

## Remove/Product
//Remove retailer from update
Example request
```
{
    product_id: 4,
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
