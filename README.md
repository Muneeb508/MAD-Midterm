# Coffee Shop Frontend (Expo)


## Setup
1. Install dependencies:

```
npm install
```

2. Ensure the backend is running on `http://localhost:3000` or change `API_URL` in `App.js`.

3. Start the app:

```
npm start
```

Use the Expo Go app or an emulator to view.


# Coffee Shop Backend

## Setup
1. Create a `.env` file in this folder with:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/coffee_shop_db?retryWrites=true&w=majority&appName=<appName>
PORT=3000
```

2. Install dependencies:

```
npm install
```

3. Seed sample data:

```
node scripts/seed.js
```

4. Run the server:

```
npm run dev
```

You should see:
- Connected to MongoDB
- Coffee shop server running on port 3000

## Endpoints
- GET /menu → returns all menu items
- GET /menu/random → returns one random in-stock item



