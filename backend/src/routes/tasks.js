// Add these routes to your existing tasks router

// Update task status
router.patch('/:cardId/task-status', auth, async (req, res) => {
  try {
    const { taskId, completed } = req.body;
    const card = await Task.findOneAndUpdate(
      { 
        _id: req.params.cardId,
        userId: req.user._id,
        'tasks._id': taskId
      },
      {
        $set: {
          'tasks.$.completed': completed
        }
      },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({ message: 'Card or task not found' });
    }

    res.json(card);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task status' });
  }
});

// Add task to card
router.post('/:cardId/tasks', auth, async (req, res) => {
  try {
    const { title, description, day } = req.body;
    const card = await Task.findOneAndUpdate(
      { _id: req.params.cardId, userId: req.user._id },
      {
        $push: {
          tasks: {
            day,
            title,
            description,
            completed: false
          }
        }
      },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    res.json(card);
  } catch (error) {
    res.status(500).json({ message: 'Error adding task' });
  }
}); 