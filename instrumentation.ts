/**
 * Instrumentation runs in both Node and Edge. Do not import dbConnect/mongoose here,
 * as Mongoose's Edge bundle does not support mongoose.set() and would throw.
 * Seed is triggered on first DB connection in Node (see dbConnect.utils.ts).
 */
export async function register() {}
