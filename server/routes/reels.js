import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import Reel from '../models/Reel.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

// Upload a new reel
router.post('/', authenticate, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No video file provided' });
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { 
          resource_type: 'video',
          folder: 'reels',
          eager: [{ width: 400, height: 711, crop: 'fill', format: 'jpg' }]
        },
        (error, result) => error ? reject(error) : resolve(result)
      );
      stream.end(req.file.buffer);
    });

    // Create new reel
    const reel = new Reel({
      user: req.user.userId,
      videoUrl: result.secure_url,
      thumbnailUrl: result.eager[0].secure_url,
      caption: req.body.caption,
      music: req.body.music,
      duration: result.duration,
      privacy: req.body.privacy || 'public'
    });
    
    await reel.save();
    res.status(201).json(reel);
    
  } catch (error) {
    console.error('Error uploading reel:', error);
    res.status(500).json({ message: 'Error uploading reel', error: error.message });
  }
});

// Get reels feed
router.get('/feed', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const reels = await Reel.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username avatar');
    
    res.json({ success: true, reels });
    
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reels', error: error.message });
  }
});

// Like/unlike a reel
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });
    
    const userId = req.user.userId;
    const likeIndex = reel.likes.indexOf(userId);
    
    if (likeIndex === -1) {
      reel.likes.push(userId);
      reel.likeCount += 1;
    } else {
      reel.likes.splice(likeIndex, 1);
      reel.likeCount = Math.max(0, reel.likeCount - 1);
    }
    
    await reel.save();
    res.json({ success: true, likeCount: reel.likeCount });
    
  } catch (error) {
    res.status(500).json({ message: 'Error toggling like', error: error.message });
  }
});

export default router;
