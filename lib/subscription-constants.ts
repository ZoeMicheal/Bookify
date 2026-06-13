export const getCurrentBillingPeriodStart = (): Date => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
}

export const PLAN_LIMITS = {
    FREE: {
        maxDurationMinutes: 10,
        maxSessionsPerPeriod: 5,
        maxConcurrentSessions: 1,
    },
    PRO: {
        maxDurationMinutes: 60,
        maxSessionsPerPeriod: 100,
        maxConcurrentSessions: 2,
    }
};

export const getSubscriptionForUser = async (clerkId: string) => {
    // For now, return FREE plan limits for all users
    // This can be expanded to fetch from a database later
    return PLAN_LIMITS.FREE;
};