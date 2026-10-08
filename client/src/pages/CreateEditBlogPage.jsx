import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postApi } from '../api/postApi';
import { uploadApi } from '../api/uploadApi';
import { RichEditor } from '../components/blog/RichEditor';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  Upload,
  Image as ImageIcon,
  X,
  Send,
  FileText,
  Tag,
  FolderOpen,
  ArrowLeft,
} from 'lucide-react';

const CATEGORIES = [
  'Technology',
  'Artificial Intelligence',
  'Programming',
  'Web Development',
  'Data Science',
  'Cybersecurity',
  'Gaming',
  'Education',
];

export const CreateEditBlogPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Technology');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const fetchPostData = async () => {
        try {
          const res = await postApi.getPost(id);
          const p = res.post;
          setTitle(p.title);
          setContent(p.content);
          setCategory(p.category);
          setTags(p.tags || []);
          setCoverImage(p.coverImage || '');
        } catch (err) {
          toast.error('Failed to load post for editing.');
          navigate('/');
        } finally {
          setLoading(false);
        }
      };
      fetchPostData();
    }
  }, [id, isEditing, navigate]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (clean && !tags.includes(`#${clean}`)) {
        setTags([...tags, `#${clean}`]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    const toastId = toast.loading('Uploading cover image...');
    try {
      const res = await uploadApi.uploadImage(file);
      setCoverImage(res.url);
      toast.success('Cover image uploaded!', { id: toastId });
    } catch (err) {
      toast.error('Failed to upload image.', { id: toastId });
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (status = 'published') => {
    if (!title.trim()) {
      toast.error('Please enter a post title.');
      return;
    }
    if (!content.trim()) {
      toast.error('Article content cannot be empty.');
      return;
    }

    setSaving(true);
    const toastId = toast.loading(status === 'draft' ? 'Saving draft...' : 'Publishing post...');
    try {
      const postPayload = {
        title,
        content,
        category,
        tags,
        coverImage,
        status,
      };

      if (isEditing) {
        await postApi.updatePost(id, postPayload);
        toast.success(status === 'draft' ? 'Draft saved!' : 'Post updated and published!', { id: toastId });
        navigate(`/blog/${id}`);
      } else {
        const res = await postApi.createPost(postPayload);
        toast.success(status === 'draft' ? 'Draft saved!' : 'Story published to Inkflow!', { id: toastId });
        navigate(`/blog/${res.post.slug || res.post._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save post.', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Loading editor..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit('draft')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            Save as Draft
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit('published')}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {isEditing ? 'Save Changes' : 'Publish Story'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Story Title..."
          className="w-full text-3xl sm:text-4xl font-extrabold bg-transparent text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none border-none p-0"
        />

        {/* Category & Tags Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              <FolderOpen className="w-3.5 h-3.5" />
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              <Tag className="w-3.5 h-3.5" />
              Tags (Press Enter or Comma)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="e.g. AI, React, Tutorial"
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Tags pills */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-rose-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Cover Image Uploader / Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Cover Image
          </label>

          {coverImage ? (
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] max-h-72 border border-slate-200 dark:border-slate-800 mb-3 group">
              <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setCoverImage('')}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                title="Remove cover"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="cursor-pointer flex-1 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors bg-white dark:bg-slate-900">
                <Upload className="w-6 h-6" />
                <span className="text-xs font-semibold">
                  {uploadingCover ? 'Uploading cover...' : 'Upload Cover Image from Computer'}
                </span>
                <span className="text-[10px] text-slate-400">PNG, JPG, WEBP (Max 5MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  disabled={uploadingCover}
                  className="hidden"
                />
              </label>

              <div className="flex-1 flex flex-col justify-center">
                <span className="text-xs text-slate-400 mb-1">Or paste an Image URL:</span>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rich Text Editor */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Story Content
          </label>
          <RichEditor value={content} onChange={setContent} placeholder="Write your full story..." />
        </div>
      </div>
    </div>
  );
};
