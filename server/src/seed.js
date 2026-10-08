import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Post } from './models/Post.js';
import { Comment } from './models/Comment.js';
import { Notification } from './models/Notification.js';
import { Report } from './models/Report.js';
import { connectDB, closeDB } from './config/db.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    await connectDB();

    // Clear existing collections
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Notification.deleteMany({});
    await Report.deleteMany({});

    console.log('🧹 Cleared existing data.');

    // 1. Create Users
    const users = await User.create([
      {
        name: 'Rahul Sharma',
        username: 'rahul',
        email: 'rahul@blog.dev',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        bio: 'Tech lead & open-source contributor. Passionate about system design, AI, and developer tools.',
        website: 'https://rahulsharma.dev',
        role: 'admin',
        socialLinks: {
          twitter: 'https://twitter.com/rahul',
          github: 'https://github.com/rahul',
          linkedin: 'https://linkedin.com/in/rahul',
        },
      },
      {
        name: 'Utkarsh Sharma',
        username: 'utkarsh',
        email: 'utkarsh@blog.dev',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
        bio: 'AI Developer & Researcher exploring LLMs, deep learning architectures, and modern web platforms.',
        website: 'https://utkarsh.ai',
        role: 'user',
        socialLinks: {
          twitter: 'https://twitter.com/utkarsh',
          github: 'https://github.com/utkarsh',
          linkedin: 'https://linkedin.com/in/utkarsh',
        },
      },
      {
        name: 'Priya Patel',
        username: 'priya',
        email: 'priya@blog.dev',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
        bio: 'Full-stack software engineer specializing in React, Next.js, and scalable cloud applications.',
        website: 'https://priyapatel.dev',
        role: 'user',
        socialLinks: {
          twitter: 'https://twitter.com/priyapatel',
          github: 'https://github.com/priya',
          linkedin: 'https://linkedin.com/in/priya',
        },
      },
      {
        name: 'Aman Verma',
        username: 'aman',
        email: 'aman@blog.dev',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        bio: 'Cybersecurity consultant and DevSecOps practitioner breaking and securing systems.',
        website: 'https://amansecurity.io',
        role: 'user',
        socialLinks: {
          twitter: 'https://twitter.com/amansec',
          github: 'https://github.com/aman',
          linkedin: 'https://linkedin.com/in/aman',
        },
      },
    ]);

    const [rahul, utkarsh, priya, aman] = users;

    // Follow relationships
    rahul.following.push(utkarsh._id, priya._id);
    utkarsh.followers.push(rahul._id);
    priya.followers.push(rahul._id);

    utkarsh.following.push(rahul._id, priya._id, aman._id);
    rahul.followers.push(utkarsh._id);
    priya.followers.push(utkarsh._id);
    aman.followers.push(utkarsh._id);

    priya.following.push(utkarsh._id);
    utkarsh.followers.push(priya._id);

    await rahul.save();
    await utkarsh.save();
    await priya.save();
    await aman.save();

    console.log('✅ Users & relationships seeded.');

    // 2. Create Posts
    const post1 = new Post({
      title: 'Understanding Neural Networks: Architecture, Weights, and Backpropagation',
      content: `<h2>The Genesis of Artificial Neurons</h2>
<p>Artificial Neural Networks (ANNs) represent one of the most powerful paradigms in computer science. Drawing loose inspiration from biological neural pathways, these mathematical models learn representations directly from empirical data.</p>
<h3>1. The Anatomy of a Perceptron</h3>
<p>At the atomical level of every network is the perceptron. It computes a weighted sum of inputs plus a bias term, passed through a non-linear activation function such as ReLU or Sigmoid:</p>
<pre><code>z = w1*x1 + w2*x2 + ... + b
y = max(0, z)  // ReLU activation</code></pre>
<p>Without non-linear activations, stacking deep networks collapses algebraically into a single linear regression!</p>
<h3>2. Forward Pass and Loss Calculation</h3>
<p>During the forward pass, data cascades through input, hidden, and output layers. The final prediction is evaluated against ground truth labels using a loss function like Cross-Entropy or Mean Squared Error.</p>
<h3>3. Backpropagation and Gradient Descent</h3>
<p>Backpropagation applies the calculus chain rule recursively from output to input to calculate gradients with respect to each weight. The weights are updated iteratively using optimizers like Adam or SGD.</p>
<blockquote>Neural networks are not magic; they are high-dimensional function approximators driven by linear algebra and calculus.</blockquote>
<p>In upcoming installments, we will examine Transformer attention heads and self-supervised pretraining.</p>`,
      excerpt: 'A comprehensive deep dive into the mathematical and intuitive foundations of Neural Networks, from perceptrons to backpropagation.',
      coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80',
      category: 'Artificial Intelligence',
      tags: ['#AI', '#DeepLearning', '#NeuralNetworks', '#MachineLearning'],
      author: utkarsh._id,
      status: 'published',
      views: 1245,
      likes: [rahul._id, priya._id, aman._id],
    });

    const post2 = new Post({
      title: 'Building Resilient Full-Stack Apps with React 19 and Node.js',
      content: `<h2>The Modern Full-Stack Frontier</h2>
<p>The web ecosystem in 2026 demands lightning-fast interactions, seamless hydration, and robust backend APIs. Combining React 19 with Express and MongoDB provides unparalleled velocity and modular architecture.</p>
<h3>Key Architectural Pillars</h3>
<ul>
  <li><strong>Component Modularity:</strong> Decoupled presenter components and hooks.</li>
  <li><strong>Optimistic UI Updates:</strong> Immediate visual feedback for actions like liking and bookmarking.</li>
  <li><strong>Secure Authentication:</strong> Stateless JWT authentication combined with bcrypt salted password hashing.</li>
</ul>
<h3>Performance Best Practices</h3>
<p>Always implement clean indexing on high-cardinality MongoDB fields, leverage Vite code splitting, and protect backend endpoints with rate limiting and Helmet headers.</p>`,
      excerpt: 'Learn how to architect clean, scalable, and secure full-stack applications with React 19, Express REST APIs, and MongoDB.',
      coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&auto=format&fit=crop&q=80',
      category: 'Web Development',
      tags: ['#React', '#NodeJS', '#WebDevelopment', '#JavaScript'],
      author: priya._id,
      status: 'published',
      views: 890,
      likes: [utkarsh._id, rahul._id],
    });

    const post3 = new Post({
      title: 'Zero Trust Architecture: The Modern Paradigm of Cybersecurity',
      content: `<h2>Never Trust, Always Verify</h2>
<p>The traditional perimeter security model ("castle and moat") is obsolete in today's remote-first, multi-cloud reality. Zero Trust enforces strict identity verification at every transaction level.</p>
<h3>Core Principles of Zero Trust:</h3>
<ol>
  <li><strong>Explicit Verification:</strong> Authenticate and authorize based on all available data points.</li>
  <li><strong>Least Privilege Access:</strong> Limit user access with Just-In-Time (JIT) and Just-Enough-Access (JEA).</li>
  <li><strong>Assume Breach:</strong> Minimize blast radius by segmenting access and inspecting end-to-end encryption.</li>
</ol>`,
      excerpt: 'An insider guide to Zero Trust architecture, defense-in-depth principles, and cloud workload security.',
      coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
      category: 'Cybersecurity',
      tags: ['#Cybersecurity', '#DevSecOps', '#ZeroTrust'],
      author: aman._id,
      status: 'published',
      views: 640,
      likes: [rahul._id, utkarsh._id],
    });

    const post4 = new Post({
      title: 'From Python Scripts to Scalable Machine Learning Pipelines',
      content: `<h2>Bridging Experimentation and Production</h2>
<p>Data science notebooks are fantastic for initial EDA, but translating exploratory models into production-ready inference microservices requires structured software engineering rigor.</p>
<p>We explore data versioning, containerized workflows, and monitoring drift in production embeddings.</p>`,
      excerpt: 'Transform your exploratory Python Jupyter notebooks into production-ready, reproducible ML pipelines.',
      coverImage: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200&auto=format&fit=crop&q=80',
      category: 'Data Science',
      tags: ['#Python', '#DataScience', '#MachineLearning'],
      author: utkarsh._id,
      status: 'published',
      views: 420,
      likes: [priya._id],
    });

    // Draft post
    const postDraft = new Post({
      title: 'Draft: Getting Started with Distributed Vector Databases',
      content: `<p>Vector databases index high-dimensional embeddings for retrieval augmented generation (RAG). In this draft, we compare HNSW graphs with IVFFlat indexing algorithms...</p>`,
      excerpt: 'A preview exploration of vector embeddings and cosine similarity indexing.',
      coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
      category: 'Technology',
      tags: ['#Technology', '#AI', '#VectorDB'],
      author: rahul._id,
      status: 'draft',
      views: 0,
      likes: [],
    });

    await post1.save();
    await post2.save();
    await post3.save();
    await post4.save();
    await postDraft.save();

    console.log('✅ Posts seeded.');

    // 3. Create Comments & Nested Replies
    const comment1 = await Comment.create({
      post: post1._id,
      author: rahul._id,
      content: 'Great explanation! The visual explanation of gradient descent and activation functions really made it click.',
      likes: [utkarsh._id, priya._id],
    });

    const reply1 = await Comment.create({
      post: post1._id,
      author: utkarsh._id,
      content: 'Thanks Rahul! Glad it helped. I am working on the Transformers and Attention article next!',
      parentComment: comment1._id,
      likes: [rahul._id],
    });

    const reply2 = await Comment.create({
      post: post1._id,
      author: aman._id,
      content: 'I had the same doubt regarding vanishing gradients, now completely clear. Looking forward to part 2!',
      parentComment: comment1._id,
      likes: [],
    });

    const comment2 = await Comment.create({
      post: post2._id,
      author: utkarsh._id,
      content: 'Fantastic overview of React 19 architecture, Priya. Clean component structure!',
      likes: [priya._id],
    });

    // Update comment counts on posts
    post1.commentsCount = 3;
    post1.updateTrendingScore();
    await post1.save();

    post2.commentsCount = 1;
    post2.updateTrendingScore();
    await post2.save();

    // Bookmarks
    rahul.bookmarks.push(post1._id, post2._id);
    utkarsh.bookmarks.push(post3._id);
    priya.bookmarks.push(post1._id);
    await rahul.save();
    await utkarsh.save();
    await priya.save();

    // 4. Notifications
    await Notification.create([
      {
        recipient: utkarsh._id,
        sender: rahul._id,
        type: 'like',
        post: post1._id,
        isRead: false,
      },
      {
        recipient: utkarsh._id,
        sender: rahul._id,
        type: 'comment',
        post: post1._id,
        comment: comment1._id,
        isRead: false,
      },
      {
        recipient: utkarsh._id,
        sender: priya._id,
        type: 'follow',
        isRead: true,
      },
      {
        recipient: rahul._id,
        sender: utkarsh._id,
        type: 'reply',
        post: post1._id,
        comment: reply1._id,
        isRead: false,
      },
    ]);

    console.log('✅ Seed completed successfully!');
    console.log(`
      Test Accounts:
      ------------------------------------------
      Admin:  rahul@blog.dev   / password123 (username: rahul)
      Author: utkarsh@blog.dev / password123 (username: utkarsh)
      Author: priya@blog.dev   / password123 (username: priya)
      Author: aman@blog.dev    / password123 (username: aman)
      ------------------------------------------
    `);

    return true;
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    throw err;
  }
};

// If run directly from CLI
if (process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(async () => {
      await closeDB();
      process.exit(0);
    })
    .catch(async () => {
      await closeDB();
      process.exit(1);
    });
}
