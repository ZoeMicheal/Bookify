'use server';

import {connectToDatabase} from "@/database/mongoose";
import VoiceSession from "@/database/models/book.session.model";
import {getCurrentBillingPeriodStart} from "@/lib/subscription-constants";
import { StartSessionResult } from "@/types";

export const startVoiceSession = async (clerkId: string, bookId: string): Promise<StartSessionResult> => {
    try {
        await connectToDatabase();

        //Limits/plan to see whether a session is allowed

        const session = await VoiceSession.create({
            clerkId, bookId,
            startedAt: new Date(),
            billingPeriodStart: getCurrentBillingPeriodStart(),
            durationSeconds: 0,
        });

        return {
            success: true,
            sessionId: session._id.toString(),
            // maxDurationMinutes: check.maxDurationMinutes,
        }
    } catch (e) {
        console.error('Error starting voice session', e);
        return { success: false, error: 'Failed to start a voice session. Please try again later.' }
    }
}


export const endVoiceSession = async (sessionId: string, durationSeconds: number): Promise<{ success: boolean; error?: string }> => {
    try {
        await connectToDatabase();

        const session = await VoiceSession.findByIdAndUpdate(sessionId, {
            endedAt: new Date(),
            durationSeconds
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
