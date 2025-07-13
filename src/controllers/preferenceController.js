import { getUserPreferences, upsertUserPreferences, updateSpecificUserPreferences } from '../services/preferenceService.js';


// Controller to handle user preferences
export const getPreferencesForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        // Retrieve preferences for the given userId
        const preferences = await getUserPreferences(userId);
        // If no preferences found, return 404
        // If preferences are found, return them with a 200 status
        if (!preferences) {
            return res.status(404).json({ message: "User preferences not found" });
        }
        return res.status(200).json(preferences);
    } catch (error) {
        console.error("Error getting preferences:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Controller to set user preferences
export const setPreferencesForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { preferences, dndWindows } = req.body;
        const newPreferences = await upsertUserPreferences(userId, preferences, dndWindows);
        // If preferences are successfully set, return them with a 201 status
        return res.status(201).json(newPreferences);
    } catch (error) {
        console.error("Error setting preferences:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Controller to update user preferences
export const updatePreferencesForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const updated = await updateSpecificUserPreferences(userId, req.body);
        // If no preferences were updated, return 404
        if (!updated) {
            return res.status(404).json({ message: "User preferences not found or no changes applied" });
        }
        // If preferences are successfully updated, return them with a 200 status
        return res.status(200).json(updated);
    } catch (error) {
        console.error("Error updating preferences:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};