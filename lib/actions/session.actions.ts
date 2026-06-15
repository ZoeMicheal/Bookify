'use server';

import {connectToDatabase} from "@/database/mongoose";
import VoiceSession from "@/database/models/book.session.model";
import {getCurrentBillingPeriodStart, getSubscriptionForUser} from "@/lib/subscription-constants";
import { Messages, StartSessionResult } from "@/types";

export const startVoiceSession = async (clerkId: string, bookId: string): Promise<StartSessionResult> => {
    try {
        await connectToDatabase();

        const subscription = await getSubscriptionForUser(clerkId);
        const billingPeriodStart = getCurrentBillingPeriodStart();

        // 1. Check concurrent active sessions
        // Auto-end sessions that have been active for more than 1 hour as they are likely "zombie" sessions
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        await VoiceSession.updateMany(
            {
                clerkId,
                endedAt: { $exists: false },
                startedAt: { $lt: oneHourAgo }
            },
            {
                $set: { endedAt: new Date(), durationSeconds: 3600 } // Cap at 1 hour for zombie sessions
            }
        );

        const activeSessionsCount = await VoiceSession.countDocuments({
            clerkId,
            endedAt: { $exists: false }
        });

        if (subscription.maxConcurrentSessions !== Infinity && activeSessionsCount >= subscription.maxConcurrentSessions) {
            return {
                success: false,
                error: `You already have ${activeSessionsCount} active session(s). Please end them before starting a new one.`
            };
        }

        // 2. Check total sessions in current period
        if (subscription.maxSessionsPerPeriod !== Infinity) {
            const periodSessionsCount = await VoiceSession.countDocuments({
                clerkId,
                billingPeriodStart: { $gte: billingPeriodStart }
            });

            if (periodSessionsCount >= subscription.maxSessionsPerPeriod) {
                return {
                    success: false,
                    error: `You have reached your limit of ${subscription.maxSessionsPerPeriod} sessions for this billing period.`
                };
            }
        }

        // 3. Check total duration in current period
        if (subscription.maxDurationMinutes !== Infinity) {
            const periodUsage = await VoiceSession.aggregate([
                {
                    $match: {
                        clerkId,
                        billingPeriodStart: { $gte: billingPeriodStart }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalDurationSeconds: { $sum: "$durationSeconds" }
                    }
                }
            ]);

            const totalDurationMinutes = periodUsage.length > 0 ? periodUsage[0].totalDurationSeconds / 60 : 0;
            if (totalDurationMinutes >= subscription.maxDurationMinutes) {
                return {
                    success: false,
                    error: `You have reached your limit of ${subscription.maxDurationMinutes} minutes for this billing period.`
                };
            }
        }

        const session = await VoiceSession.create({
            clerkId, bookId,
            startedAt: new Date(Date.now()),
            billingPeriodStart,
            durationSeconds: 0,
        });

        return {
            success: true,
            sessionId: session._id.toString(),
            maxDurationMinutes: subscription.maxDurationMinutes,
        }
    } catch (e) {
        console.error('Error starting voice session', e);
        return { success: false, error: 'Failed to start a voice session. Please try again later.' }
    }
}


export const endVoiceSession = async (sessionId: string, durationSeconds: number, transcript?: Messages[]): Promise<{ success: boolean; error?: string }> => {
    try {
        await connectToDatabase();

        const session = await VoiceSession.findByIdAndUpdate(sessionId, {
            endedAt: new Date(Date.now()),
            durationSeconds,
            transcript: transcript || []
        });

        if (!session) {
            return { success: false, error: 'Voice session not found' };
        }

        return { success: true };
    } catch (e) {
        console.error('Error ending voice session', e);
        return { success: false, error: 'Failed to end voice session. Please try again later.' };
    }
}
