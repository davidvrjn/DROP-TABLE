# Setup instructions

## API
### Create .env with the following format and put it in the API folder
Fill in with your DB details
```
MARIADB_HOST=
MARIADB_USER=
MARIADB_PASSWORD=
MARIADB_DB=
MARIADB_PORT=
```
 
### Run the following in a terminal in the API directory
```
npm install
node --env-file .env API.js
```

## Frontend
### Run the following in a terminal in the frontend
```
npm install
npm run dev
```

## Data population
Instructions in README.md in the data_manipulation folder
