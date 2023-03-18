'use strict';
const Project = require('../models/Project');
const queryAnObject = require('../queryAnObject');

module.exports = function (app) {
  app
    .route('/api/issues/:projectName')

    .get(async function (req, res) {
      const { projectName } = req.params; // vietanProject
      const existingProject = await Project.findOne({ name: projectName });
      if (existingProject) {
        const filteredIssues = existingProject.issues.filter((issue) =>
          Object.entries(req.query).length === 0 ? issue : queryAnObject(issue, req.query) === true,
        );
        res.json(filteredIssues);
      } else res.json([]);
    })

    .post(async function (req, res) {
      const { projectName } = req.params; // vietanProject
      try {
        const existingProject = await Project.findOne({ name: projectName });
        if (existingProject) {
          // add an issue to an existing project document
          existingProject.issues.push(req.body);
          await existingProject.save();
          res.json(existingProject.issues[1]);
        } else {
          // create a project if doesn't exist
          const newProject = await Project.create({ name: projectName, issues: [req.body] });
          res.json(newProject.issues[0]);
        }
      } catch (err) {
        if (err.message.includes('is required!')) res.json({ error: 'required field(s) missing' });
      }
    })

    .put(function (req, res) {
      const { projectName } = req.params; // vietanProject
    })

    .delete(function (req, res) {
      const { projectName } = req.params; // vietanProject
    });
};
