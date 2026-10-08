import React, { useState } from 'react';
import { authApi } from '../../api/authApi';
import { uploadApi } from '../../api/uploadApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { X, Upload, Globe } from 'lucide-react';
import { TwitterIcon, GithubIcon, LinkedinIcon } from '../common/SocialIcons';

export const EditProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const { user, updateUserData } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [twitter, setTwitter] = useState(user?.socialLinks?.twitter || '');
  const [github, setGithub] = useState(user?.socialLinks?.github || '');
  const [linkedin, setLinkedin] = useState(user?.socialLinks?.linkedin || '');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  if (!isOpen) return null;

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const toastId = toast.loading('Uploading avatar...');
    try {
      const res = await uploadApi.uploadImage(file);
      setAvatar(res.url);
      toast.success('Avatar uploaded!', { id: toastId });
    } catch (err) {
      toast.error('Failed to upload avatar.', { id: toastId });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authApi.updateProfile({
        name,
        bio,
        website,
        avatar,
        socialLinks: { twitter, github, linkedin },
      });
      updateUserData(res.user);
      toast.success('Profile updated successfully!');
      if (onProfileUpdated) onProfileUpdated(res.user);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Edit Profile
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Preview & Upload */}
          <div className="flex items-center gap-4">
            <img
              src={avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${name || 'User'}`}
              alt="Avatar preview"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/30"
            />
            <div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                {uploadingAvatar ? 'Uploading...' : 'Change Avatar'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, or WEBP up to 5MB</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the world a little about yourself, your role, or what you write about..."
              maxLength={300}
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <p className="text-right text-[11px] text-slate-400">{bio.length}/300</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Website
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourportfolio.com"
                className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Social Links
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-400">
                <TwitterIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="Twitter / X profile URL"
                className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-400">
                <GithubIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="GitHub profile URL"
                className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-400">
                <LinkedinIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="LinkedIn profile URL"
                className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingAvatar}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
