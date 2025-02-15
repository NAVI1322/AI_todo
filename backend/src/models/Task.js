import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  dueDate: {
    type: Date
  }
}, {
  timestamps: true
});

const taskSchema = new mongoose.Schema({
  userId: {
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
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'completed'],
    default: 'todo'
  },
  steps: [stepSchema],
  dueDate: {
    type: Date
  },
  tags: [{
    type: String
  }],
  category: {
    type: String
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task; 