import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import 'react-circular-progressbar/dist/styles.css';
import { pathService, authService } from '../services/api';
import {
  AddDayModal,
  AddTaskModal,
  AddResourceModal,
  EditDayModal,
  EditTaskModal
} from '../components/modals/PathModals';

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

function DayControls({ onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
        
        {showMenu && (
          <div 
            className="absolute right-0 mt-1 w-48 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(e);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Day
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(e);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Day
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function PathDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [showResources, setShowResources] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingDay, setEditingDay] = useState(null);
  const [showAddDay, setShowAddDay] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddResource, setShowAddResource] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchPath();
  }, [id]);

  const fetchPath = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching path with ID:', id);
      const data = await pathService.getPath(id);
      console.log('Fetched path data:', data);
      if (!data) {
        setError('Path not found');
        return;
      }
      setPath(data);
      // Reset selected day if it's out of bounds
      if (data.days && data.days.length > 0) {
        setSelectedDay(prev => prev >= data.days.length ? 0 : prev);
      }
    } catch (error) {
      console.error('Failed to fetch path:', error);
      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError(error.response?.data?.message || 'Failed to load learning path');
      toast.error(error.response?.data?.message || 'Failed to load learning path');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (dayIndex, taskId) => {
    try {
      const task = path.days[dayIndex].tasks.find(t => t._id === taskId);
      if (!task) {
        console.error('Task not found:', { dayIndex, taskId });
        return;
      }

      console.log('Toggling task completion:', { dayIndex, taskId, currentStatus: task.completed });
      const updatedPath = await pathService.updateTaskCompletion(id, dayIndex, taskId, !task.completed);
      console.log('Updated path:', updatedPath);
      setPath(updatedPath);
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
      toast.error('Failed to update task status');
    }
  };

  const calculateProgress = (dayIndex) => {
    if (!path) return 0;
    
    if (typeof dayIndex === 'number') {
      const day = path.days[dayIndex];
      if (!day || !day.tasks.length) return 0;
      return Math.round((day.tasks.filter(task => task.completed).length / day.tasks.length) * 100);
    }

    let totalTasks = 0;
    let completedTasks = 0;
    path.days.forEach(day => {
      totalTasks += day.tasks.length;
      completedTasks += day.tasks.filter(task => task.completed).length;
    });
    return Math.round((completedTasks / totalTasks) * 100);
  };

  const handleUpdatePath = async (updatedData) => {
    try {
      const updatedPath = await pathService.updatePath(id, updatedData);
      setPath(updatedPath);
      setIsEditing(false);
      setEditingTask(null);
      setEditingDay(null);
    } catch (error) {
      console.error('Failed to update path:', error);
      alert('Failed to update path');
    }
  };

  const handleAddDay = async (dayData) => {
    try {
      const updatedPath = {
        ...path,
        days: [...path.days, {
          day: path.days.filter(d => !d.isBreak).length + 1,
          title: dayData.title,
          description: dayData.description,
          tasks: []
        }]
      };
      await handleUpdatePath(updatedPath);
      setShowAddDay(false);
    } catch (error) {
      console.error('Failed to add day:', error);
      alert('Failed to add day');
    }
  };

  const handleDeleteDay = async (dayIndex) => {
    if (!window.confirm('Are you sure you want to delete this day?')) return;
    
    try {
      const updatedDays = path.days.filter((_, index) => index !== dayIndex)
        .map((day, index) => ({ ...day, day: index + 1 }));
      
      await handleUpdatePath({ ...path, days: updatedDays });
      if (selectedDay >= updatedDays.length) {
        setSelectedDay(Math.max(0, updatedDays.length - 1));
      }
    } catch (error) {
      console.error('Failed to delete day:', error);
      alert('Failed to delete day');
    }
  };

  const handleAddTask = async (dayIndex, taskData) => {
    try {
      const updatedDays = [...path.days];
      updatedDays[dayIndex].tasks.push({
        title: taskData.title,
        description: taskData.description,
        completed: false
      });
      
      await handleUpdatePath({ ...path, days: updatedDays });
      setShowAddTask(false);
    } catch (error) {
      console.error('Failed to add task:', error);
      alert('Failed to add task');
    }
  };

  const handleDeleteTask = async (dayIndex, taskIndex) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const updatedDays = [...path.days];
      updatedDays[dayIndex].tasks.splice(taskIndex, 1);
      await handleUpdatePath({ ...path, days: updatedDays });
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task');
    }
  };

  const handleAddResource = async (resource, type = 'path') => {
    try {
      let updatedPath = { ...path };
      
      if (type === 'path') {
        updatedPath.resources = [...(path.resources || []), resource];
      } else if (type === 'day') {
        updatedPath.days[selectedDay].resources = [
          ...(path.days[selectedDay].resources || []),
          resource
        ];
      } else if (type === 'task') {
        const [dayIndex, taskIndex] = type.split('-')[1].split('.');
        updatedPath.days[dayIndex].tasks[taskIndex].resources = [
          ...(path.days[dayIndex].tasks[taskIndex].resources || []),
          resource
        ];
      }
      
      await handleUpdatePath(updatedPath);
      setShowAddResource(false);
    } catch (error) {
      console.error('Failed to add resource:', error);
      alert('Failed to add resource');
    }
  };

  const handleDeleteResource = async (resourceIndex, type = 'path') => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      let updatedPath = { ...path };
      
      if (type === 'path') {
        updatedPath.resources = path.resources.filter((_, index) => index !== resourceIndex);
      } else if (type === 'day') {
        updatedPath.days[selectedDay].resources = path.days[selectedDay].resources
          .filter((_, index) => index !== resourceIndex);
      } else if (type === 'task') {
        const [dayIndex, taskIndex] = type.split('-')[1].split('.');
        updatedPath.days[dayIndex].tasks[taskIndex].resources = 
          path.days[dayIndex].tasks[taskIndex].resources
            .filter((_, index) => index !== resourceIndex);
      }
      
      await handleUpdatePath(updatedPath);
    } catch (error) {
      console.error('Failed to delete resource:', error);
      alert('Failed to delete resource');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-ping"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading your journey...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full p-8 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6">
            <svg className="w-full h-full text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Error Loading Path</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard')}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg transition-all"
          >
            Return to Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!path || !path.days || path.days.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full p-8 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6">
            <svg className="w-full h-full text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Path Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">This learning path seems to be missing or has been removed.</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard')}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg transition-all"
          >
            Return to Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      {...pageTransition}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard')}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </motion.button>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    {path.title}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-gray-700 px-4 py-2 rounded-xl shadow-sm">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Overall Progress
                  </span>
                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-blue-500 to-indigo-600"
                      style={{ width: `${calculateProgress()}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {calculateProgress()}%
                  </span>
                </div>
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className="p-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </motion.button>
                  {showAddMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <button
                        onClick={() => {
                          setShowAddDay(true);
                          setShowAddMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                      >
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Add Day
                      </button>
                      <button
                        onClick={() => {
                          setShowAddTask(true);
                          setShowAddMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                      >
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Add Task
                      </button>
                      <button
                        onClick={() => {
                          setShowAddResource(true);
                          setShowAddMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                      >
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Add Resource
                      </button>
                    </div>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowResources(!showResources)}
                  className={`p-2 rounded-xl transition-colors shadow-sm ${
                    showResources 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.button>
              </div>
            </div>
            {/* Mobile Progress Bar */}
            <div className="sm:hidden px-4 py-2 flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Progress</span>
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-blue-500 to-indigo-600"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {calculateProgress()}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Timeline */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-28">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    Learning Journey
                  </h2>
                </div>
                <div className="relative">
                  <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white dark:from-gray-800 to-transparent z-10"/>
                  <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-white dark:from-gray-800 to-transparent z-10"/>
                  <div className="max-h-[40vh] lg:max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
                    <div className="p-4 space-y-3">
                      {path.days.map((day, index) => (
                        <div key={index} className="relative group">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedDay(index)}
                            className={`w-full p-4 rounded-2xl transition-all ${
                              selectedDay === index
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                calculateProgress(index) === 100
                                  ? 'bg-green-500 text-white'
                                  : selectedDay === index
                                  ? 'bg-white text-blue-600'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600'
                              }`}>
                                {calculateProgress(index) === 100 ? (
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <span className="text-sm font-semibold">{day.day}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-base truncate">
                                  {day.title}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all ${
                                        calculateProgress(index) === 100
                                          ? 'bg-green-500'
                                          : selectedDay === index
                                          ? 'bg-white'
                                          : 'bg-blue-500'
                                      }`}
                                      style={{ 
                                        width: `${calculateProgress(index)}%`,
                                        boxShadow: calculateProgress(index) > 0 ? '0 0 8px rgba(59, 130, 246, 0.5)' : 'none'
                                      }}
                                    />
                                  </div>
                                  <span className={`text-xs font-medium ${
                                    calculateProgress(index) === 100
                                      ? 'text-green-500 dark:text-green-400'
                                      : selectedDay === index
                                      ? 'text-white'
                                      : 'text-gray-500 dark:text-gray-400'
                                  }`}>
                                    {calculateProgress(index)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.button>
                          <DayControls
                            onEdit={(e) => {
                              e.stopPropagation();
                              setEditingDay(day);
                            }}
                            onDelete={(e) => {
                              e.stopPropagation();
                              handleDeleteDay(index);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="lg:col-span-9 space-y-6">
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddTask(true)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Add Task
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white break-words">
                    Day {path.days[selectedDay].day}: {path.days[selectedDay].title}
                  </h2>
                  {path.days[selectedDay].description && (
                    <p className="mt-2 text-gray-600 dark:text-gray-400 break-words">
                      {path.days[selectedDay].description}
                    </p>
                  )}
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {path.days[selectedDay].tasks.map((task, index) => (
                      <div key={index} className="relative group">
                        <div 
                          className={`p-4 rounded-xl border-2 transition-all ${
                            task.completed
                              ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <button
                                onClick={() => handleTaskToggle(selectedDay, task._id)}
                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                                  task.completed
                                    ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
                                }`}
                              >
                                {task.completed && (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-lg font-medium break-words ${
                                task.completed
                                  ? 'text-green-800 dark:text-green-200 line-through opacity-75'
                                  : 'text-gray-800 dark:text-white'
                              }`}>
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className={`mt-1 text-sm break-words ${
                                  task.completed
                                    ? 'text-green-600 dark:text-green-300 line-through opacity-75'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                  {task.description}
                                </p>
                              )}
                              {task.resources && task.resources.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Resources:</div>
                                  {task.resources.map((resource, resourceIndex) => (
                                    <a
                                      key={resourceIndex}
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                      {resource.title}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingTask(task)}
                            className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteTask(selectedDay, index)}
                            className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!path.days[selectedDay].tasks || path.days[selectedDay].tasks.length === 0) && (
                      <div className="text-center py-8">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="text-gray-600 dark:text-gray-400">No tasks available yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Resources Panel */}
            <AnimatePresence>
              {showResources && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Learning Resources</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      AI-curated resources to help you master {path.title}
                    </p>
                  </div>
                  <div className="p-6">
                    {/* Path Resources */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {path.resources?.map((resource, index) => (
                        <ResourceCard key={`path-${index}`} resource={resource} />
                      ))}
                    </div>

                    {/* Daily Resources */}
                    {path.days[selectedDay].resources && path.days[selectedDay].resources.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                          Day {path.days[selectedDay].day} Resources
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {path.days[selectedDay].resources.map((resource, index) => (
                            <ResourceCard key={`day-${index}`} resource={resource} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Task Resources */}
                    {path.days[selectedDay].tasks.map((task, taskIndex) => (
                      task.resources && task.resources.length > 0 && (
                        <div key={`task-${taskIndex}`} className="mt-8">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Resources for: {task.title}
                          </h3>
                          <div className="grid gap-4 sm:grid-cols-2">
                            {task.resources.map((resource, index) => (
                              <ResourceCard key={`task-${taskIndex}-${index}`} resource={resource} />
                            ))}
                          </div>
                        </div>
                      )
                    ))}

                    {(!path.resources || path.resources.length === 0) && 
                     (!path.days[selectedDay].resources || path.days[selectedDay].resources.length === 0) &&
                     !path.days[selectedDay].tasks.some(task => task.resources && task.resources.length > 0) && (
                      <div className="col-span-full text-center py-8">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="text-gray-600 dark:text-gray-400">No resources available yet</p>
                        <button
                          onClick={() => setShowAddResource(true)}
                          className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Add Learning Resources
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddDay && (
          <AddDayModal
            onClose={() => setShowAddDay(false)}
            onSubmit={handleAddDay}
          />
        )}
        {showAddTask && (
          <AddTaskModal
            onClose={() => setShowAddTask(false)}
            onSubmit={(taskData) => handleAddTask(selectedDay, taskData)}
          />
        )}
        {showAddResource && (
          <AddResourceModal
            onClose={() => setShowAddResource(false)}
            onSubmit={handleAddResource}
          />
        )}
        {editingDay && (
          <EditDayModal
            day={editingDay}
            onClose={() => setEditingDay(null)}
            onSubmit={(dayData) => {
              const dayIndex = path.days.findIndex(d => d.day === editingDay.day);
              const updatedDays = [...path.days];
              updatedDays[dayIndex] = { ...updatedDays[dayIndex], ...dayData };
              handleUpdatePath({ ...path, days: updatedDays });
            }}
          />
        )}
        {editingTask && (
          <EditTaskModal
            task={editingTask}
            onClose={() => setEditingTask(null)}
            onSubmit={(taskData) => {
              const taskIndex = path.days[selectedDay].tasks.findIndex(t => t._id === editingTask._id);
              const updatedDays = [...path.days];
              updatedDays[selectedDay].tasks[taskIndex] = { ...updatedDays[selectedDay].tasks[taskIndex], ...taskData };
              handleUpdatePath({ ...path, days: updatedDays });
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ResourceCard({ resource }) {
  const getResourceIcon = () => {
    switch (resource.type) {
      case 'video':
        return (
          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23 12l-22 12v-24l22 12zm-21 10.315l18.912-10.315-18.912-10.315v20.63z" />
          </svg>
        );
      case 'book':
        return (
          <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23 5v13.883l-1 .117v-16c-3.895.119-7.505.762-10.002 2.316-2.496-1.554-6.102-2.197-9.998-2.316v16l-1-.117v-13.883h-1v15h9.057c1.479 0 1.641 1 2.941 1 1.304 0 1.461-1 2.942-1h9.06v-15h-1zm-12 13.645c-1.946-.772-4.137-1.269-7-1.484v-12.051c2.352.197 4.996.675 7 1.922v11.613zm9-1.484c-2.863.215-5.054.712-7 1.484v-11.613c2.004-1.247 4.648-1.725 7-1.922v12.051z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.246 17c-.927 3.701-2.547 6-3.246 7-.699-1-2.32-3.298-3.246-7h6.492zm7.664 0c-1.558 3.391-4.65 5.933-8.386 6.733 1.315-2.068 2.242-4.362 2.777-6.733h5.609zm-21.82 0h5.609c.539 2.386 1.47 4.678 2.777 6.733-3.736-.8-6.828-3.342-8.386-6.733zm14.55-2h-7.28c-.29-1.985-.29-4.014 0-6h7.281c.288 1.986.288 4.015-.001 6zm-9.299 0h-5.962c-.248-.958-.379-1.964-.379-3s.131-2.041.379-3h5.962c-.263 1.988-.263 4.012 0 6zm17.28 0h-5.963c.265-1.988.265-4.012.001-6h5.962c.247.959.379 1.964.379 3s-.132 2.042-.379 3zm-8.375-8h-6.492c.925-3.702 2.546-6 3.246-7 1.194 1.708 2.444 3.799 3.246 7h-6.492z" />
          </svg>
        );
    }
  };

  return (
    <motion.a
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          {getResourceIcon()}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1">
            {resource.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {resource.description}
          </p>
        </div>
      </div>
    </motion.a>
  );
}
 