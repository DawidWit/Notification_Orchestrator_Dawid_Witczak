import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import dotenv from 'dotenv';

dotenv.config();

// Create a DynamoDB client instance
const ddbClient = new DynamoDBClient({
    region: process.env.AWS_REGION || "localhost",
    endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "dummy",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "dummy",
    },
});

// Create a DynamoDB Document Client instance for easier data manipulation
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export { ddbClient, ddbDocClient };