import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Flame, Heart, Eye } from 'lucide-react';

export const TrendingSidebar = ({ trendingPosts = [] }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
          <Flame className="w-5 h-5 fill-amber-500" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Trending Today
          </h3>
          <p className="text-xs text-slate-400">Ranked by likes, views & discussions</p>
        </div>
      </div>

      <div className="space-y-5">
        {trendingPosts.length === 0 ? (
          <p className="text-sm text-slate-400">No trending posts yet.</p>
        ) : (
          trendingPosts.map((post, index) => (
            <div key={post._id} className="flex items-start gap-4 group">
              <span className="text-2xl font-black text-slate-200 dark:text-slate-800 group-hover:text-amber-500 transition-colors font-mono select-none">
                0{index + 1}
              </span>
              <div className="flex-1 space-y-1">
                <Link
                  to={`/profile/${post.author?.username}`}
                  className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <img
                    src={post.author?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${post.author?.name}`}
                    alt={post.author?.name}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span>{post.author?.name}</span>
                </Link>

                <Link to={`/blog/${post.slug || post._id}`}>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2 transition-colors">
                    {post.title}
                  </h4>
                </Link>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-500" />
                    {post.likesCount || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {post.views || 0}
                  </span>
                  <span>{post.category}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Link
          to="/explore?sort=trending"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          View all trending stories →
        </Link>
      </div>
    </div>
  );
};
