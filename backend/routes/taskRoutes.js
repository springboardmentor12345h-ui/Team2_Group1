const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all tasks for the user
// @route   GET /api/tasks
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user._id }).populate('project', 'title');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
router.post('/', protect, async (req, res) => {
    const { title, description, project, assignedTo, status, priority, dueDate } = req.body;

    if (!title || !project) {
        return res.status(400).json({ message: 'Please provide title and project' });
    }

    try {
        const task = new Task({
            title,
            description,
            project,
            assignedTo: assignedTo || req.user._id,
            status: status || 'todo',
            priority: priority || 'medium',
            dueDate,
        });

        const createdTask = await task.save();
        await createdTask.populate('project', 'title');
        res.status(201).json(createdTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('project', 'title').populate('assignedTo', 'name email');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if user is assigned to the task or owns the project
        if (task.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    const { title, description, status, priority, dueDate } = req.body;

    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if user is assigned to the task
        if (task.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.status = status || task.status;
        task.priority = priority || task.priority;
        task.dueDate = dueDate || task.dueDate;

        const updatedTask = await task.save();
        await updatedTask.populate('project', 'title');
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if user is assigned to the task
        if (task.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
