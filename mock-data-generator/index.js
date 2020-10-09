const aws = require('aws-sdk');
aws.config.update({region: 'us-east-2'});
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const faker = require('faker');


const docClient = new aws.DynamoDB.DocumentClient();

const DEFAULT_DYNAMODB_TABLE_NAME = "productSalesTable";



const insertProductSales = (record) => {

    let tableName = process.env.DYNAMODB_TABLE_NAME;
    if (!tableName) {
        tableName = DEFAULT_DYNAMODB_TABLE_NAME;
    }

    let params = {
        TableName: tableName,
        Item: record
    };
    console.log("Calling PutItem");
    console.log(JSON.stringify(params));
  
    let result = new Promise((resolve, reject) =>  {
        
        docClient.put(params, function(err, data) {
            if (err)  { 
                console.error(err); // an error occurred
                reject(err);
            }
            else { 
                console.log("PutItem returned successfully");
                resolve(data);
            }
        });
    });

    return result;

}


const generateProductSalesData = () => {

    const dateTo = moment();
    const dateFrom = moment().subtract(1, 'months');

    const record = {
        salesId: uuidv4(),
        productCode: faker.commerce.product(),
        date: faker.date.between(dateFrom.format(), dateTo.format()).getTime(),
        amount: faker.random.number({min: 0, max: 5000})
    }


  return record;

}

const insertMassProductSales = async (count) => {
    const promises = [];
    for (let i = 0; i < count; i++) {
        const record = generateProductSalesData();
        promises.push(insertProductSales(record));
    }

    await Promise.all(promises)
}


(async () => {
    for (let i = 0; i < 1000; i++) {
        await insertMassProductSales(100);
    }
})();