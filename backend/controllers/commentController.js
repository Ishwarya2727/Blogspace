import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

// @desc    Get comments for a specific post
// @route   GET /api/posts/:id/comments
// @access  Public
export const getComments = async (req, res) => {
  try {
    const { id: postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    const comments = await Comment.find({ post: postId })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (err) {
    console.error('Get Comments Error:', err);
    res.status(500).json({ message: 'Failed to fetch comments', error: err.message });
  }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content cannot be empty' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    const comment = await Comment.create({
      content: content.trim(),
      author: req.user._id,
      post: postId,
    });

    const populatedComment = await Comment.findById(comment._id).populate('author', 'name email');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: populatedComment,
    });
  } catch (err) {
    console.error('Add Comment Error:', err);
    res.status(500).json({ message: 'Failed to add comment', error: err.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (Comment author or Post author)
export const deleteComment = async (req, res) => {
  try {
    const { id: commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const post = await Post.findById(comment.post);

    const isCommentAuthor = comment.author.toString() === req.user._id.toString();
    const isPostAuthor = post && post.author.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own comments' });
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Delete Comment Error:', err);
    res.status(500).json({ message: 'Failed to delete comment', error: err.message });
  }
};
