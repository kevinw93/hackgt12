import { put } from '@vercel/blob';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();
    
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing the file:', err);
        return res.status(500).json({ error: 'Failed to parse file' });
      }

      const file = files.image; // Ensure this matches the name in the form
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      try {
        // Upload to Vercel Blob
        const blob = await put(file.filepath, {
          access: 'public', // Set access level
        });
        res.status(200).json({ url: blob.url }); // Return the blob URL
      } catch (error) {
        console.error('Error uploading to Vercel Blob:', error);
        res.status(500).json({ error: 'Error uploading file' });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
