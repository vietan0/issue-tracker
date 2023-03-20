'use strict';
const Issue = require('../models/Issue');
const queryAnObject = require('../queryAnObject');

module.exports = function (app) {
  app
    .route('/api/issues/:projectName')

    .get(async function (req, res) {
      const { projectName } = req.params; // vietanProject
      const issues = await Issue.find({ project: projectName });
      if (issues) {
        if (Object.entries(req.query).length === 0) res.json(issues);
        else {
          const filteredIssues = issues.filter((issue) => queryAnObject(issue, req.query) === true);
          res.json(filteredIssues);
        }
      } else res.json([]);
    })

    .post(async function (req, res) {
      const { projectName } = req.params; // vietanProject
      try {
        if (Array.isArray(req.body)) {
          // passing an array of data to POST
          const completedBody = req.body.map((issue) => ({ ...issue, project: projectName }));
          const newIssues = await Issue.create(completedBody);
          res.json(newIssues);
        } else {
          // passing one data obj to POST
          const newIssue = await Issue.create({ ...req.body, project: projectName });
          res.json(newIssue);
        }
      } catch (err) {
        if (err.message.includes('is required!')) res.json({ error: 'required field(s) missing' });
      }
    })

    .put(async function (req, res) {
      const { _id } = req.body;
      if (_id === undefined) return res.json({ error: 'missing _id' });
      const updateBody = { ...req.body, updated_on: new Date(Date.now()).toISOString() };
      delete updateBody._id;
      if (Object.entries(updateBody).length === 1)
        return res.json({ error: 'no update field(s) sent', _id });

      try {
        const updatedIssue = await Issue.findByIdAndUpdate(_id, updateBody, {
          returnDocument: 'after',
          lean: true,
        });
        if (updatedIssue === null) return res.json({ error: 'could not update', _id });
        res.json({ result: 'successfully updated', _id: _id });
      } catch (err) {
        res.json({ error: 'could not update', _id });
      }
    })

    .delete(async function (req, res) {
      const { _id } = req.body;
      if (Object.entries(req.body).length > 1) return res.json({ error: 'could not delete', _id });
      if (_id === undefined) return res.json({ error: 'missing _id' });

      try {
        const deletedDoc = await Issue.findByIdAndDelete(_id);
        res.json({ result: 'successfully deleted', _id });
      } catch (err) {
        res.json({ error: 'could not delete', _id });
      }
    });
};
