import { evaluateNotificationDecision } from '../services/notificationService.js';

// Controller to handle event ingestion and decision making for notifications
export const ingestEvent = async (req, res) => {
    try {
        const decision = await evaluateNotificationDecision(req.body);

        // If the decision is to process the notification, return 202 Accepted
        // Otherwise, return 200 OK with the decision details
        if (decision.decision === "PROCESS_NOTIFICATION") {
            return res.status(202).json(decision);
        } else {
            return res.status(200).json(decision);
        }
    } catch (error) {
        console.error("Error ingesting event:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};