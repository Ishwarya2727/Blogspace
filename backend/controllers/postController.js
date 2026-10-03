import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

// @desc    Get all posts with author and comment count
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    // Aggregate comment counts for each post efficiently
    const commentCounts = await Comment.aggregate([
      { $group: { _id: '$post', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    commentCounts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const postsWithCommentCounts = posts.map((post) => {
      const pObj = post.toObject();
      pObj.commentCount = countMap[post._id.toString()] || 0;
      return pObj;
    });

    res.status(200).json(postsWithCommentCounts);
  } catch (err) {
    console.error('Get Posts Error:', err);
    res.status(500).json({ message: 'Failed to fetch blog posts', error: err.message });
  }
};

// @desc    Get single post by ID with comment count
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email');

    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    const commentCount = await Comment.countDocuments({ post: post._id });

    const postObj = post.toObject();
    postObj.commentCount = commentCount;

    res.status(200).json(postObj);
  } catch (err) {
    console.error('Get Post By ID Error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.status(500).json({ message: 'Failed to fetch blog post', error: err.message });
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Please provide both title and content' });
    }

    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      author: req.user._id,
    });

    const populatedPost = await Post.findById(post._id).populate('author', 'name email');
    const postObj = populatedPost.toObject();
    postObj.commentCount = 0;

    res.status(201).json({
      message: 'Post published successfully',
      post: postObj,
    });
  } catch (err) {
    console.error('Create Post Error:', err);
    res.status(500).json({ message: 'Failed to create blog post', error: err.message });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (Author only)
export const updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: Only the post author can edit this post' });
    }

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content cannot be empty' });
    }

    post.title = title.trim();
    post.content = content.trim();
    await post.save();

    const updatedPost = await Post.findById(post._id).populate('author', 'name email');
    const commentCount = await Comment.countDocuments({ post: post._id });

    const postObj = updatedPost.toObject();
    postObj.commentCount = commentCount;

    res.status(200).json({
      message: 'Post updated successfully',
      post: postObj,
    });
  } catch (err) {
    console.error('Update Post Error:', err);
    res.status(500).json({ message: 'Failed to update blog post', error: err.message });
  }
};

// @desc    Delete a post and its associated comments
// @route   DELETE /api/posts/:id
// @access  Private (Author only)
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: Only the post author can delete this post' });
    }

    // Delete associated comments
    await Comment.deleteMany({ post: post._id });

    // Delete post
    await Post.findByIdAndDelete(post._id);

    res.status(200).json({ message: 'Post and associated comments deleted successfully' });
  } catch (err) {
    console.error('Delete Post Error:', err);
    res.status(500).json({ message: 'Failed to delete blog post', error: err.message });
  }
};
