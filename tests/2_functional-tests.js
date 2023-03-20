const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  // all requests are sent to /api/issues/:projectName
  const url = '/api/issues/vietanProject';
  const putAndDeletePayload = {
    issue_title: 'PUT & DELETE test',
    issue_text: 'Lorem Ipsum',
    created_by: 'Lorem Ipsum',
  };
  test('Create an issue with every field', (done) => {
    const everyField = {
      issue_title: 'everyField',
      issue_text: 'Lorem Ipsum',
      created_by: 'Lorem Ipsum',
      assigned_to: 'Lorem Ipsum',
      status_text: 'Lorem Ipsum',
    };
    chai
      .request(server)
      .post(url)
      .send(everyField)
      .end((err, res) => {
        assert.include(res.body, everyField);
        assert.containsAllKeys(res.body, ['project', 'open', '_id', 'created_on', 'updated_on']);
        done();
      });
  });
  test('Create an issue with only required fields', (done) => {
    const onlyRequired = {
      issue_title: 'onlyRequired',
      issue_text: 'Lorem Ipsum',
      created_by: 'Lorem Ipsum',
    };
    chai
      .request(server)
      .post(url)
      .send(onlyRequired)
      .end((err, res) => {
        assert.include(res.body, { ...onlyRequired, assigned_to: '', status_text: '' });
        done();
      });
  });
  test('Create an issue with missing required fields', (done) => {
    const missingRequired = {
      issue_title: 'This payload has no issue_text',
      created_by: 'Joe Mama',
    };
    chai
      .request(server)
      .post(url)
      .send(missingRequired)
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'required field(s) missing' });
        done();
      });
  });
  test('View issues on a project', (done) => {
    chai
      .request(server)
      .get(url)
      .end((err, res) => {
        assert.isArray(res.body, 'res.body should be an array (of issues)');
        done();
      });
  });
  test('View issues on a project with one filter', (done) => {
    const fourPayloads = [
      {
        issue_title: 'Filter Test 1',
        issue_text: 'Lorem Ipsum',
        created_by: 'Alice',
        assigned_to: 'Bob',
      },
      {
        issue_title: 'Filter Test 2',
        issue_text: 'Lorem Ipsum',
        created_by: 'Alice',
        assigned_to: 'Bob',
      },
      {
        issue_title: 'Filter Test 3',
        issue_text: 'Lorem Ipsum',
        created_by: 'Alice',
        assigned_to: 'Eric',
      },
      {
        issue_title: 'Filter Test 4',
        issue_text: 'Lorem Ipsum',
        created_by: 'Carol',
        assigned_to: 'Eric',
      },
    ];
    chai
      .request(server)
      .post(url)
      .send(fourPayloads)
      .then(() => {
        chai
          .request(server)
          .get(url)
          .query({ created_by: 'Alice' })
          .end((err, res) => {
            assert.lengthOf(res.body, 3, 'There should be 3 docs created by Alice');
            done();
          });
      });
  });
  test('View issues on a project with multiple filters', (done) => {
    chai
      .request(server)
      .get(url)
      .query({ created_by: 'Alice', assigned_to: 'Bob' })
      .end((err, res) => {
        assert.isArray(res.body);
        assert.lengthOf(res.body, 2, 'There should be 2 docs assigned to Bob');
        assert.include(res.body[0], { created_by: 'Alice', assigned_to: 'Bob' });
        done();
      });
  });
  test('Update one field on an issue', (done) => {
    chai
      .request(server)
      .post(url)
      .send(putAndDeletePayload)
      .then((res) => {
        const { _id } = res.body;
        chai
          .request(server)
          .put(url)
          .send({ _id, assigned_to: 'David Schwimmer' })
          .end((err, res) => {
            assert.deepEqual(res.body, { result: 'successfully updated', _id });
            done();
          });
      });
  });
  test('Update multiple fields on an issue', (done) => {
    chai
      .request(server)
      .post(url)
      .send(putAndDeletePayload)
      .then((res) => {
        const { _id } = res.body;
        chai
          .request(server)
          .put(url)
          .send({ _id, assigned_to: 'David Schwimmer', status_text: 'Already Done' })
          .end((err, res) => {
            assert.deepEqual(res.body, { result: 'successfully updated', _id });
            done();
          });
      });
  });
  test('Update an issue with missing _id', (done) => {
    chai
      .request(server)
      .put(url)
      .send({ assigned_to: 'David Schwimmer' })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  });
  test('Update an issue with no fields to update', (done) => {
    chai
      .request(server)
      .post(url)
      .send(putAndDeletePayload)
      .then((res) => {
        const { _id } = res.body;
        chai
          .request(server)
          .put(url)
          .send({ _id })
          .end((err, res) => {
            assert.deepEqual(res.body, { error: 'no update field(s) sent', _id });
            done();
          });
      });
  });
  test('Update an issue with an invalid id', (done) => {
    chai
      .request(server)
      .put(url)
      .send({ _id: '5', assigned_to: 'David Schwimmer' })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'could not update', _id: '5' });
        done();
      });
  });
  test('Delete an issue', (done) => {
    chai
      .request(server)
      .post(url)
      .send(putAndDeletePayload)
      .then((res) => {
        const { _id } = res.body;
        chai
          .request(server)
          .delete(url)
          .send({ _id })
          .end((err, res) => {
            assert.deepEqual(res.body, { result: 'successfully deleted', _id });
            done();
          });
      });
  });
  test('Delete an issue with an invalid id', (done) => {
    chai
      .request(server)
      .delete(url)
      .send({ _id: '5' })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'could not delete', _id: '5' });
        done();
      });
  });
  test('Delete an issue with missing _id', (done) => {
    chai
      .request(server)
      .delete(url)
      .send({})
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  });
});
