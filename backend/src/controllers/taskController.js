import Task from '../models/Task.js';

export const getTasks = async (req, res) => {
  try {
    console.log('\n=== Database Operation Start ===');
    console.time('Database Query');
    const tasks = await Task.find({ user: req.user?._id }).sort({ createdAt: -1 });
    console.timeEnd('Database Query');
    console.log('Fetched from Database:', JSON.stringify(tasks, null, 2));
    console.log('=== Database Operation End ===\n');
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Error fetching task' });
  }
};

export const createTask = async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      userId: req.user.userId
    });
    
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
};

export const updateStepCompletion = async (req, res) => {
  try {
    const { taskId, stepId, isCompleted } = req.body;
    
    const task = await Task.findOneAndUpdate(
      { 
        _id: taskId,
        userId: req.user.userId,
        'steps._id': stepId 
      },
      { 
        $set: { 'steps.$.isCompleted': isCompleted }
      },
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task or step not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Update step completion error:', error);
    res.status(500).json({ message: 'Error updating step completion' });
  }
}; 