import express from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/postController.js';
import {
  getComments,
  addComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Post routes
router.get('/', getPosts);
router.post('/', protect, createPost);
router.get('/:id', getPostById);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

// Nested comment routes under /api/posts/:id/comments
router.get('/:id/comments', getComments);
router.post('/:id/comments', protect, addComment);

export default router;
