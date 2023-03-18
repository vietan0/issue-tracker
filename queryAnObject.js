function queryAnObject(issue, queryObj) {
  const correctTypeQuery = {
    ...queryObj,
  };
  if (Object.hasOwn(queryObj, 'open')) {
    // if queryObj has 'open' prop, it will be string, so turn it into Boolean
    correctTypeQuery.open = queryObj.open === 'true' ? true : false;
  }
  const issueEntries = Object.entries(issue._doc);
  const queryEntries = Object.entries(correctTypeQuery);

  const issueStr = issueEntries.map((subArr) => JSON.stringify(subArr));
  const queryStr = queryEntries.map((subArr) => JSON.stringify(subArr));

  // check if each query's key & value pair is present in issue
  const includeResults = queryStr.map((val) => issueStr.includes(val));
  // if all of query's key & value pair is matched in issue, return true
  return includeResults.every((val) => val === true);
}

module.exports = queryAnObject;
