//Push
const express = require('express');
const sql = require('mysql2/promise');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database configuration for MySQL
const config = {
  host: 'localhost',
  user: 'root',
  password: 'Rupesh@123',
  database: 'devopsassignment2',
};

// Connect to MySQL Database
async function connectToDatabase() {
  try {
    const connection = await sql.createConnection(config);
    console.log('Connected to MySQL Database');
    return connection;
  } catch (err) {
    console.error('Error connecting to MySQL Database:', err);
  }
}

let db;
connectToDatabase().then(connection => db = connection);

// Routes
app.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM Expenses');
    // Convert amount to a number for each row
    rows.forEach(row => {
      row.amount = parseFloat(row.amount); // Convert amount to number
    });
    res.render('index', { expenses: rows });
  } catch (err) {
    console.error('Error retrieving expenses:', err);
    res.status(500).send('Error retrieving expenses');
  }
});


app.post('/add-expense', async (req, res) => {
  const { category, amount, date, description } = req.body;
  try {
    const query = `
      INSERT INTO Expenses (category, amount, date, description) 
      VALUES (?, ?, ?, ?)
    `;
    await db.execute(query, [category, amount, date, description]);
    res.redirect('/');
  } catch (err) {
    console.error('Error adding expense:', err);
    res.status(500).send('Error adding expense: ' + err.message);
  }
});

// Endpoint to add a random expense
app.get('/add-random-expense', async (req, res) => {
  try {
    const categories = ['Food', 'Transport', 'Phone', 'Entertainment', 'Other'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomAmount = (Math.random() * (100 - 1) + 1).toFixed(2);
    const randomDate = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));
    const formattedDate = randomDate.toISOString().split('T')[0];
    const description = 'Sample description';

    const query = `
      INSERT INTO Expenses (category, amount, date, description) 
      VALUES (?, ?, ?, ?)
    `;
    await db.execute(query, [randomCategory, randomAmount, formattedDate, description]);
    res.redirect('/');
  } catch (err) {
    console.error('Error adding random expense:', err);
    res.status(500).send('Error adding random expense: ' + err.message);
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});