const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Configure multer for memory storage (we'll upload to Cloudinary or S3)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and audio files
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'audio/webm',
      'audio/wav',
      'audio/mp3',
      'audio/mpeg'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and audio files are allowed.'));
    }
  }
});

// For simplicity, we'll use local storage for now
// In production, you should use Cloudinary or S3
const fs = require('fs');
const uploadDir = path.join(__dirname, '../uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Upload image
router.post('/image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Generate unique filename
    const fileExt = path.extname(req.file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Save file
    fs.writeFileSync(filePath, req.file.buffer);
    
    // Return URL (in production, this would be a CDN URL)
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
    
    res.json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Upload voice message
router.post('/voice', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Generate unique filename
    const fileExt = path.extname(req.file.originalname) || '.webm';
    const fileName = `voice-${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Save file
    fs.writeFileSync(filePath, req.file.buffer);
    
    // Return URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
    
    res.json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading voice message:', error);
    res.status(500).json({ error: 'Failed to upload voice message' });
  }
});

// Serve uploaded files
router.use('/files', express.static(uploadDir));

module.exports = router;
