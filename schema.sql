-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Property Table
CREATE TABLE Property (
    PropertyID INTEGER PRIMARY KEY AUTOINCREMENT,
    Address TEXT NOT NULL,
    ListingPrice REAL NOT NULL CHECK (ListingPrice >= 0),
    Rent REAL NOT NULL CHECK (Rent >= 0)
);

-- Tenant Table
CREATE TABLE Tenant (
    TenantID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    RentDue REAL NOT NULL CHECK (RentDue >= 0),
    PropertyID INTEGER NOT NULL,
    FOREIGN KEY (PropertyID) REFERENCES Property(PropertyID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Index for faster lookup of tenants by property
CREATE INDEX idx_Tenant_PropertyID ON Tenant(PropertyID);
