const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { dbRun, dbGet, dbAll } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Property Routes

// Get all properties
app.get('/api/properties', async (req, res) => {
    try {
        const properties = await dbAll(`
            SELECT p.*, 
                   COUNT(t.TenantID) as tenant_count,
                   GROUP_CONCAT(t.Name) as tenant_names
            FROM Property p
            LEFT JOIN Tenant t ON p.PropertyID = t.PropertyID
            GROUP BY p.PropertyID
        `);
        res.json(properties);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get property by ID
app.get('/api/properties/:id', async (req, res) => {
    try {
        const property = await dbGet(`
            SELECT p.*, 
                   COUNT(t.TenantID) as tenant_count,
                   GROUP_CONCAT(t.Name) as tenant_names
            FROM Property p
            LEFT JOIN Tenant t ON p.PropertyID = t.PropertyID
            WHERE p.PropertyID = ?
            GROUP BY p.PropertyID
        `, [req.params.id]);
        
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        res.json(property);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new property
app.post('/api/properties', async (req, res) => {
    try {
        const { address, listingPrice, rent } = req.body;
        
        // Validation
        if (!address || listingPrice === undefined || rent === undefined) {
            return res.status(400).json({ error: 'Address, listing price, and rent are required' });
        }
        
        if (listingPrice < 0 || rent < 0) {
            return res.status(400).json({ error: 'Listing price and rent must be non-negative' });
        }
        
        const result = await dbRun(
            'INSERT INTO Property (Address, ListingPrice, Rent) VALUES (?, ?, ?)',
            [address, listingPrice, rent]
        );
        
        const newProperty = await dbGet('SELECT * FROM Property WHERE PropertyID = ?', [result.id]);
        res.status(201).json(newProperty);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update property
app.put('/api/properties/:id', async (req, res) => {
    try {
        const { address, listingPrice, rent } = req.body;
        
        // Validation
        if (listingPrice !== undefined && listingPrice < 0) {
            return res.status(400).json({ error: 'Listing price must be non-negative' });
        }
        
        if (rent !== undefined && rent < 0) {
            return res.status(400).json({ error: 'Rent must be non-negative' });
        }
        
        const updates = [];
        const params = [];
        
        if (address !== undefined) {
            updates.push('Address = ?');
            params.push(address);
        }
        if (listingPrice !== undefined) {
            updates.push('ListingPrice = ?');
            params.push(listingPrice);
        }
        if (rent !== undefined) {
            updates.push('Rent = ?');
            params.push(rent);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        params.push(req.params.id);
        
        const result = await dbRun(
            `UPDATE Property SET ${updates.join(', ')} WHERE PropertyID = ?`,
            params
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        const updatedProperty = await dbGet('SELECT * FROM Property WHERE PropertyID = ?', [req.params.id]);
        res.json(updatedProperty);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete property
app.delete('/api/properties/:id', async (req, res) => {
    try {
        const result = await dbRun('DELETE FROM Property WHERE PropertyID = ?', [req.params.id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Tenant Routes

// Get all tenants
app.get('/api/tenants', async (req, res) => {
    try {
        const tenants = await dbAll(`
            SELECT t.*, p.Address as property_address
            FROM Tenant t
            JOIN Property p ON t.PropertyID = p.PropertyID
        `);
        res.json(tenants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get tenant by ID
app.get('/api/tenants/:id', async (req, res) => {
    try {
        const tenant = await dbGet(`
            SELECT t.*, p.Address as property_address
            FROM Tenant t
            JOIN Property p ON t.PropertyID = p.PropertyID
            WHERE t.TenantID = ?
        `, [req.params.id]);
        
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        
        res.json(tenant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get tenants by property ID
app.get('/api/properties/:id/tenants', async (req, res) => {
    try {
        const tenants = await dbAll(
            'SELECT * FROM Tenant WHERE PropertyID = ?',
            [req.params.id]
        );
        res.json(tenants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new tenant
app.post('/api/tenants', async (req, res) => {
    try {
        const { name, rentDue, propertyId } = req.body;
        
        // Validation
        if (!name || rentDue === undefined || !propertyId) {
            return res.status(400).json({ error: 'Name, rent due, and property ID are required' });
        }
        
        if (rentDue < 0) {
            return res.status(400).json({ error: 'Rent due must be non-negative' });
        }
        
        // Check if property exists
        const property = await dbGet('SELECT * FROM Property WHERE PropertyID = ?', [propertyId]);
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        const result = await dbRun(
            'INSERT INTO Tenant (Name, RentDue, PropertyID) VALUES (?, ?, ?)',
            [name, rentDue, propertyId]
        );
        
        const newTenant = await dbGet(`
            SELECT t.*, p.Address as property_address
            FROM Tenant t
            JOIN Property p ON t.PropertyID = p.PropertyID
            WHERE t.TenantID = ?
        `, [result.id]);
        
        res.status(201).json(newTenant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update tenant
app.put('/api/tenants/:id', async (req, res) => {
    try {
        const { name, rentDue, propertyId } = req.body;
        
        // Validation
        if (rentDue !== undefined && rentDue < 0) {
            return res.status(400).json({ error: 'Rent due must be non-negative' });
        }
        
        if (propertyId !== undefined) {
            const property = await dbGet('SELECT * FROM Property WHERE PropertyID = ?', [propertyId]);
            if (!property) {
                return res.status(404).json({ error: 'Property not found' });
            }
        }
        
        const updates = [];
        const params = [];
        
        if (name !== undefined) {
            updates.push('Name = ?');
            params.push(name);
        }
        if (rentDue !== undefined) {
            updates.push('RentDue = ?');
            params.push(rentDue);
        }
        if (propertyId !== undefined) {
            updates.push('PropertyID = ?');
            params.push(propertyId);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        params.push(req.params.id);
        
        const result = await dbRun(
            `UPDATE Tenant SET ${updates.join(', ')} WHERE TenantID = ?`,
            params
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        
        const updatedTenant = await dbGet(`
            SELECT t.*, p.Address as property_address
            FROM Tenant t
            JOIN Property p ON t.PropertyID = p.PropertyID
            WHERE t.TenantID = ?
        `, [req.params.id]);
        
        res.json(updatedTenant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete tenant
app.delete('/api/tenants/:id', async (req, res) => {
    try {
        const result = await dbRun('DELETE FROM Tenant WHERE TenantID = ?', [req.params.id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        
        res.json({ message: 'Tenant deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'AirProp Database API is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
