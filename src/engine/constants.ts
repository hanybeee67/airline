/** Weeks per month, used to convert weekly figures into monthly ones. */
export const WEEKS_PER_MONTH = 4.33;

/** Hours per week an aircraft can realistically be kept in the air (rest, turnaround, checks eat the rest). */
export const WEEKLY_UTILIZATION_HOURS = 70;

/** Ground time added per landing/takeoff cycle, in hours. */
export const TURNAROUND_HOURS = 1.5;

/** Fuel price, dollars per liter. */
export const FUEL_PRICE_PER_LITER = 0.85;

/** Average monthly crew cost per crew member required by an aircraft type. */
export const CREW_COST_PER_MONTH = 9_000;

/** Tuning constant for the gravity demand model; scaled so mid-size market pairs land in the low thousands per month. */
export const DEMAND_CONSTANT = 8;

/** Reference fare used as the "expected" price point, dollars per km of one-way distance. */
export const REFERENCE_FARE_PER_KM = 0.12;

/** How strongly demand reacts to fares deviating from the reference fare. */
export const FARE_ELASTICITY = 1.4;

/** Condition points an aircraft loses per month of active service. */
export const CONDITION_DECAY_PER_MONTH = 1.2;

/** Below this condition, maintenance costs start climbing. */
export const CONDITION_MAINTENANCE_THRESHOLD = 60;
