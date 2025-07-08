const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const WebSocket = require('ws')
const http = require('http')
const cron = require('node-cron')

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite')
const db = new sqlite3.Database(dbPath)

// Middleware
app.use(helmet())
app.use(compression())
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Rate limiting for API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use('/api', limiter)

// JWT secret key (changer en prod via variable d'env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Database initialization
const initDatabase = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    db.run(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        spent REAL DEFAULT 0,
        period TEXT DEFAULT 'monthly',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `)
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `)
    db.run(`
      CREATE TABLE IF NOT EXISTS crypto_portfolio (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        symbol TEXT NOT NULL,
        amount REAL NOT NULL,
        purchase_price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `)
    console.log('Database initialized successfully')
  })
}
initDatabase()

// Middleware to check JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Access token required' })

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' })
    req.user = user
    next()
  })
}

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array(),
    })
  }
  next()
}

// --- AUTH ROUTES ---

app.post(
  '/api/auth/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  handleValidationErrors,
  (req, res) => {
    const { name, email, password } = req.body

    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      if (row) return res.status(400).json({ message: 'User already exists' })

      try {
        const hashedPassword = await bcrypt.hash(password, 10)
        db.run(
          'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
          [name, email, hashedPassword],
          function (err) {
            if (err) return res.status(500).json({ message: 'Failed to create user' })

            const userId = this.lastID
            const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' })

            res.status(201).json({
              message: 'User created successfully',
              token,
              user: { id: userId, name, email },
            })
          }
        )
      } catch {
        res.status(500).json({ message: 'Server error' })
      }
    })
  }
)

app.post(
  '/api/auth/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  handleValidationErrors,
  (req, res) => {
    const { email, password } = req.body
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      if (!user) return res.status(400).json({ message: 'Invalid credentials' })

      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) return res.status(400).json({ message: 'Invalid credentials' })

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

      res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, name: user.name, email: user.email },
      })
    })
  }
)

app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get('SELECT id, name, email FROM users WHERE id = ?', [req.user.userId], (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error' })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  })
})

// --- BUDGET ROUTES ---

app.get('/api/budgets', authenticateToken, (req, res) => {
  db.all('SELECT * FROM budgets WHERE user_id = ? ORDER BY created_at DESC', [req.user.userId], (err, budgets) => {
    if (err) return res.status(500).json({ message: 'Database error' })
    res.json(budgets)
  })
})

app.post(
  '/api/budgets',
  authenticateToken,
  [
    body('category').trim().notEmpty().withMessage('Category required'),
    body('amount').isFloat({ min: 0 }).withMessage('Valid amount required'),
    body('period').isIn(['weekly', 'monthly', 'yearly']).withMessage('Valid period required'),
  ],
  handleValidationErrors,
  (req, res) => {
    const { category, amount, period } = req.body
    db.run(
      'INSERT INTO budgets (user_id, category, amount, period) VALUES (?, ?, ?, ?)',
      [req.user.userId, category, amount, period],
      function (err) {
        if (err) return res.status(500).json({ message: 'Failed to create budget' })
        db.get('SELECT * FROM budgets WHERE id = ?', [this.lastID], (err, budget) => {
          if (err) return res.status(500).json({ message: 'Database error' })
          res.status(201).json(budget)
        })
      }
    )
  }
)

app.put(
  '/api/budgets/:id',
  authenticateToken,
  [
    body('category').trim().notEmpty().withMessage('Category required'),
    body('amount').isFloat({ min: 0 }).withMessage('Valid amount required'),
    body('period').isIn(['weekly', 'monthly', 'yearly']).withMessage('Valid period required'),
  ],
  handleValidationErrors,
  (req, res) => {
    const { category, amount, period } = req.body
    const budgetId = req.params.id
    db.run(
      'UPDATE budgets SET category = ?, amount = ?, period = ? WHERE id = ? AND user_id = ?',
      [category, amount, period, budgetId, req.user.userId],
      function (err) {
        if (err) return res.status(500).json({ message: 'Failed to update budget' })
        if (this.changes === 0) return res.status(404).json({ message: 'Budget not found' })
        db.get('SELECT * FROM budgets WHERE id = ?', [budgetId], (err, budget) => {
          if (err) return res.status(500).json({ message: 'Database error' })
          res.json(budget)
        })
      }
    )
  }
)

app.delete('/api/budgets/:id', authenticateToken, (req, res) => {
  const budgetId = req.params.id
  db.run('DELETE FROM budgets WHERE id = ? AND user_id = ?', [budgetId, req.user.userId], function (err) {
    if (err) return res.status(500).json({ message: 'Failed to delete budget' })
    if (this.changes === 0) return res.status(404).json({ message: 'Budget not found' })
    res.json({ message: 'Budget deleted successfully' })
  })
})

// --- TRANSACTIONS ROUTES ---

app.get('/api/transactions', authenticateToken, (req, res) => {
  db.all('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC', [req.user.userId], (err, transactions) => {
    if (err) return res.status(500).json({ message: 'Database error' })
    res.json(transactions)
  })
})

app.post(
  '/api/transactions',
  authenticateToken,
  [
    body('description').trim().notEmpty().withMessage('Description required'),
    body('amount').isFloat().withMessage('Valid amount required'),
    body('category').trim().notEmpty().withMessage('Category required'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('date').isISO8601().toDate().withMessage('Valid date required'),
  ],
  handleValidationErrors,
  (req, res) => {
    const { description, amount, category, type, date } = req.body
    db.run(
      'INSERT INTO transactions (user_id, description, amount, category, type, date) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.userId, description, amount, category, type, date],
      function (err) {
        if (err) return res.status(500).json({ message: 'Failed to create transaction' })
        db.get('SELECT * FROM transactions WHERE id = ?', [this.lastID], (err, transaction) => {
          if (err) return res.status(500).json({ message: 'Database error' })
          res.status(201).json(transaction)
        })
      }
    )
  }
)

app.put(
  '/api/transactions/:id',
  authenticateToken,
  [
    body('description').trim().notEmpty().withMessage('Description required'),
    body('amount').isFloat().withMessage('Valid amount required'),
    body('category').trim().notEmpty().withMessage('Category required'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('date').isISO8601().toDate().withMessage('Valid date required'),
  ],
  handleValidationErrors,
  (req, res) => {
    const { description, amount, category, type, date } = req.body
    const transactionId = req.params.id
    db.run(
      'UPDATE transactions SET description = ?, amount = ?, category = ?, type = ?, date = ? WHERE id = ? AND user_id = ?',
      [description, amount, category, type, date, transactionId, req.user.userId],
      function (err) {
        if (err) return res.status(500).json({ message: 'Failed to update transaction' })
        if (this.changes === 0) return res.status(404).json({ message: 'Transaction not found' })
        db.get('SELECT * FROM transactions WHERE id = ?', [transactionId], (err, transaction) => {
          if (err) return res.status(500).json({ message: 'Database error' })
          res.json(transaction)
        })
      }
    )
  }
)

app.delete('/api/transactions/:id', authenticateToken, (req, res) => {
  const transactionId = req.params.id
  db.run('DELETE FROM transactions WHERE id = ? AND user_id = ?', [transactionId, req.user.userId], function (err) {
    if (err) return res.status(500).json({ message: 'Failed to delete transaction' })
    if (this.changes === 0) return res.status(404).json({ message: 'Transaction not found' })
    res.json({ message: 'Transaction deleted successfully' })
  })
})

// --- CRYPTO PORTFOLIO ROUTES ---

app.get('/api/crypto', authenticateToken, (req, res) => {
  db.all('SELECT * FROM crypto_portfolio WHERE user_id = ? ORDER BY created_at DESC', [req.user.userId], (err, portfolio) => {
    if (err) return res.status(500).json({ message: 'Database error' })
    res.json(portfolio)
  })
})

app.post(
  '/api/crypto',
  authenticateToken,
  [
    body('symbol').trim().notEmpty().withMessage('Symbol required'),
    body('amount').isFloat({ min: 0 }).withMessage('Valid amount required'),
    body('purchase_price').isFloat({ min: 0 }).withMessage('Valid purchase price required'),
  ],
  handleValidationErrors,
  (req, res) => {
    const { symbol, amount, purchase_price } = req.body
    db.run(
      'INSERT INTO crypto_portfolio (user_id, symbol, amount, purchase_price) VALUES (?, ?, ?, ?)',
      [req.user.userId, symbol, amount, purchase_price],
      function (err) {
        if (err) return res.status(500).json({ message: 'Failed to add crypto holding' })
        db.get('SELECT * FROM crypto_portfolio WHERE id = ?', [this.lastID], (err, holding) => {
          if (err) return res.status(500).json({ message: 'Database error' })
          res.status(201).json(holding)
        })
      }
    )
  }
)

// --- CRYPTO PRICES ROUTE ---

app.get('/api/crypto/prices', (req, res) => {
  // Mock cryptocurrency prices data
  const cryptoPrices = {
    BTC: 43250.50,
    ETH: 2580.75,
    ADA: 0.485,
    DOT: 7.42,
    LINK: 14.85,
    LTC: 72.35,
    XRP: 0.52,
    BCH: 245.80
  }
  
  res.json(cryptoPrices)
})

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established')
  
  ws.on('message', (message) => {
    console.log('Received:', message.toString())
  })
  
  ws.on('close', () => {
    console.log('WebSocket connection closed')
  })
})

// Scheduled tasks (example: daily budget reset)
cron.schedule('0 0 * * *', () => {
  console.log('Running daily maintenance tasks...')
  // Add any scheduled tasks here
})

// Start the server
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})




