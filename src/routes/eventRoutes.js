import { Router } from 'express';
import { ingestEvent } from '../controllers/eventController.js';
import { validatePayload, eventSchema } from '../middleware/validatePayload.js';

const router = Router();

// Route to handle event ingestion
router.post('/', validatePayload(eventSchema), ingestEvent);

export default router;