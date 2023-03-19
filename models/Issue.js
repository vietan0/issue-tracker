const { Schema, model } = require('mongoose');

const issueSchema = new Schema({
  issue_title: { type: String, required: [true, 'issue_title is required!'] },
  issue_text: { type: String, required: [true, 'issue_text is required!'] },
  created_by: { type: String, required: [true, 'created_by is required!'] },
  project: { type: String, required: [true, 'project is required!'] },
  assigned_to: { type: String, default: '' },
  status_text: { type: String, default: '' },
  open: { type: Boolean, default: true },
  created_on: { type: Date, default: new Date(Date.now()).toISOString() },
  updated_on: { type: Date, default: new Date(Date.now()).toISOString() },
});


const Issue = model('Issue', issueSchema);

module.exports = Issue;
