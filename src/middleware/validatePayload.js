import Joi from 'joi';

const eventSchema = Joi.object({
    eventId: Joi.string().required(),
    userId: Joi.string().required(),
    eventType: Joi.string().required(),
    timestamp: Joi.string().isoDate().required(),
    payload: Joi.object().optional(),
});

// Schema for user preferences
// It includes preferences for different event types and DND windows
const preferenceSchema = Joi.object({
    preferences: Joi.object().pattern(
        Joi.string(),
        Joi.object({
            enabled: Joi.boolean().required(),
            channels: Joi.array().items(Joi.string().valid('email', 'sms', 'push')).required(),
        })
    ).optional(),
    // DND windows can be an array of objects with dayOfWeek, startTime, endTime, and isFullDay
    dndWindows: Joi.array().items(
        Joi.object({
            dayOfWeek: Joi.alternatives().try(Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), Joi.array().items(Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'))).required(),
            startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
            endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
            isFullDay: Joi.boolean().default(false),
        }).xor('startTime', 'isFullDay').xor('endTime', 'isFullDay') // startTime/endTime required unless isFullDay is true
    ).optional(),
});

// Schema for updating user preferences
const preferenceUpdateSchema = Joi.object({
    preferences: Joi.object().pattern(
        Joi.string(),
        Joi.object({
            enabled: Joi.boolean().required(),
            channels: Joi.array().items(Joi.string().valid('email', 'sms', 'push')).required(),
        })
    ).optional(),
    dndWindows: Joi.array().items(
        Joi.object({
            dayOfWeek: Joi.alternatives().try(Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), Joi.array().items(Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'))).required(),
            startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
            endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
            isFullDay: Joi.boolean().default(false),
        }).xor('startTime', 'isFullDay').xor('endTime', 'isFullDay')
    ).optional(),
}).min(1); // At least one field (preferences or dndWindows) must be present

// Middleware to validate request payloads against the defined schemas
export const validatePayload = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

export { eventSchema, preferenceSchema, preferenceUpdateSchema };