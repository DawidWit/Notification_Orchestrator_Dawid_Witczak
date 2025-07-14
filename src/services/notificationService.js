import { getUserPreferences } from './preferenceService.js';

// This function checks if the event timestamp falls within any Do Not Disturb (DND) windows
const isDuringDnd = (timestamp, dndWindows) => {
    const eventDate = new Date(timestamp);
    const eventDay = eventDate.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const eventHours = eventDate.getUTCHours();
    const eventMinutes = eventDate.getUTCMinutes();
    const eventTimeInMinutes = eventHours * 60 + eventMinutes;

    for (const dnd of dndWindows) {
        let dndDays = dnd.dayOfWeek;
        // Ensure dndDays is an array, if it's a single day, convert it to an array
        if (!Array.isArray(dndDays)) {
            dndDays = [dndDays];
        }

        // Convert day names to indexes (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        const dndDayIndexes = dndDays.map(day => {
            switch (day.toLowerCase()) {
                case 'sunday': return 0;
                case 'monday': return 1;
                case 'tuesday': return 2;
                case 'wednesday': return 3;
                case 'thursday': return 4;
                case 'friday': return 5;
                case 'saturday': return 6;
                default: return -1; // Invalid day, return -1 to filter it out later
            }
        }).filter(day => day !== -1);

        // Check if the event day is in the DND days
        if (dndDayIndexes.includes(eventDay)) {
            // If DND is for the whole day, return true
            // or if the DND time range is specified, check if the event time falls within
            if (dnd.isFullDay) {
                return true;
            } else {
                const [startHour, startMinute] = dnd.startTime.split(':').map(Number); // Convert start time to hours and minutes
                const [endHour, endMinute] = dnd.endTime.split(':').map(Number); // Convert end time to hours and minutes

                // Convert start and end times to minutes for easier comparison
                const dndStartTimeInMinutes = startHour * 60 + startMinute;
                const dndEndTimeInMinutes = endHour * 60 + endMinute;

                // Check if the event time falls within the DND window
                if (dndStartTimeInMinutes < dndEndTimeInMinutes) {
                    if (eventTimeInMinutes >= dndStartTimeInMinutes && eventTimeInMinutes <= dndEndTimeInMinutes) {
                        return true;
                    }
                } else {
                    // Handle case where DND window crosses midnight
                    // e.g., 22:00 to 02:00
                    if (eventTimeInMinutes >= dndStartTimeInMinutes || eventTimeInMinutes <= dndEndTimeInMinutes) {
                        return true;
                    }
                }
            }
        }
    }
    // If no DND windows matched, return false
    return false;
};

// This function evaluates whether a notification should be sent based on user preferences and DND windows
export const evaluateNotificationDecision = async (event) => {
    const { userId, eventType, timestamp } = event;

    // Fetch user preferences from the database
    const userPreferences = await getUserPreferences(userId);

    // If no preferences are found for the user, do not notify
    if (!userPreferences) {
        return {
            decision: "DO_NOT_NOTIFY",
            eventId: event.eventId,
            userId: userId,
            reason: "NO_PREFERENCES_FOUND", // User has no preferences set
        };
    }

    const { preferences, dndWindows = [] } = userPreferences;

    //Check if the event timestamp is during a DND window
    if (isDuringDnd(timestamp, dndWindows)) {
        return {
            decision: "DO_NOT_NOTIFY",
            eventId: event.eventId,
            userId: userId,
            reason: "DND_ACTIVE",
        };
    }

    const eventTypePreference = preferences[eventType];

    //Check if event type preferences exist and are enabled
    if (!eventTypePreference || !eventTypePreference.enabled) {
        return {
            decision: "DO_NOT_NOTIFY",
            eventId: event.eventId,
            userId: userId,
            reason: "PREFERENCES_DISABLED",
        };
    }

    //Check if channels are configured for the event type
    if (!eventTypePreference.channels || eventTypePreference.channels.length === 0) {
        return {
            decision: "DO_NOT_NOTIFY",
            eventId: event.eventId,
            userId: userId,
            reason: "NO_CHANNELS_CONFIGURED",
        };
    }

    // If all checks pass, return the decision to process the notification
    return {
        decision: "PROCESS_NOTIFICATION",
        eventId: event.eventId,
        userId: userId,
        channels: eventTypePreference.channels,
    };
};