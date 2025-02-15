import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['video', 'book', 'website', 'documentation', 'tutorial', 'article', 'exercise', 'interactive', 'app', 'podcast', 'course', 'practice', 'document'],
    default: 'website'
  }
});

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  description: String,
  resources: [resourceSchema]
}, { timestamps: true });

const daySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  tasks: [taskSchema],
  resources: [resourceSchema]
}, { timestamps: true });

const pathSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  days: [daySchema],
  resources: [resourceSchema],
  quote: {
    type: String,
    default: 'The only way to do great work is to love what you do.'
  },
  quoteAuthor: {
    type: String,
    default: 'Steve Jobs'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  }
}, { timestamps: true });

// Virtual for progress calculation
pathSchema.virtual('progress').get(function() {
  let totalTasks = 0;
  let completedTasks = 0;

  this.days.forEach(day => {
    totalTasks += day.tasks.length;
    completedTasks += day.tasks.filter(task => task.completed).length;
  });

  return totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
});

// Method to check if a path is completed
pathSchema.methods.isCompleted = function() {
  return this.progress === 100;
};

// Static method to find popular paths
pathSchema.statics.findPopular = async function(limit = 5) {
  return this.find({ isPublic: true })
    .sort({ 'stats.views': -1 })
    .limit(limit);
};

export default mongoose.model('Path', pathSchema); 