import { getPreferences, setPreferences } from '../models/preferenceModel.js';
import deepmerge from 'deepmerge';

// Custom merge function to handle arrays in deepmerge
const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;

// This function retrieves the preferences for a given userId
export const getUserPreferences = async (userId) => {
    return await getPreferences(userId);
};

// This function sets (creates or completely overwrites) the preferences for a userId
// It is used for the POST /preferences/:userId endpoint
export const upsertUserPreferences = async (userId, preferences, dndWindows) => {
    // `setPreferences` in the model uses PutCommand, which will either create or completely replace the item
    return await setPreferences(userId, preferences, dndWindows);
};

// This function updates specific fields in the preferences for a given userId
// It fetches existing preferences, deep merges with the new payload, and then saves the complete merged item
export const updateSpecificUserPreferences = async (userId, payload) => {
    const existingItem = await getPreferences(userId);

    if (!existingItem) {
        return null;
    }

    // Initialize with existing values, default to empty objects/arrays if they don't exist
    const currentPreferences = existingItem.preferences || {};
    const currentDndWindows = existingItem.dndWindows || [];

    // Deep merge for 'preferences' object: combines nested properties.
    const mergedPreferences = payload.preferences
        ? deepmerge(currentPreferences, payload.preferences, { arrayMerge: overwriteMerge })
        : currentPreferences; const mergedDndWindows = payload.dndWindows !== undefined ? payload.dndWindows : currentDndWindows;

    // Construct the full item to save.
    const fullUpdatedItem = {
        ...existingItem, // Copy existing top-level fields (like userId) that are not explicitly updated below
        preferences: mergedPreferences,
        dndWindows: mergedDndWindows,
    };

    // Use setPreferences (which performs a PutCommand) to save the entire merged item
    await setPreferences(fullUpdatedItem.userId, fullUpdatedItem.preferences, fullUpdatedItem.dndWindows);
    return fullUpdatedItem; // Return the full updated item for the controller to send back
};