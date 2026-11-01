// Real schema validation, entirely in memory. No mongoose.connect or MongoDB server.
const mongoose = require('mongoose');
const Task = require('../../models/task');
const User = require('../../models/user');
const owner = new mongoose.Types.ObjectId();
const valid = { title: 'Valid task', priority: 'High Priority', userName: owner, checklist: [{ name: 'Check' }] };

test('BE-SCHEMA-01 defaults tasks to to-do and incomplete checklist entries', () => {
  const task = new Task(valid);
  expect(task.validateSync()).toBeUndefined();
  expect(task.category).toBe('to-do');
  expect(task.checklist[0].isDone).toBe(false);
});

