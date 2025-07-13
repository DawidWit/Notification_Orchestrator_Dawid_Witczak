import { ddbDocClient } from '../config/dynamodb.js';
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb"; 

// Define the table name for preferences
const TABLE_NAME = "NotificationPreferences";

// This function retrieves the preferences for a given userId from the DynamoDB table
export const getPreferences = async (userId) => {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            userId,
        },
    };
    const { Item } = await ddbDocClient.send(new GetCommand(params));
    return Item;
};

// This function sets or completely replaces the preferences for a userId in the DynamoDB table
// It creates a new item or replaces an existing one
export const setPreferences = async (userId, preferences, dndWindows) => {
    const itemToPut = {
        userId,
        preferences: preferences || {}, // Ensure preferences is an object
        dndWindows: dndWindows || [],   // Ensure dndWindows is an array
    };
    const params = {
        TableName: TABLE_NAME,
        Item: itemToPut,
    };
    await ddbDocClient.send(new PutCommand(params));
    return itemToPut; // Return the item that was successfully put
};
