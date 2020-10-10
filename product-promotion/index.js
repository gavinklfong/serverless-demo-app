//
//  Product Promotion Generation Function
//
//  This is a mock function as part of the serverless app demo, it creates promotion and save into DynamoDB. 
//  It takes product code from input and construct promotion
//
//  Environment variables:
//    PRODUCT_PROMOTION_TABLE_NAME - DynamoDB table name of product protmotion storage
//    REGION - AWS region
//
//  Logic:
//    This lambda function randomly create number of promotion code for each incoming product code
//    and then insert into DynamoDB.
//
//  Input:
//    List of records from event - event.Records
//    The body of each record is a JSON object
//      {
//        type: "object"
//        properties: {
//          productCode: { type: "string"}
//        },
//        required: ["productCode"] 
//      }
//
//  Output:
//    Promotion's JSON object structure:
//      {
//        type: "object"
//        properties: {
//          promotionCode: { type: "string"}
//          productCode: { type: "string"}
//          amount: { type: "number"}
//          expiry: { type: "number"}
//        },
//        required: ["promotionCode, productCode, amount, expiry"] 
//      }
//
//

'use strict';
const aws = require('aws-sdk');
aws.config.update({region: process.env.AWS_REGION});
const { v4: uuidv4 } = require('uuid');
const faker = require('faker');
const moment = require('moment');

const docClient = new aws.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.PRODUCT_PROMOTION_TABLE_NAME;

module.exports.handler = async event => {

  console.log("SQS event received");
  console.log(JSON.stringify((event)));

  for (let eventRecord of event.Records) {   
      try {
          const message = JSON.parse(eventRecord.body);
          console.log("Message: " + JSON.stringify(message));                    
          await formulatePromotion(message.productCode);
      
      } catch (e) {
        console.error(e);
        throw e;
      }

  }

  return { message: 'Function executed successfully!', event };
}

// Create promotion items by random and insert into promotion table
const formulatePromotion = async (productCode) => {

  const records = createPromotions(productCode);

  console.log("insert record : ");
  console.log(records);

  const promises = [];
  for (let i = 0; i < records.length; i++) {
    promises.push(insertPromotion(records[i]));
  }

  await Promise.all(promises);

}

// insert promotion record to table
const insertPromotion = (record) => {

  let params = {
    TableName: TABLE_NAME,
    Item: record
  };

  let result = new Promise((resolve, reject) =>  {      
    docClient.put(params, function(err, data) {
        if (err)  { 
            console.error(err); // an error occurred
            reject(err);
        }
        else { 
            console.log("Item inserted successfully - " + record.promotionCode);
            resolve(data);
        }
    });
  });

  return result;
  
}

// create a single promotion object
const createPromotion = (productCode) => {

  const dateFrom = moment();
  const dateTo = moment().add(6, 'months');

  return {
    promotionCode: uuidv4(),
    productCode: productCode,
    amount: faker.random.number({min: 0, max: 500}),
    expiry: faker.date.between(dateFrom.format(), dateTo.format()).getTime(),
  }

}

// create a list of promotion objects
const createPromotions = (productCode) => {

  const records = [];

  const count = faker.random.number({min: 1, max: 10});

  for (let i = 0; i < count; i++) {
    records.push(createPromotion(productCode));
  }

  return records;

}