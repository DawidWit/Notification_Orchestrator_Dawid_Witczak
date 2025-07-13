import express from 'express';
import dotenv from 'dotenv';
import eventRoutes from './routes/eventRoutes.js';
import preferenceRoutes from './routes/preferenceRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Create an instance of the Express application
const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for health check
app.get('/', (req, res) => {
    res.send('Notification Orchestrator is running!');
});

// Import and use routes
app.use('/events', eventRoutes);
app.use('/preferences', preferenceRoutes);

const PORT = process.env.PORT || 3000;
// Start the server
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Notification orchestrator microservice running on port ${PORT}`);
    });
}

export default app;
