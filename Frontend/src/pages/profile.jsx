import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Camera, Briefcase, Link2, Twitter, Github, 
  Linkedin, Edit2, Calendar, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authService, updateProfile } from '../services/api';
import { motion } from 'framer-motion';

export function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    location: '',
    bio: '',
    avatar: '',
    company: '',
    website: '',
    social: {
      twitter: '',
      github: '',
      linkedin: ''
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      const formattedData = {
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || '',
        phone: userData.phone || '',
        location: userData.location || '',
        bio: userData.bio || '',
        avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
        company: userData.company || '',
        website: userData.website || '',
        social: {
          twitter: userData.social?.twitter || '',
          github: userData.social?.github || '',
          linkedin: userData.social?.linkedin || ''
        }
      };
      setProfile(formattedData);
      setEditForm(formattedData);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const updatedUser = await updateProfile(editForm);
      setProfile(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-600">
            {/* Edit Button */}
            <div className="absolute top-4 right-4">
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="p-2 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-white text-blue-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit Profile
                </button>
              )}
            </div>
            
            {/* Profile Image */}
            <div className="absolute -bottom-12 left-8">
              <div className="relative">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 object-cover shadow-lg"
                />
                {isEditing && (
                  <label className="absolute -bottom-2 -right-2 p-2 bg-blue-600 rounded-xl text-white cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditForm(prev => ({ ...prev, avatar: reader.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-16 pb-8 px-8">
            {/* Basic Info */}
            <div className="space-y-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="text-2xl font-bold bg-transparent border-b-2 border-gray-200 dark:border-gray-700 
                    focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white w-full"
                  placeholder="Your name"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.name}
                </h1>
              )}
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.role}
                  onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                  className="text-gray-500 dark:text-gray-400 bg-transparent border-b border-gray-200 dark:border-gray-700 
                    focus:border-blue-500 focus:outline-none w-full"
                  placeholder="Your role"
                />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">{profile.role}</p>
              )}
            </div>

            {/* Contact Info */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="text-gray-400" size={20} />
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="flex-1 bg-transparent border-b border-gray-200 dark:border-gray-700 
                        focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                      placeholder="Your email"
                    />
                  ) : (
                    <span className="text-gray-900 dark:text-white">{profile.email}</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="text-gray-400" size={20} />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="flex-1 bg-transparent border-b border-gray-200 dark:border-gray-700 
                        focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                      placeholder="Your phone"
                    />
                  ) : (
                    <span className="text-gray-900 dark:text-white">{profile.phone || 'Add phone number'}</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="text-gray-400" size={20} />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                      className="flex-1 bg-transparent border-b border-gray-200 dark:border-gray-700 
                        focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                      placeholder="Your location"
                    />
                  ) : (
                    <span className="text-gray-900 dark:text-white">{profile.location || 'Add location'}</span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="text-gray-400" size={20} />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.company}
                      onChange={(e) => setEditForm(prev => ({ ...prev, company: e.target.value }))}
                      className="flex-1 bg-transparent border-b border-gray-200 dark:border-gray-700 
                        focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                      placeholder="Your company"
                    />
                  ) : (
                    <span className="text-gray-900 dark:text-white">{profile.company || 'Add company'}</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Link2 className="text-gray-400" size={20} />
                  {isEditing ? (
                    <input
                      type="url"
                      value={editForm.website}
                      onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                      className="flex-1 bg-transparent border-b border-gray-200 dark:border-gray-700 
                        focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                      placeholder="Your website"
                    />
                  ) : (
                    <span className="text-gray-900 dark:text-white">{profile.website || 'Add website'}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bio</h3>
              {isEditing ? (
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700 
                    p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Write something about yourself..."
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {profile.bio || 'Add a bio to tell people more about yourself.'}
                </p>
              )}
            </div>

            {/* Social Links */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Social Links</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Twitter className="text-gray-400" size={20} />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.social.twitter}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        social: { ...prev.social, twitter: e.target.value }
                      }))}
                      className="flex-1 bg-transparent border-b border-gray-200 dark:border-gray-700 
                        focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                      placeholder="Twitter profile"
                    />
                  ) : (
                    <a
                      href={`https://twitter.com/${profile.social.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {profile.social.twitter || 'Add Twitter profile'}
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Github className="text-gray-400" size={20} />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.social.github}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        social: { ...prev.social, github: e.target.value }
                      }))}
                      className="flex-1 bg-transparent border-b border-gray-200 dark:border-gray-700 
                        focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                      placeholder="GitHub profile"
                    />
                  ) : (
                    <a
                      href={`https://github.com/${profile.social.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {profile.social.github || 'Add GitHub profile'}
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Linkedin className="text-gray-400" size={20} />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.social.linkedin}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        social: { ...prev.social, linkedin: e.target.value }
                      }))}
                      className="flex-1 bg-transparent border-b border-gray-200 dark:border-gray-700 
                        focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                      placeholder="LinkedIn profile"
                    />
                  ) : (
                    <a
                      href={`https://linkedin.com/in/${profile.social.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {profile.social.linkedin || 'Add LinkedIn profile'}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 