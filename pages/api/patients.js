// pages/api/patients.js

import { Client } from 'pg';

export default async function handler(req, res) {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL, // Ensure you have this set in your .env.local
  });

  try {
    await client.connect();
    const result = await client.query('SELECT * FROM patients');
    res.status(200).json(result.rows); // Send patient data as JSON
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.end();
  }
}
