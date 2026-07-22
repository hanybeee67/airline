/** Weeks per month, used to convert weekly figures into monthly ones. */
export const WEEKS_PER_MONTH = 4.33;

/** Hours per week an aircraft can realistically be kept in the air. */
export const WEEKLY_UTILIZATION_HOURS = 90;

/** Ground time added per landing/takeoff cycle, in hours. */
export const TURNAROUND_HOURS = 1.5;

/** Base fuel price, dollars per liter (before event modifiers). */
export const BASE_FUEL_PRICE_PER_LITER = 0.85;

/** Average monthly cost per crew member employed. */
export const CREW_COST_PER_MONTH = 7_500;

/** One-time cost to hire and train a single crew member. */
export const CREW_TRAINING_COST = 25_000;

/** Months of lead time before newly trained crew are available. */
export const CREW_TRAINING_MONTHS = 1;

/**
 * Scales the gravity demand model. Tuned so a dense hub-to-hub pair generates
 * on the order of tens of thousands of monthly origin/destination travelers,
 * enough to fill modern widebodies flown daily.
 */
export const DEMAND_CONSTANT = 26;

/** Reference fare the market considers "fair", in dollars per km flown. */
export const REFERENCE_FARE_PER_KM = 0.14;

/** How strongly demand reacts to fares deviating from the reference fare. */
export const FARE_ELASTICITY = 1.5;

/** Fraction of a hub-pair's demand that also shows up as connecting traffic. */
export const CONNECTION_DEMAND_SHARE = 0.35;

/** Condition points an aircraft loses per month of active service. */
export const CONDITION_DECAY_PER_MONTH = 0.9;

/** Below this condition, maintenance costs start climbing. */
export const CONDITION_MAINTENANCE_THRESHOLD = 60;

/** Annual interest rate charged on loans. */
export const LOAN_ANNUAL_RATE = 0.09;

/** Default loan term in months. */
export const LOAN_TERM_MONTHS = 60;

/** A loan cannot exceed this multiple of the airline's current cash + fleet value. */
export const LOAN_MAX_LEVERAGE = 2.5;

/** Starting cash for the player and each AI airline. */
export const STARTING_CASH = 220_000_000;

/** Consecutive months of negative cash before an airline goes bankrupt. */
export const BANKRUPTCY_GRACE_MONTHS = 3;
