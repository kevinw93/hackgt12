import { exec } from 'child_process';

export default function handler(req, res) {
  if (req.method === 'POST') {
    exec('print_arguments.py', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing script: ${error.message}`);
        return res.status(500).json({ error: error.message }); // Return error message
      }
      if (stderr) {
        console.error(`Script stderr: ${stderr}`);
        return res.status(500).json({ error: stderr }); // Return stderr message
      }
      res.status(200).json({ output: stdout });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}