import { randRange } from "./math";

/** Returns a random item from the passed array */
export function randomItem<T = unknown>(array: T[]) {
  return randomItemIndex<T>(array)[0];
}

/**
 * Returns a tuple of a random item and its index from the passed array  
 * Returns `[undefined, undefined]` if the passed array is empty
 */
export function randomItemIndex<T = unknown>(array: T[]): [item?: T, index?: number] {
  if(array.length === 0)
    return [undefined, undefined];

  const idx = randRange(array.length - 1);

  return [array[idx]!, idx];
}

/** Returns a random item from the passed array and mutates the array to remove the item */
export function takeRandomItem<T = unknown>(arr: T[]) {
  const [itm, idx] = randomItemIndex<T>(arr);

  if(idx === undefined)
    return undefined;

  arr.splice(idx, 1);
  return itm as T;
}

/** Returns a copy of the array with its items in a random order */
export function randomizeArray<T = unknown>(array: T[]) {
  const retArray = [...array]; // so array and retArray don't point to the same memory address

  if(array.length === 0)
    return array;

  // shamelessly stolen from https://javascript.info/task/shuffle
  for(let i = retArray.length - 1; i > 0; i--) {
    const j = Math.floor((randRange(0, 10000) / 10000) * (i + 1));
    // @ts-ignore
    [retArray[i], retArray[j]] = [retArray[j], retArray[i]];
  }

  return retArray;
}
