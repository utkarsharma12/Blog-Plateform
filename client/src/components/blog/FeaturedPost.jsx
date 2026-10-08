import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Clock, Heart, Eye, ArrowRight } from 'lucide-react';

export const FeaturedPost = ({ post }) => {
  if (!post) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-xl mb-12">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 relative z-10">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              Featured Story
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {post.category}
            </span>
          </div>

          <Link to={`/blog/${post.slug || post._id}`}>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight hover:text-indigo-300 transition-colors leading-tight">
              {post.title}
            </h1>
          </Link>

          <p className="text-slate-300 text-sm sm:text-base line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
            <Link
              to={`/profile/${post.author?.username}`}
              className="flex items-center gap-3 group"
            >
              <img
                src={post.author?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${post.author?.name || 'Author'}`}
                alt={post.author?.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-400/50"
              />
              <div>
                <p className="text-sm font-semibold group-hover:text-indigo-300 transition-colors">
                  {post.author?.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime || 1} min read
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {post.views || 0} views
                  </span>
                </div>
              </div>
            </Link>

            <Link
              to={`/blog/${post.slug || post._id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-900 font-semibold text-sm hover:bg-indigo-50 hover:scale-105 transition-all shadow-lg"
            >
              Read Article
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {post.coverImage && (
          <div className="lg:col-span-5">
            <Link to={`/blog/${post.slug || post._id}`} className="block overflow-hidden rounded-2xl aspect-[16/10] shadow-2xl group">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
