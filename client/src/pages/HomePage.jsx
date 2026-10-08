import React, { useState, useEffect } from 'react';
import { postApi } from '../api/postApi';
import { useAuth } from '../context/AuthContext';
import { BlogCard } from '../components/blog/BlogCard';
import { FeaturedPost } from '../components/blog/FeaturedPost';
import { TrendingSidebar } from '../components/blog/TrendingSidebar';
import { CategoryPills } from '../components/blog/CategoryPills';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Compass, Flame, Users, Sparkles, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('for-you'); // 'for-you', 'following', 'trending'
  const [category, setCategory] = useState('All');
  const [posts, setPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrending = async () => {
    try {
      const res = await postApi.getTrendingPosts(5);
      setTrendingPosts(res.posts || []);
    } catch (err) {
      console.error('Failed to load trending posts:', err);
    }
  };

  const fetchFeedPosts = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'following') {
        res = await postApi.getFollowingFeed();
      } else if (activeTab === 'trending') {
        res = await postApi.getPosts({ sort: 'trending', category: category !== 'All' ? category : undefined });
      } else {
        res = await postApi.getPosts({ sort: 'latest', category: category !== 'All' ? category : undefined });
      }
      setPosts(res.posts || []);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  useEffect(() => {
    fetchFeedPosts();
  }, [activeTab, category]);

  const featured = trendingPosts.length > 0 ? trendingPosts[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Featured Article */}
      {featured && <FeaturedPost post={featured} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Feed Column */}
        <main className="lg:col-span-8 space-y-6">
          {/* Feed Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab('for-you')}
                className={`pb-3 -mb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'for-you'
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Compass className="w-4 h-4" />
                For you
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => setActiveTab('following')}
                  className={`pb-3 -mb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === 'following'
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Following
                </button>
              )}

              <button
                onClick={() => setActiveTab('trending')}
                className={`pb-3 -mb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'trending'
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-500" />
                Trending
              </button>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="pt-2">
            <CategoryPills selectedCategory={category} onSelectCategory={setCategory} />
          </div>

          {/* Articles Feed */}
          {loading ? (
            <LoadingSpinner text="Loading stories..." />
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                No stories found
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {activeTab === 'following'
                  ? "You haven't followed any authors with published stories yet."
                  : 'Be the first to publish a story in this topic!'}
              </p>
              <Link
                to="/write"
                className="inline-block mt-2 px-5 py-2 text-xs font-semibold rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Write an article
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <BlogCard key={post._id} post={post} onPostUpdated={fetchFeedPosts} />
              ))}
            </div>
          )}
        </main>

        {/* Right Sidebar Column */}
        <aside className="lg:col-span-4 space-y-8">
          <TrendingSidebar trendingPosts={trendingPosts} />

          {/* Platform Info / Mission Box */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-slate-900 dark:to-indigo-950/40 p-6 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
              <h4 className="font-bold text-sm">Write on Inkflow</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Share your insights, engineering challenges, machine learning breakthroughs, and code tutorials with a thriving global community.
            </p>
            <Link
              to="/write"
              className="inline-block w-full text-center px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
            >
              Start Writing Now
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};
