import { Router } from 'express';
import { auth } from '../middleware/auth';
import { uploadImages, getImages, rearrangeImages, editImage, deleteImage } from '../controllers/imageController';

const router = Router();
router.post('/upload', auth, uploadImages);
router.get('/', auth, getImages);
router.put('/rearrange', auth, rearrangeImages);
router.put('/:id', auth, editImage);
router.delete('/:id', auth, deleteImage);

export default router;