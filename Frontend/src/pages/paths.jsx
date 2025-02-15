import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathService } from '../services/api';

export function PathsPage() {
  const navigate = useNavigate();
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPathData, setNewPathData] = useState({
    topic: '',
    duration: '7', // Default 7 days
  });

  useEffect(() => {
    loadPaths();
  }, []);

  const loadPaths = async () => {
    try {
      setLoading(true);
      const data = await pathService.getPaths();
      setPaths(data);
    } catch (err) {
      console.error('Failed to load paths:', err);
      setError(err.response?.data?.message || 'Failed to load learning paths');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAIPath = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await pathService.createPathByAI(newPathData.topic, parseInt(newPathData.duration));
      setPaths([...paths, result]);
      setShowCreateModal(false);
      navigate(`/path/${result._id}`);
    } catch (err) {
      console.error('AI Path Creation Error:', err);
      setError(err.response?.data?.message || 'Failed to create AI learning path');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Learning Paths
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150"
        >
          Create New Path
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : paths.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No learning paths yet. Create one to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paths.map((path) => (
            <div
              key={path._id}
              onClick={() => navigate(`/path/${path._id}`)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow duration-150"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {path.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {path.description}
              </p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-600 dark:text-blue-400">
                  {path.days?.length || 0} days
                </span>
                <span className="text-gray-500 dark:text-gray-500">
                  {new Date(path.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create New Learning Path
            </h2>
            <form onSubmit={handleCreateAIPath} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What would you like to learn?
                </label>
                <textarea
                  value={newPathData.topic}
                  onChange={(e) => setNewPathData({ ...newPathData, topic: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={4}
                  placeholder="Describe what you want to learn (e.g., 'Learn React.js for beginners')"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (days)
                </label>
                <select
                  value={newPathData.duration}
                  onChange={(e) => setNewPathData({ ...newPathData, duration: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="3">3 days</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !newPathData.topic.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  {loading ? 'Creating...' : 'Create Path'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 