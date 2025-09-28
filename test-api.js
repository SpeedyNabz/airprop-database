const http = require('http');

const baseUrl = 'http://localhost:3000/api';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: `/api${path}`,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedBody = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsedBody });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Test functions
async function testAPI() {
    console.log('🚀 Starting AirProp Database API Tests\n');

    try {
        // Test 1: Health Check
        console.log('1. Testing health endpoint...');
        const health = await makeRequest('GET', '/health');
        console.log(`   Status: ${health.status}`);
        console.log(`   Response: ${JSON.stringify(health.data)}\n`);

        // Test 2: Get all properties
        console.log('2. Getting all properties...');
        const properties = await makeRequest('GET', '/properties');
        console.log(`   Status: ${properties.status}`);
        console.log(`   Found ${properties.data.length} properties\n`);

        // Test 3: Get all tenants
        console.log('3. Getting all tenants...');
        const tenants = await makeRequest('GET', '/tenants');
        console.log(`   Status: ${tenants.status}`);
        console.log(`   Found ${tenants.data.length} tenants\n`);

        // Test 4: Create a new property
        console.log('4. Creating a new property...');
        const newProperty = await makeRequest('POST', '/properties', {
            address: '999 Test Street, Test City',
            listingPrice: 400000.00,
            rent: 2000.00
        });
        console.log(`   Status: ${newProperty.status}`);
        console.log(`   Created property ID: ${newProperty.data.PropertyID}\n`);

        // Test 5: Create a new tenant
        console.log('5. Creating a new tenant...');
        const newTenant = await makeRequest('POST', '/tenants', {
            name: 'Test Tenant',
            rentDue: 2000.00,
            propertyId: newProperty.data.PropertyID
        });
        console.log(`   Status: ${newTenant.status}`);
        console.log(`   Created tenant ID: ${newTenant.data.TenantID}\n`);

        // Test 6: Get property with tenants
        console.log('6. Getting property with tenants...');
        const propertyWithTenants = await makeRequest('GET', `/properties/${newProperty.data.PropertyID}`);
        console.log(`   Status: ${propertyWithTenants.status}`);
        console.log(`   Property: ${propertyWithTenants.data.Address}`);
        console.log(`   Tenant count: ${propertyWithTenants.data.tenant_count}\n`);

        // Test 7: Update property
        console.log('7. Updating property...');
        const updatedProperty = await makeRequest('PUT', `/properties/${newProperty.data.PropertyID}`, {
            listingPrice: 425000.00,
            rent: 2100.00
        });
        console.log(`   Status: ${updatedProperty.status}`);
        console.log(`   Updated listing price: $${updatedProperty.data.ListingPrice}\n`);

        // Test 8: Update tenant
        console.log('8. Updating tenant...');
        const updatedTenant = await makeRequest('PUT', `/tenants/${newTenant.data.TenantID}`, {
            name: 'Updated Test Tenant',
            rentDue: 2100.00
        });
        console.log(`   Status: ${updatedTenant.status}`);
        console.log(`   Updated tenant name: ${updatedTenant.data.Name}\n`);

        // Test 9: Get tenants for property
        console.log('9. Getting tenants for property...');
        const propertyTenants = await makeRequest('GET', `/properties/${newProperty.data.PropertyID}/tenants`);
        console.log(`   Status: ${propertyTenants.status}`);
        console.log(`   Found ${propertyTenants.data.length} tenants for this property\n`);

        // Test 10: Clean up - Delete tenant
        console.log('10. Deleting test tenant...');
        const deleteTenant = await makeRequest('DELETE', `/tenants/${newTenant.data.TenantID}`);
        console.log(`   Status: ${deleteTenant.status}`);
        console.log(`   Response: ${JSON.stringify(deleteTenant.data)}\n`);

        // Test 11: Clean up - Delete property
        console.log('11. Deleting test property...');
        const deleteProperty = await makeRequest('DELETE', `/properties/${newProperty.data.PropertyID}`);
        console.log(`   Status: ${deleteProperty.status}`);
        console.log(`   Response: ${JSON.stringify(deleteProperty.data)}\n`);

        console.log('✅ All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n💡 Make sure the server is running on port 3000:');
        console.log('   npm start');
    }
}

// Run tests
testAPI();
