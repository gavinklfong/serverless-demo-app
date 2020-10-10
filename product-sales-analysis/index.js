
//
//  Product Sales Analysis
//
//  As part of the serverless app demo, this is a mock function which generates product code for promotion.
//  It generates list of product codes by random and write to SQS
//  
//  Environment variable:
//  PRODUCT_PROMOTION_QUEUE_NAME - SQS queue name to write the product code
//
//  SQS message body:
//      {
//        type: "object"
//        properties: {
//          productCode: { type: "string"}
//        },
//        required: ["productCode"] 
//      }
//
//

'use strict';
const aws = require('aws-sdk');
aws.config.update({region: process.env.AWS_REGION});
const faker = require('faker');

const sqs = new aws.SQS({apiVersion: '2012-11-05'});
const QUEUE_NAME = process.env.PRODUCT_PROMOTION_QUEUE_NAME;


module.exports.handler = async event => {

  console.log("received event");
  console.log(event);

  const queueUrl = await getQueueUrl(QUEUE_NAME);

  const count = faker.random.number({min: 1, max: 10});

  const promises = [];

  for (let i = 0; i < count; i++) {
    const sqsMessage = createSQSMessage(faker.commerce.product(), queueUrl);
    promises.push(sendSQSMessage(sqsMessage));
  }

  await Promise.all(promises);

  return { message: 'Function executed successfully!', event };
};

const getQueueUrl = async (queueName) => {
  const params = {
    QueueName: queueName
  };
  return (await sqs.getQueueUrl(params).promise()).QueueUrl;
};

const createSQSMessage = (productCode, queueUrl) => {

  const body = { productCode: productCode };

  const sqsMessage = {
   DelaySeconds: 10,      // Remove DelaySeconds parameter and value for FIFO queues
   MessageAttributes: { },
   MessageBody: JSON.stringify(body),
   // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
   // MessageGroupId: "Group1",  // Required for FIFO queues
   QueueUrl: queueUrl
 };

 return sqsMessage;
}

const sendSQSMessage = (sqsMessage) => {

  console.log("Writing to SQS");
  console.log(sqsMessage);

  const promise = new Promise((resolve, reject) =>  {      
    sqs.sendMessage(sqsMessage, function(err, data) {
      if (err) {
        console.log("SQS message transmission error", err);
        reject(err);
      } else {
        console.log("SQS message transmission success", data.MessageId);
        resolve(data);
      }
    });
  });

  return promise;
}
