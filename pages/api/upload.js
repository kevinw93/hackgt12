import { Storage } from '@google-cloud/storage';
import formidable from 'formidable';

// Initialize Google Cloud Storage
const storage = new Storage({
  keyFilename: process.env.GOOGLE_CLOUD_KEYFILE, // Use the path to your JSON key file
});

const bucketName = '<YOUR_BUCKET_NAME>'; // Replace with your bucket name
const bucket = storage.bucket(bucketName);

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

      const file = files.file; // Access the uploaded file
      console.log('Uploaded file:', file); // Debugging

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      try {
        // Upload file to Google Cloud Storage
        await bucket.upload(file.filepath, {
          destination: file.originalFilename, // Save file with its original name
        });
        
        res.status(200).json({ message: 'File uploaded successfully', url: `https://storage.googleapis.com/${bucketName}/${file.originalFilename}` });
      } catch (error) {
        console.error('Error uploading to Google Cloud Storage:', error);
        res.status(500).json({ error: 'Error uploading file' });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
