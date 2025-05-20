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
+ 500