import bcrypt from 'bcrypt'

export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { password } = req.body;
      
      // Set the salt rounds (higher means more security but slower)
      const saltRounds = 10;
  
      try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        res.status(200).json({ hashedPassword });
      } catch (error) {
        res.status(500).json({ error: 'Error hashing password' });
      }
    } else {
      res.status(405).json({ message: 'Only POST requests are allowed' });
    }
  }