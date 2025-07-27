
import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import 'multer'; // Ensure multer's global type augmentations are loaded
import { read, utils } from 'xlsx';
import dbConnect from '../../lib/db';
import { runMiddleware } from '../../lib/utils';
import mongoose from 'mongoose';

// Define Mongoose Schema and Model, using a cached version if it exists
const fileSchema = new mongoose.Schema({
  fileName: String,
  headers: [String],
  data: [mongoose.Schema.Types.Mixed],
  createdAt: { type: Date, default: Date.now }
});
const FileModel = mongoose.models.File || mongoose.model('File', fileSchema);

// Multer setup for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Disable Next.js body parser for this route to allow multer to work
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest & { file?: Express.Multer.File },
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await dbConnect();
    await runMiddleware(req, res, upload.single('file'));
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const wb = read(req.file.buffer, { type: 'buffer' });
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    const jsonData = utils.sheet_to_json(ws);

    if (jsonData.length === 0) {
      return res.status(400).json({ message: "Excel file is empty or could not be parsed." });
    }

    const headers = Object.keys(jsonData[0] || {});

    const newFile = new FileModel({
      fileName: req.file.originalname,
      headers,
      data: jsonData
    });

    const savedFile = await newFile.save();
    res.status(201).json(savedFile);

  } catch (error: any) {
    console.error('File processing error:', error);
    res.status(500).json({ message: error.message || "Failed to process the Excel file." });
  }
}
