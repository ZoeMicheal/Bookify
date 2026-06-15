export const getCurrentBillingPeriodStart = (): Date => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
}

export const PLAN_LIMITS = {
    FREE: {
        maxDurationMinutes: Infinity,
        maxSessionsPerPeriod: Infinity,
        maxConcurrentSessions: Infinity,
    },
    PRO: {
        maxDurationMinutes: Infinity,
        maxSessionsPerPeriod: Infinity,
        maxConcurrentSessions: Infinity,
    }
};

export const getSubscriptionForUser = async (clerkId: string) => {
    // For now, return FREE plan limits for all users
    // This can be expanded to fetch from a database later
    return PLAN_LIMITS.FREE;
};