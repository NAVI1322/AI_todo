import React, { useState, useEffect } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Link } from 'react-router-dom';
import { pathService, authService } from '../services/api';
import { stripeService } from '../services/stripe';
import { toast } from 'react-hot-toast';

export function DashboardPage() {
  const [learningPaths, setLearningPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePathId, setDeletePathId] = useState(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [pathToDelete, setPathToDelete] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [duration, setDuration] = useState('7');
  const [generating, setGenerating] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [isDraggable, setIsDraggable] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  const fetchLearningPaths = async () => {
    try {
      setLoading(true);
      const paths = await pathService.getPaths();
      setLearningPaths(paths);
    } catch (error) {
      console.error('Failed to fetch learning paths:', error);
      toast.error('Failed to load learning paths');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePath = async () => {
    const user = authService.getCurrentUser();
    if (user?.subscription?.type !== 'premium' && learningPaths.length >= 5) {
      setShowSubscriptionModal(true);
      return;
    }

    if (!aiPrompt.trim()) {
      toast.error('Please enter what you want to learn');
      return;
    }

    // Validate duration
    const numDuration = Number(duration);
    if (!Number.isInteger(numDuration) || numDuration < 1 || numDuration > 30) {
      toast.error('Duration must be a whole number between 1 and 30 days');
      return;
    }

    try {
      setGenerating(true);
      console.log('Creating path with:', { 
        prompt: aiPrompt, 
        duration: numDuration,
        token: localStorage.getItem('token')?.substring(0, 10) + '...'
      });

      const newPath = await pathService.createPathByAI(aiPrompt, numDuration);
      
      setLearningPaths(prev => [...prev, newPath]);
      setShowCreateModal(false);
      setAiPrompt('');
      toast.success('Learning path created successfully!');
    } catch (error) {
      console.error('Failed to create learning path:', error);
      
      // Handle different types of errors
      if (error.response?.data?.reason) {
        // AI-specific error with suggestion
        toast.error(error.response.data.reason);
        if (error.response.data.suggestion) {
          toast((t) => (
            <div>
              <p className="font-medium">Try asking about:</p>
              <p className="text-blue-500 mt-1">{error.response.data.suggestion}</p>
            </div>
          ), {
            duration: 5000
          });
        }
      } else if (error.response?.data?.message) {
        // Server validation error
        toast.error(error.response.data.message);
      } else if (error.response?.status === 401) {
        // Authentication error
        toast.error('Please log in again to continue');
        authService.logout();
        window.location.href = '/login';
      } else if (error.response?.status === 400) {
        // Bad request error
        const errorMessage = error.response.data?.message || 'Invalid request. Please check your input and try again.';
        toast.error(errorMessage);
      } else if (error.message) {
        // Error with specific message
        toast.error(error.message);
      } else {
        // Generic error
        toast.error('Failed to create learning path. Please try again.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteClick = (path, e) => {
    e.preventDefault();
    e.stopPropagation();
    setPathToDelete(path);
    setDeletePathId(path._id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pathToDelete || deleteConfirmName !== pathToDelete.title) {
      toast.error('Please enter the correct path name to delete');
      return;
    }

    try {
      await pathService.deletePath(deletePathId);
      setLearningPaths(prev => prev.filter(path => path._id !== deletePathId));
      toast.success('Learning path deleted successfully');
      setShowDeleteModal(false);
      setDeleteConfirmName('');
      setPathToDelete(null);
    } catch (error) {
      console.error('Failed to delete learning path:', error);
      toast.error('Failed to delete learning path');
    }
  };

  const handleTaskToggle = async (pathId, dayIndex, taskId) => {
    try {
      // First update the local state optimistically
      setLearningPaths(paths => {
        return paths.map(path => {
          if (path._id !== pathId) return path;
          
          const updatedDays = path.days.map((day, idx) => {
            if (idx !== dayIndex) return day;
            
            const updatedTasks = day.tasks.map(task => 
              task._id === taskId ? { ...task, completed: !task.completed } : task
            );
            
            return { ...day, tasks: updatedTasks };
          });

          return { ...path, days: updatedDays };
        });
      });

      // Then make the API call
      const currentPath = learningPaths.find(p => p._id === pathId);
      const currentTask = currentPath?.days[dayIndex]?.tasks.find(t => t._id === taskId);
      
      const updatedPath = await pathService.updateTaskCompletion(
        pathId,
        dayIndex,
        taskId,
        !currentTask?.completed
      );

      // Update the entire path with the response from the server
      setLearningPaths(paths => 
        paths.map(path => path._id === pathId ? updatedPath : path)
      );

    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
      // Revert the optimistic update on error
      fetchLearningPaths();
    }
  };

  const calculateProgress = (path) => {
    if (!path?.days || path.days.length === 0) return 0;
    
    const totalTasks = path.days.reduce((acc, day) => 
      acc + (day.tasks?.length || 0), 0
    );
    
    if (totalTasks === 0) return 0;
    
    const completedTasks = path.days.reduce((acc, day) => 
      acc + (day.tasks?.filter(task => task.completed)?.length || 0), 0
    );
    
    return Math.round((completedTasks / totalTasks) * 100);
  };

  const handleMouseDown = (e, path) => {
    // Store the element reference
    const cardElement = e.currentTarget;
    let isLongPress = false;

    const holdTimer = setTimeout(() => {
      isLongPress = true;
      setIsDraggable(true);
      if (cardElement && !cardElement.hasAttribute('draggable')) {
        cardElement.setAttribute('draggable', 'true');
      }
    }, 200);

    const cleanup = () => {
      clearTimeout(holdTimer);
      if (isLongPress) {
        setIsDraggable(false);
        const elements = document.querySelectorAll('.path-card');
        elements.forEach(el => {
          if (el.hasAttribute('draggable')) {
            el.setAttribute('draggable', 'false');
          }
        });
      }
    };

    // Handle mouse up
    const handleMouseUp = () => {
      cleanup();
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
    };

    // Add event listeners
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseUp);
  };

  const handleDragStart = (e, path) => {
    if (!isDraggable) {
      e.preventDefault();
      return;
    }
    setDraggedItem(path);
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '0.8';
      e.currentTarget.classList.add('scale-102', 'z-50');
    }
    
    try {
      // Set drag image offset
      const dragImage = e.currentTarget.cloneNode(true);
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 20, 20);
      setTimeout(() => {
        if (dragImage.parentNode) {
          dragImage.parentNode.removeChild(dragImage);
        }
      }, 0);
    } catch (error) {
      console.error('Error setting drag image:', error);
    }
  };

  const handleDragEnd = (e) => {
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '1';
      e.currentTarget.classList.remove('scale-102', 'z-50');
      if (e.currentTarget.hasAttribute('draggable')) {
        e.currentTarget.setAttribute('draggable', 'false');
      }
    }
    setDraggedItem(null);
    setDragOverItem(null);
    setIsDraggable(false);
    
    // Remove all transition classes from cards
    document.querySelectorAll('.path-card').forEach(card => {
      card.classList.remove('translate-x-4', '-translate-x-4', 'translate-y-4', '-translate-y-4');
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    const draggingElement = e.currentTarget;
    const draggedOverId = draggingElement.getAttribute('data-path-id');
    
    if (draggedItem && draggedOverId !== draggedItem._id) {
      setDragOverItem(draggedOverId);
      
      const draggedIdx = learningPaths.findIndex(p => p._id === draggedItem._id);
      const targetIdx = learningPaths.findIndex(p => p._id === draggedOverId);
      
      if (draggedIdx !== -1 && targetIdx !== -1) {
        // Get all cards
        const cards = document.querySelectorAll('.path-card');
        
        // Remove previous translations
        cards.forEach(card => {
          card.classList.remove(
            'translate-x-16', '-translate-x-16',
            'translate-y-16', '-translate-y-16',
            'scale-95', 'scale-105',
            'opacity-50'
          );
        });

        // Calculate if we're moving horizontally or vertically based on grid layout
        const gridCols = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
        const isHorizontalMove = Math.floor(draggedIdx / gridCols) === Math.floor(targetIdx / gridCols);

        // Apply animations based on movement direction
        if (isHorizontalMove) {
          if (draggedIdx < targetIdx) {
            // Moving right - push cards left
            for (let i = draggedIdx + 1; i <= targetIdx; i++) {
              if (cards[i]) {
                cards[i].classList.add('-translate-x-16', 'scale-95');
              }
            }
          } else {
            // Moving left - push cards right
            for (let i = targetIdx; i < draggedIdx; i++) {
              if (cards[i]) {
                cards[i].classList.add('translate-x-16', 'scale-95');
              }
            }
          }
        } else {
          // Vertical movement
          if (draggedIdx < targetIdx) {
            // Moving down - push cards up
            for (let i = draggedIdx + 1; i <= targetIdx; i++) {
              if (cards[i]) {
                cards[i].classList.add('-translate-y-16', 'scale-95');
              }
            }
          } else {
            // Moving up - push cards down
            for (let i = targetIdx; i < draggedIdx; i++) {
              if (cards[i]) {
                cards[i].classList.add('translate-y-16', 'scale-95');
              }
            }
          }
        }

        // Update the paths array
        const newPaths = [...learningPaths];
        const [draggedPath] = newPaths.splice(draggedIdx, 1);
        newPaths.splice(targetIdx, 0, draggedPath);
        setLearningPaths(newPaths);
      }
    }
  };

  const handleDragEnter = (e, pathId) => {
    e.preventDefault();
    if (draggedItem?._id !== pathId) {
      setDragOverItem(pathId);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverItem(null);
  };

  const handleSubscribe = async () => {
    try {
      setShowSubscriptionModal(false);
      // Use a loading toast to show progress
      const loadingToast = toast.loading('Redirecting to checkout...');
      
      // Your price ID from Stripe dashboard
      const PREMIUM_PRICE_ID = import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID;
      await stripeService.createCheckoutSession(PREMIUM_PRICE_ID);
      
      toast.dismiss(loadingToast);
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to start subscription process');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Learning Paths</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
          >
            Create New Path
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {learningPaths.map((path) => (
            <div
              key={path._id}
              draggable={false}
              data-path-id={path._id}
              onMouseDown={(e) => handleMouseDown(e, path)}
              onDragStart={(e) => handleDragStart(e, path)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, path._id)}
              onDragLeave={handleDragLeave}
              className={`path-card group cursor-pointer transform transition-all duration-300 ease-in-out
                ${draggedItem?._id === path._id ? 'opacity-90 scale-105 z-50 shadow-xl rotate-2' : ''}
                ${dragOverItem === path._id ? 'scale-95 rotate-1' : ''}
                ${isDraggable ? 'cursor-move' : 'cursor-pointer'}
                hover:shadow-md`}
            >
              <Link
                to={`/path/${path._id}`}
                className="block relative"
                onClick={(e) => {
                  if (isDraggable) {
                    e.preventDefault();
                  }
                }}
              >
                <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden relative transform transition-transform duration-300
                  ${dragOverItem === path._id ? 'ring-2 ring-indigo-400 ring-opacity-50' : ''}`}>
                  {/* More options button */}
                  <div className="absolute top-2 right-2 z-10">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="peer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                      >
                        <div className="flex flex-col gap-1 items-center">
                          <div className="w-1 h-1 rounded-full bg-gray-600 dark:bg-gray-400"></div>
                          <div className="w-1 h-1 rounded-full bg-gray-600 dark:bg-gray-400"></div>
                          <div className="w-1 h-1 rounded-full bg-gray-600 dark:bg-gray-400"></div>
                        </div>
                      </button>
                      <div className="absolute right-0 mt-1 opacity-0 invisible peer-hover:visible peer-hover:opacity-100 hover:visible hover:opacity-100 transition-all duration-200">
                        <button
                          onClick={(e) => handleDeleteClick(path, e)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sticky note effect - top edge */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-200 via-indigo-300 to-indigo-200 dark:from-indigo-600 dark:via-indigo-500 dark:to-indigo-600"></div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {path.title}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                          {path.description}
                        </p>
                      </div>
                      <div className="w-16 h-16 ml-4">
                        <CircularProgressbar
                          value={calculateProgress(path)}
                          text={`${calculateProgress(path)}%`}
                          styles={{
                            path: {
                              stroke: `rgba(79, 70, 229, ${calculateProgress(path) / 100})`,
                            },
                            text: {
                              fill: document.documentElement.classList.contains('dark') ? '#818cf8' : '#4F46E5',
                              fontSize: '24px',
                            },
                            trail: {
                              stroke: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                            },
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          {path.days?.length || 0} days
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                          {path.difficulty || 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div
                            className="h-2 bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
                            style={{ width: `${calculateProgress(path)}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                        {path.days?.reduce((acc, day) => 
                          acc + (day.tasks?.filter(task => task.completed)?.length || 0), 0
                        )}/{path.days?.reduce((acc, day) => 
                          acc + (day.tasks?.length || 0), 0
                        )} tasks
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Learning Path</h2>
            </div>
            <div className="p-4">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Tell AI what you want to learn and get a personalized learning path
              </p>
              <div className="space-y-4">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., I need a plan to learn Rust programming language"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  rows={4}
                />
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="3">3 days</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
                <button
                  onClick={handleCreatePath}
                  disabled={generating || !aiPrompt.trim()}
                  className="w-full px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? 'Creating...' : 'Create Path'}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Upgrade to Premium
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You've reached the limit of 5 learning paths. Upgrade to premium for unlimited paths and more features!
                </p>
                <div className="bg-indigo-50 dark:bg-indigo-900/50 p-4 rounded-lg mb-6">
                  <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                    Premium Features:
                  </p>
                  <ul className="mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>✓ Unlimited learning paths</li>
                    <li>✓ Advanced AI customization</li>
                    <li>✓ Priority support</li>
                    <li>✓ Exclusive resources</li>
                  </ul>
                </div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">
                  $10/month
                </div>
                <button
                  onClick={handleSubscribe}
                  className="w-full px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors mb-3"
                >
                  Upgrade Now
                </button>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Delete Learning Path
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This action cannot be undone. Please type <span className="font-medium text-red-600 dark:text-red-400">"{pathToDelete?.title}"</span> to confirm.
                </p>
                <input
                  type="text"
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder="Enter path name to confirm"
                  className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={deleteConfirmName !== pathToDelete?.title}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-500 dark:hover:bg-red-600"
                  >
                    Delete Path
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmName('');
                      setPathToDelete(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 