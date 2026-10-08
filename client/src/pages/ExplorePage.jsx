import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { postApi } from '../api/postApi';
import { BlogCard } from '../components/blog/BlogCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Search, Filter, SlidersHorizontal, Sparkles, Tag, Folder } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Technology',
  'Artificial Intelligence',
  'Programming',
  'Web Development',
  'Data Science',
  'Cybersecurity',
  'Gaming',
  'Education',
];

export const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [tag, setTag] = useState(searchParams.get('tag') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest');

  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [popularTags, setPopularTags] = useState([]);

  // Fetch categories & tags metadata
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await postApi.getCategoriesAndTags();
        setPopularTags(res.tags || []);
      } catch (err) {
        console.error('Failed to load tags:', err);
      }
    };
    fetchMeta();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = {
        search: search.trim() || undefined,
        category: category !== 'All' ? category : undefined,
        tag: tag.trim() || undefined,
        sort,
      };

      const res = await postApi.getPosts(params);
      setPosts(res.posts || []);
      setTotalPosts(res.totalPosts || 0);
    } catch (err) {
      console.error('Failed to load explore results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [searchParams, category, tag, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (search.trim()) newParams.set('search', search.trim());
    else newParams.delete('search');
    setSearchParams(newParams);
    fetchResults();
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat !== 'All') newParams.set('category', cat);
    else newParams.delete('category');
    setSearchParams(newParams);
  };

  const handleTagClick = (t) => {
    const selected = tag === t ? '' : t;
    setTag(selected);
    const newParams = new URLSearchParams(searchParams);
    if (selected) newParams.set('tag', selected.replace('#', ''));
    else newParams.delete('tag');
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-10 space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Explore Stories & Topics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Discover cutting-edge engineering articles, AI architectures, web tutorials, and in-depth thoughts.
        </p>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto pt-2">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by keywords, titles, tags..."
            className="w-full pl-12 pr-28 py-3 text-sm rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-3.5 px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter and Sort Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-10 space-y-6">
        {/* Categories Bar */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Filter by Category
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
                  category.toLowerCase() === cat.toLowerCase()
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tags cloud */}
        {popularTags.length > 0 && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Popular Tags
            </span>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((t) => (
                <button
                  key={t.name}
                  onClick={() => handleTagClick(t.name)}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    tag.toLowerCase() === t.name.toLowerCase() || tag.toLowerCase() === t.name.replace('#', '').toLowerCase()
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                  }`}
                >
                  {t.name} <span className="text-[10px] opacity-75">({t.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sort and Count */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="text-slate-500 font-medium">
            Found <span className="font-bold text-slate-900 dark:text-white">{totalPosts}</span> stories
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
            >
              <option value="latest">Latest Published</option>
              <option value="trending">🔥 Trending Algorithm</option>
              <option value="popular">👁 Most Viewed</option>
              <option value="top">❤️ Most Liked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stories Grid */}
      {loading ? (
        <LoadingSpinner text="Searching stories..." />
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3">
          <Search className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            No matching stories found
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing tags, or switching categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard key={post._id} post={post} onPostUpdated={fetchResults} />
          ))}
        </div>
      )}
    </div>
  );
};
