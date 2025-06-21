import express from 'express';
import multer from 'multer';
import { estimateExpiry } from '../controllers/LlamaExpiryDetect.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/estimate', upload.single('image'), estimateExpiry);

export default router;