/** Ensures the passed `value` always stays between `min` and `max` */
export function clamp(value: number, min: number, max: number) {
  return Math.max(Math.min(value, max), min);
}

/**
 * Transforms the value parameter from the numerical range `range_1_min-range_1_max` to the numerical range `range_2_min-range_2_max`  
 * For example, you can map the value 2 in the range of 0-5 to the range of 0-10 and you'd get a 4 as a result.
 */
export function mapRange(value: number, range_1_min: number, range_1_max: number, range_2_min: number, range_2_max: number) {
  if(Number(range_1_min) === 0.0 && Number(range_2_min) === 0.0)
    return value * (range_2_max / range_1_max);

  return (value - range_1_min) * ((range_2_max - range_2_min) / (range_1_max - range_1_min)) + range_2_min;
}

/** Returns a random number between `min` and `max` (inclusive) */
export function randRange(min: number, max: number): number
/** Returns a random number between 0 and `max` (inclusive) */
export function randRange(max: number): number
/** Returns a random number between `min` and `max` (inclusive) */
export function randRange(...args: number[]): number {
  let min: number, max: number;

  if(typeof args[0] === "number" && typeof args[1] === "number") {
    // using randRange(min, max)
    [ min, max ] = args;
  }
  else if(typeof args[0] === "number" && typeof args[1] !== "number") {
    // using randRange(max)
    min = 0;
    max = args[0];
  }
  else
    throw new TypeError(`Wrong parameter(s) provided - expected: "number" and "number|undefined", got: "${typeof args[0]}" and "${typeof args[1]}"`);

  min = Number(min);
  max = Number(max);

  if(isNaN(min) || isNaN(max))
    throw new TypeError("Parameters \"min\" and \"max\" can't be NaN");

  if(min > max)
    throw new TypeError("Parameter \"min\" can't be bigger than \"max\"");

  return Math.floor(Math.random() * (max - min + 1)) + min;
}
