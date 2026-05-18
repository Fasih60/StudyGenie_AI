import express from 'express';
import multer from 'multer';
import { uploadMaterial, getMaterials, deleteMaterial } from '../controllers/materialController';
import { protect } from '../middleware/auth';

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Temporary storage before processing

router.post('/upload', protect, upload.single('file'), uploadMaterial);
router.get('/', protect, getMaterials);
router.delete('/:id', protect, deleteMaterial);

export default router;
