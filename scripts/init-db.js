const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, '..', 'database', 'airprop.db');

// Create database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Read and execute schema
const schemaPath = path.join(__dirname, '..', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database.');
});

// Execute schema
db.exec(schema, (err) => {
    if (err) {
        console.error('Error creating tables:', err.message);
        process.exit(1);
    }
    console.log('Database schema created successfully!');
});

// Insert sample data
const sampleData = `
INSERT INTO Property (Address, ListingPrice, Rent) VALUES 
('123 Main St, City A', 250000.00, 1500.00),
('456 Oak Ave, City B', 300000.00, 1800.00),
('789 Pine Rd, City C', 200000.00, 1200.00);

INSERT INTO Tenant (Name, RentDue, PropertyID) VALUES 
('John Doe', 1500.00, 1),
('Jane Smith', 1800.00, 2),
('Bob Johnson', 1200.00, 3);
`;

db.exec(sampleData, (err) => {
    if (err) {
        console.error('Error inserting sample data:', err.message);
    } else {
        console.log('Sample data inserted successfully!');
    }
    
    // Close database connection
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
            console.log('Database initialization completed!');
        }
    });
});
