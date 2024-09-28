import { Client } from 'pg';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
    });

    try {
      await client.connect();

      // Query to check if the user exists with the given email and password
      const query = 'SELECT * FROM Users WHERE Username = $1 AND Password = $2';
      const values = [email, password];

      const result = await client.query(query, values);

      if (result.rows.length > 0) {
        // User found, login successful
        res.status(200).json({ message: 'Login successful' });
      } else {
        // Invalid credentials
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error(error);
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
