/**
 * Redis Configuration for Cross-App Real-time Communication
 * Both Publisher (to customer) and Subscriber (from customer)
 */
import Redis from 'ioredis';
import { logger } from './winston.config.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let publisher = null;
let subscriber = null;
let isConnected = false;

/**
 * Redis Pub/Sub Channel Names
 */
export const REDIS_CHANNELS = {
    ORDER_CREATED: 'cross-app:order:created',
    ORDER_STATUS_UPDATED: 'cross-app:order:status-updated',
    BILL_REQUESTED: 'cross-app:bill:requested',
    ORDER_CANCELLED: 'cross-app:order:cancelled',
};

/**
 * Publish event to Redis (for Customer app to receive)
 */
export const publishEvent = async (channel, data) => {
    if (!isConnected || !publisher) {
        logger.debug('[Redis] Not connected, skipping publish');
        return;
    }
    try {
        const message = JSON.stringify({ ...data, timestamp: new Date().toISOString(), source: 'admin-server' });
        await publisher.publish(channel, message);
        logger.info(`[Redis] Published to ${channel}: Order ${data.order?.orderNumber || data.orderId || 'unknown'}`);
    } catch (error) {
        logger.error(`[Redis] Publish failed: ${error.message}`);
    }
};

/**
 * Connect Redis with subscriber callback
 * @param {Function} onMessage - Callback when message received from customer
 */
export const connectRedis = async (onMessage) => {
    try {
        // Create publisher
        publisher = new Redis(REDIS_URL, {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => times > 3 ? null : Math.min(times * 100, 3000),
        });

        // Create subscriber
        subscriber = new Redis(REDIS_URL, {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => times > 3 ? null : Math.min(times * 100, 3000),
        });

        // Wait for connection
        await new Promise((resolve, reject) => {
            let connected = 0;
            const timeout = setTimeout(() => reject(new Error('Connection timeout')), 10000);
            const onReady = () => { 
                connected++; 
                if (connected === 2) {
                    clearTimeout(timeout);
                    resolve();
                }
            };
            publisher.on('ready', onReady);
            subscriber.on('ready', onReady);
            publisher.once('error', (err) => { if (!isConnected) { clearTimeout(timeout); reject(err); } });
            subscriber.once('error', (err) => { if (!isConnected) { clearTimeout(timeout); reject(err); } });
        });

        // Add persistent error handlers to prevent crash
        publisher.on('error', (err) => logger.warn(`[Redis Publisher] Error: ${err.message}`));
        subscriber.on('error', (err) => logger.warn(`[Redis Subscriber] Error: ${err.message}`));

        isConnected = true;
        logger.info('✅ Redis publisher connected');

        // Subscribe to channels
        const channels = Object.values(REDIS_CHANNELS);
        await subscriber.subscribe(...channels);
        logger.info(`✅ Redis subscribed to: ${channels.join(', ')}`);

        // Handle incoming messages (from customer server)
        subscriber.on('message', (channel, message) => {
            logger.info(`[Redis] Raw message on ${channel}: ${message.substring(0, 100)}...`);
            try {
                const data = JSON.parse(message);
                logger.info(`[Redis] Parsed message from ${data.source}`);
                // Skip messages from self
                if (data.source === 'admin-server') {
                    logger.debug(`[Redis] Skipping self-message`);
                    return;
                }
                logger.info(`[Redis] Processing message from ${channel}`);
                if (onMessage) onMessage(channel, data);
            } catch (error) {
                logger.error(`[Redis] Parse error: ${error.message}`);
            }
        });

    } catch (error) {
        isConnected = false;
        // Clean up failed connections
        if (publisher) { try { await publisher.quit(); } catch (e) {} publisher = null; }
        if (subscriber) { try { await subscriber.quit(); } catch (e) {} subscriber = null; }
        logger.warn(`[Redis] Connection failed (optional feature): ${error.message}`);
    }
};

/**
 * Disconnect Redis
 */
export const disconnectRedis = async () => {
    isConnected = false;
    if (subscriber) { await subscriber.unsubscribe(); await subscriber.quit(); }
    if (publisher) await publisher.quit();
};

export default { REDIS_CHANNELS, publishEvent, connectRedis, disconnectRedis };
