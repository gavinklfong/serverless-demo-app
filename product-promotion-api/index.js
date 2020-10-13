//
//  Product Promotion Retrieval API
//
//  This is a mock function as part of serverless demo app, it simply retrieves records from DynamoDB with condition (expiry > today)
//  and return the result as HTTP response. Since it is just for simple demonstration purpose, it does not include no pagination or other validation logic
//
//  Environment variable:
//    PRODUCT_PROMOTION_TABLE_NAME - DynamoDB table name of product promotion
//

'use strict';
const aws = require('aws-sdk');
aws.config.update({region: process.env.AWS_REGION});
const moment = require('moment');

const docClient = new aws.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.PRODUCT_PROMOTION_TABLE_NAME;

module.exports.handler = async event => {

  console.log("recevied event");
  console.log(event);

  try {
    const queryItemList = await retrievePromotion();
    return {
      statusCode: 200,
      body: JSON.stringify(queryItemList)
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: "Sorry, something goes wrong"
    };
  }

};

const retrievePromotion = async () => {

  const now = moment();

  const params = {
    ProjectionExpression: "promotionCode, productCode, amount, expiry",
    FilterExpression: '#expiry > :today',
    ExpressionAttributeNames: {
      "#expiry": "expiry",
    },
    ExpressionAttributeValues: {
      ":today": now.valueOf(),
    },
    TableName: TABLE_NAME
  };

  let queryItemList = [];

  try {
      let queryData = await docClient.scan(params).promise();
      queryItemList = queryData.Items;

  } catch (e) {
      console.error(e);
      throw e;
  }

  return queryItemList;

}
