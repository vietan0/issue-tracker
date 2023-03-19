const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const Issue = require('../models/Issue');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  // all requests are sent to /api/issues/:projectName
  const url = '/api/issues/vietanProject';
  const testIssueData = {
    issue_title: 'This payload has every field',
    issue_text: 'When we post this bitch it has an error.',
    created_by: 'Joe Mama',
    assigned_to: 'Channing Tatum',
    project: 'vietanProject',
    status_text: 'In QA',
    open: false,
  };
  test('Create an issue with every field', (done) => {
    const everyField = {
      issue_title: 'This payload has every field',
      issue_text: 'When we post this bitch it has an error.',
      created_by: 'Joe Mama',
      assigned_to: 'Channing Tatum',
      status_text: 'In QA',
      open: false,
    };
    chai
      .request(server)
      .post(url)
      .send(everyField)
      .end((err, res) => {
        // response back with full issue object
        assert.equal(res.status, 200, 'res.status should be 200');
        assert.include(res.body, everyField, 'New issue must contain every prop in request body');
        assert.include(
          res.body,
          { project: 'vietanProject' },
          'Response body must have an `{ project: "vietanProject }` property',
        );
        assert.include(
          res.body,
          { open: false },
          'Response body must have an `{ open: false }` property',
        );
        assert.property(res.body, '_id', 'Response body must have an `_id` property');
        assert.property(res.body, 'created_on', 'Response body must have an `created_on` property');
        assert.property(res.body, 'updated_on', 'Response body must have an `updated_on` property');
        done();
      });
  });
  test('Create an issue with only required fields', (done) => {
    const onlyRequiredFields = {
      issue_title: 'This payload only has required fields',
      issue_text: 'When we post this bitch it has an error.',
      created_by: 'Joe Mama',
    };
    chai
      .request(server)
      .post(url)
      .send(onlyRequiredFields)
      .end((err, res) => {
        assert.equal(res.status, 200, 'res.status should be 200');
        assert.include(
          res.body,
          onlyRequiredFields,
          'New issue must contain every prop in request body',
        );
        assert.propertyVal(
          res.body,
          'assigned_to',
          '',
          'Optional field: `assigned_to` should be empty strings',
        );
        assert.propertyVal(
          res.body,
          'status_text',
          '',
          'Optional field: `status_text` should be empty strings',
        );
        done();
      });
  });
  test('Create an issue with missing required fields', (done) => {
    const missingRequiredFields = {
      issue_title: 'This payload has no issue_text',
      created_by: 'Joe Mama',
    };
    chai
      .request(server)
      .post(url)
      .send(missingRequiredFields)
      .end((err, res) => {
        // hey
        assert.equal(res.status, 200, 'res.status should be 200');
        assert.deepEqual(
          res.body,
          {
            error: 'required field(s) missing',
          },
          "res.body should look like: { error: 'required field(s) missing' }",
        );
        done();
      });
  });
  test('View issues on a project', (done) => {
    chai
      .request(server)
      .get(url)
      .end((err, res) => {
        assert.equal(res.status, 200, 'res.status should be 200');
        assert.isArray(res.body, 'res.body should be an array (of issues)');
        done();
      });
  });
  test('View issues on a project with one filter', (done) => {
    chai
      .request(server)
      .get(url)
      .query({ open: false })
      .end((err, res) => {
        assert.equal(res.status, 200, 'res.status should be 200');
        assert.isArray(res.body, 'res.body should be an array (of issues)');
        assert.lengthOf(res.body, 1, 'There should only be 1 doc fits the query');
        assert.propertyVal(res.body[0], 'open', false);
        done();
      });
  });
  test('View issues on a project with multiple filters', (done) => {
    chai
      .request(server)
      .get(url)
      .query({ open: false, assigned_to: 'Channing Tatum' })
      .end((err, res) => {
        assert.equal(res.status, 200, 'res.status should be 200');
        assert.isArray(res.body, 'res.body should be an array (of issues)');
        assert.lengthOf(res.body, 1, 'There should only be 1 doc fits the query');
        assert.propertyVal(res.body[0], 'open', false);
        assert.propertyVal(res.body[0], 'assigned_to', 'Channing Tatum');
        done();
      });
  });
  test('Update one field on an issue', (done) => {
    // 1. create an issue
    // 2. send id and update body
    // 3. get id of that issue

    const testIssue = new Issue(testIssueData);
    testIssue.save().then((savedDoc) => {});
    const { _id } = testIssue;

    chai
      .request(server)
      .put(url)
      .send({ _id, assigned_to: 'David Schwimmer' })
      .end((err, res) => {
        assert.equal(res.status, 200, 'res.status should be 200');
        assert.deepEqual(
          res.body,
          { result: 'successfully updated', _id: testIssue._id.toString() },
          'Response should have result and _id',
        );
        done();
      });
  });
  test('Update multiple fields on an issue', (done) => {
    const testIssue = new Issue(testIssueData);
    testIssue.save().then((savedDoc) => {});
    const { id } = testIssue;
    chai
      .request(server)
      .put(url)
      .send({ _id: id, assigned_to: 'David Schwimmer', status_text: 'Already Done' })
      .end((err, res) => {
        assert.equal(res.status, 200, 'res.status should be 200');
        assert.deepEqual(
          res.body,
          { result: 'successfully updated', _id: id },
          "Response should be `{ result: 'successfully updated', _id: id }",
        );
        done();
      });
  });
  test('Update an issue with missing _id', (done) => {
    chai
      .request(server)
      .put(url)
      .send({ assigned_to: 'David Schwimmer' })
      .end((err, res) => {
        assert.equal(res.status, 200, 'res.status should be 200');
        assert.deepEqual(
          res.body,
          { error: 'missing _id' },
          "Response should be `{ error: 'missing _id' }",
        );
        done();
      });
  });
  test('Update an issue with no fields to update', (done) => {
    const testIssue = new Issue(testIssueData);
    testIssue.save((err) => {
      if (err) console.log('err when .save()');
    });
    const { id } = testIssue;
    chai
      .request(server)
      .put(url)
      .send({ _id: id })
      .end((err, res) => {
        assert.equal(res.status, 200, 'res.status should be 200');
        assert.deepEqual(
          res.body,
          { error: 'no update field(s) sent', _id: id },
          "Response should be `{ error: 'no update field(s) sent', _id: id }",
        );
        done();
      });
  });
  test('Update an issue with an invalid id', (done) => {
    const id = '5';
    chai
      .request(server)
      .put(url)
      .send({ _id: id, assigned_to: 'David Schwimmer' })
      .end((err, res) => {
        assert.equal(res.status, 200, 'res.status should be 200');
        assert.deepEqual(
          res.body,
          { error: 'could not update', _id: id },
          "Response should be `{ error: 'could not update', _id: id }",
        );
        done();
      });
  });
  test('Delete an issue', (done) => {
    const testIssue = new Issue(testIssueData);
    testIssue.save((err) => {
      if (err) console.log('err when .save()');
    });
    const { id } = testIssue;
    chai
      .request(server)
      .delete(url)
      .send({ _id: id })
      .end((err, res) => {
        assert.equal(res.status, 200, 'res.status should be 200');
        assert.deepEqual(
          res.body,
          { result: 'successfully deleted', _id: id },
          "Response should be `{ result: 'successfully deleted', id }",
        );
        done();
      });
  });
  test('Delete an issue with an invalid id', (done) => {
    const id = '5';
    chai
      .request(server)
      .delete(url)
      .send({ _id: id })
      .end((err, res) => {
        assert.equal(res.status, 200, 'res.status should be 200');
        assert.deepEqual(
          res.body,
          { error: 'could not delete', _id: id },
          "Response should be `{ error: 'could not delete', id }",
        );
        done();
      });
  });
  test('Delete an issue with missing _id', (done) => {
    chai
      .request(server)
      .delete(url)
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200, 'res.status should be 200');
        assert.deepEqual(
          res.body,
          { error: 'missing _id' },
          "Response should be `{ error: 'missing _id' }",
        );
        done();
      });
  });
});
