// Dieses Script liest die schema.sql und führt sie gegen die DB aus
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  console.log('🚀 Starting database migration...');
  
  try {
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'schema.sql'), 
      'utf8'
    );
    
    await pool.query(schemaSQL);
    console.log('✅ Migration successful!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();