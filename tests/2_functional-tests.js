const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const Project = require('../models/Project');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  // all requests are sent to /api/issues/:projectName
  const url = '/api/issues/vietanProject';

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
        assert.include(res.body, { open: false }, 'Response body must have an `open` property');
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
        // assert.lengthOf(res.body, 1, 'There should only be 1 doc fits the query');
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
        // assert.lengthOf(res.body, 1, 'There should only be 1 doc fits the query');
        assert.propertyVal(res.body[0], 'open', false);
        assert.propertyVal(res.body[0], 'assigned_to', 'Channing Tatum');
        done();
      });
  });
  test('Update one field on an issue', (done) => {
    chai
      .request(server)
      .put(url)
      .send({ assigned_to: 'David Schwimmer' })
      .end((err, res) => {
        assert.equal(res.status, 200, 'res.status should be 200');
        done();
      });
  });
});
