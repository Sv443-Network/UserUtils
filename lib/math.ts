/** Ensures the passed {@linkcode value} always stays between {@linkcode min} and {@linkcode max} */
export function clamp(value: number, min: number, max: number) {
  return Math.max(Math.min(value, max), min);
}

/**
 * Transforms the value parameter from the numerical range `range1min─range1max` to the numerical range `range2min─range2max`  
 * For example, you can map the value 2 in the range of 0-5 to the range of 0-10 and you'd get a 4 as a result.
 */
export function mapRange(value: number, range1min: number, range1max: number, range2min: number, range2max: number) {
  if(Number(range1min) === 0.0 && Number(range2min) === 0.0)
    return value * (range2max / range1max);

  return (value - range1min) * ((range2max - range2min) / (range1max - range1min)) + range2min;
}

/** Returns a random number between {@linkcode min} and {@linkcode max} (inclusive) */
export function randRange(min: number, max: number): number
/** Returns a random number between 0 and {@linkcode max} (inclusive) */
export function randRange(max: number): number
/** Returns a random number between {@linkcode min} and {@linkcode max} (inclusive) */
export function randRange(...args: number[]): number {
  let min: number, max: number;

  // using randRange(min, max)
  if(typeof args[0] === "number" && typeof args[1] === "number")
    [ min, max ] = args;
  // using randRange(max)
  else if(typeof args[0] === "number" && typeof args[1] !== "number") {
    min = 0;
    [ max ] = args;
  }
  else
    throw new TypeError(`Wrong parameter(s) provided - expected: "number" and "number|undefined", got: "${typeof args[0]}" and "${typeof args[1]}"`);

  min = Number(min);
  max = Number(max);

  if(isNaN(min) || isNaN(max))
    return NaN;

  if(min > max)
    throw new TypeError("Parameter \"min\" can't be bigger than \"max\"");

  return Math.floor(Math.random() * (max - min + 1)) + min;
}
