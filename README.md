# AirProp Database API

A Node.js REST API for managing properties and tenants using SQLite database.

## Features

- **Property Management**: Create, read, update, and delete properties
- **Tenant Management**: Create, read, update, and delete tenants
- **Relational Data**: Properties can have multiple tenants
- **Data Validation**: Input validation and error handling
- **SQLite Database**: Lightweight, file-based database
- **RESTful API**: Standard HTTP methods and status codes

## Database Schema

### Property Table
- `PropertyID` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `Address` (TEXT, NOT NULL)
- `ListingPrice` (REAL, NOT NULL, CHECK >= 0)
- `Rent` (REAL, NOT NULL, CHECK >= 0)

### Tenant Table
- `TenantID` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `Name` (TEXT, NOT NULL)
- `RentDue` (REAL, NOT NULL, CHECK >= 0)
- `PropertyID` (INTEGER, NOT NULL, FOREIGN KEY)

## Installation

1. **Clone or download the project**
   ```bash
   cd airprop-database
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize the database**
   ```bash
   npm run init-db
   ```

4. **Start the server**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

## API Endpoints

Base URL: `http://localhost:3000/api`

### Properties

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/properties` | Get all properties with tenant information |
| GET | `/properties/:id` | Get property by ID with tenant information |
| POST | `/properties` | Create a new property |
| PUT | `/properties/:id` | Update property by ID |
| DELETE | `/properties/:id` | Delete property by ID |
| GET | `/properties/:id/tenants` | Get all tenants for a property |

### Tenants

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tenants` | Get all tenants with property information |
| GET | `/tenants/:id` | Get tenant by ID with property information |
| POST | `/tenants` | Create a new tenant |
| PUT | `/tenants/:id` | Update tenant by ID |
| DELETE | `/tenants/:id` | Delete tenant by ID |

### Utility

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |

## API Usage Examples

### Create a Property
```bash
curl -X POST http://localhost:3000/api/properties \
  -H "Content-Type: application/json" \
  -d '{
    "address": "123 Main Street, Anytown, USA",
    "listingPrice": 250000.00,
    "rent": 1500.00
  }'
```

### Create a Tenant
```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "rentDue": 1500.00,
    "propertyId": 1
  }'
```

### Get All Properties
```bash
curl http://localhost:3000/api/properties
```

### Get Property with Tenants
```bash
curl http://localhost:3000/api/properties/1
```

### Update a Property
```bash
curl -X PUT http://localhost:3000/api/properties/1 \
  -H "Content-Type: application/json" \
  -d '{
    "listingPrice": 275000.00,
    "rent": 1650.00
  }'
```

### Delete a Tenant
```bash
curl -X DELETE http://localhost:3000/api/tenants/1
```

## Response Format

### Success Response
```json
{
  "PropertyID": 1,
  "Address": "123 Main Street, Anytown, USA",
  "ListingPrice": 250000.00,
  "Rent": 1500.00,
  "tenant_count": 1,
  "tenant_names": "John Doe"
}
```

### Error Response
```json
{
  "error": "Property not found"
}
```

## Data Validation

- **Address**: Required for properties
- **Listing Price**: Must be non-negative
- **Rent**: Must be non-negative
- **Tenant Name**: Required for tenants
- **Rent Due**: Must be non-negative
- **Property ID**: Must reference an existing property

## Database Features

- **Foreign Key Constraints**: Ensures referential integrity
- **Cascade Delete**: Deleting a property removes associated tenants
- **Indexing**: Optimized queries on PropertyID in Tenant table
- **Data Types**: Proper SQLite data types for optimal storage

## Project Structure

```
airprop-database/
├── database/
│   ├── airprop.db          # SQLite database file (created after init)
│   └── db.js               # Database connection and helper functions
├── scripts/
│   └── init-db.js          # Database initialization script
├── schema.sql              # Database schema
├── server.js               # Main server file with API routes
├── package.json            # Node.js dependencies and scripts
└── README.md               # This file
```

## Development

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm run init-db` - Initialize database with schema and sample data

### Environment Variables

- `PORT` - Server port (default: 3000)

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Database or server errors

All errors return JSON with an `error` field containing the error message.

## Sample Data

The initialization script creates sample data:

- 3 properties with different addresses and prices
- 3 tenants assigned to the properties
- Demonstrates the relationship between properties and tenants

## License

MIT License
