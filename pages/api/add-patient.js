// pages/api/add-patient.js

import { Client } from 'pg';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, age, condition } = req.body;

    const client = new Client({
      connectionString: process.env.POSTGRES_URL, // Ensure you have this set in your .env.local
    });

    try {
      await client.connect();
      const query = 'INSERT INTO patients (name, age, details) VALUES ($1, $2, $3)';
      const values = [name, age, condition];

      await client.query(query, values);
      res.status(201).json({ message: 'Patient added successfully' });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    } finally {
      await client.end();
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
