
# About

This is a demo app to show how Serverless Framework works. This application provides the showcases of serverless architecture with the following patterns:
- API Gateway
- Scheduled Job
- SQS Message - Asynchronous Job

Please refer to this article for detail


# How to build

Since the application is to be deployed on AWS cloud, the access to AWS resources and AWS credential file setup is the pre-requisitie.

You firstly need to install the following tools to your development machine:
- Node JS
- Node JS Package Manager (NPM)
- Visual Studio Code
- Serverless Framework

Once you have got everything ready, you can simply run this command to package and deploy this app
`sls deploy`

Upon completion of deployment, you can examine the provisioned components in AWS console - Lambda > Application > serverless-demo-app-dev

# How to run

To trigger promotion generation manually, trigger a testing event on labmda serverless-demo-app-dev-productSalesAnalysis to simulate the schedule job. Promotion records will then be generated to DynamoDB. Finally, you can verify the get promotion API by postman, it will return a list of newly generated records.
