/**
 * @module lib/array
 * This module contains various functions for working with arrays - [see the documentation for more info](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#arrays)
 */

import { randRange } from "./math.js";

/** Describes an array with at least one item */
export type NonEmptyArray<TArray = unknown> = [TArray, ...TArray[]];

/** Returns a random item from the passed array */
export function randomItem<TItem = unknown>(array: TItem[]): TItem | undefined {
  return randomItemIndex<TItem>(array)[0];
}

/**
 * Returns a tuple of a random item and its index from the passed array  
 * Returns `[undefined, undefined]` if the passed array is empty
 */
export function randomItemIndex<TItem = unknown>(array: TItem[]): [item?: TItem, index?: number] {
  if(array.length === 0)
    return [undefined, undefined];

  const idx = randRange(array.length - 1);

  return [array[idx]!, idx];
}

/** Returns a random item from the passed array and mutates the array to remove the item */
export function takeRandomItem<TItem = unknown>(arr: TItem[]): TItem | undefined {
  const [itm, idx] = randomItemIndex<TItem>(arr);

  if(idx === undefined)
    return undefined;

  arr.splice(idx, 1);
  return itm as TItem;
}

/** Returns a copy of the array with its items in a random order */
export function randomizeArray<TItem = unknown>(array: TItem[]): TItem[] {
  const retArray = [...array]; // so array and retArray don't point to the same memory address

  if(array.length === 0)
    return retArray;

  // shamelessly stolen from https://javascript.info/task/shuffle
  for(let i = retArray.length - 1; i > 0; i--) {
    const j = Math.floor((Math.random() * (i + 1)));
    [retArray[i], retArray[j]] = [retArray[j], retArray[i]] as [TItem, TItem];
  }

  return retArray;
}
