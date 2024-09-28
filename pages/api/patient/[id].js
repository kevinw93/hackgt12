// pages/api/patient/[id].js

import { Client } from 'pg';

export default async function handler(req, res) {
  const { id } = req.query; // Get the patient ID from the request query

  if (req.method === 'GET') {
    const client = new Client({
      connectionString: process.env.POSTGRES_URL, // Ensure this is set in your .env.local
    });

    try {
      await client.connect();
      const query = 'SELECT * FROM patients WHERE id = $1';
      const values = [id];

      const result = await client.query(query, values);

      if (result.rows.length > 0) {
        res.status(200).json(result.rows[0]); // Send the patient data as JSON
      } else {
        res.status(404).json({ message: 'Patient not found' });
      }
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    } finally {
      await client.end();
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
