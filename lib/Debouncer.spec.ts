import { describe, expect, it } from "vitest";
import { debounce, Debouncer } from "./Debouncer.js";
import { pauseFor } from "./misc.js";

describe("Debouncer", () => {
  //#region deltaT
  it("deltaT test with type \"immediate\"", async () => {
    const deb = new Debouncer(200, "immediate");

    deb.addListener(debCalled);

    const deltaTs: number[] = [];
    let lastCall: number | undefined;
    function debCalled() {
      const n = Date.now(),
        deltaT = lastCall ? n - lastCall : undefined;
      typeof deltaT === "number" && deltaT > 0 && deltaTs.push(deltaT);
      lastCall = n;
    }

    for(let i = 0; i < 2; i++) {
      for(let j = 0; j < 6; j++) {
        deb.call(i, j);
        expect(deb.isTimeoutActive()).toBe(true);
        await pauseFor(50);
      }
      await pauseFor(300);
    }

    const avg = deltaTs
      .reduce((a, b) => a + b, 0) / deltaTs.length;

    expect(avg + 10).toBeLessThanOrEqual(deb.getTimeout() + 50);
  });

  //#region idle
  it("deltaT test with type \"idle\"", async () => {
    const deb = new Debouncer(200, "idle");

    deb.addListener(debCalled);

    const deltaTs: number[] = [];
    let callCount = 0;
    let lastCall: number | undefined;
    function debCalled() {
      callCount++;
      const n = Date.now(),
        deltaT = lastCall ? n - lastCall : undefined;
      typeof deltaT === "number" && deltaT > 0 && deltaTs.push(deltaT);
      lastCall = n;
    }

    const jAmt = 6,
      iTime = 400,
      jTime = 30;
    for(let i = 0; i < 2; i++) {
      for(let j = 0; j < jAmt; j++) {
        deb.call(i, j);
        await pauseFor(jTime);
      }
      await pauseFor(iTime);
    }

    expect(callCount).toBeLessThanOrEqual(5); // expected 2~3 calls

    /** Minimum possible deltaT between calls */
    const minDeltaT = jAmt * jTime + iTime;
    const avg = deltaTs
      .reduce((a, b) => a + b, 0) / deltaTs.length;

    expect(avg + 10).toBeGreaterThanOrEqual(minDeltaT);
  });

  //#region modify props & listeners
  it("Modify props and listeners", async () => {
    const deb = new Debouncer(200);

    expect(deb.getTimeout()).toBe(200);
    deb.setTimeout(10);
    expect(deb.getTimeout()).toBe(10);

    expect(deb.getType()).toBe("immediate");
    deb.setType("idle");
    expect(deb.getType()).toBe("idle");

    const l = () => {};
    deb.addListener(l);
    deb.addListener(() => {});
    expect(deb.getListeners()).toHaveLength(2);

    deb.removeListener(l);
    expect(deb.getListeners()).toHaveLength(1);

    deb.removeAllListeners();
    expect(deb.getListeners()).toHaveLength(0);
  });

  //#region all methods
  // TODO:FIXME:
  it.skip("All methods", async () => {
    const deb = new Debouncer<(v?: number) => void>(200);

    let callAmt = 0, evtCallAmt = 0;
    const debCalled = (): number => ++callAmt;
    const debCalledEvt = (): number => ++evtCallAmt;

    // hook debCalled first, then call, then hook debCalledEvt:
    deb.addListener(debCalled);

    deb.call();

    deb.on("call", debCalledEvt);

    expect(callAmt).toBe(1);
    expect(evtCallAmt).toBe(0);

    deb.setTimeout(10);
    expect(deb.getTimeout()).toBe(10);

    const callPaused = (v?: number): Promise<void> => {
      deb.call(v);
      return pauseFor(50);
    };

    let onceAmt = 0;
    deb.once("call", () => ++onceAmt);
    await callPaused();
    await callPaused();
    await callPaused();
    expect(onceAmt).toBe(1);

    let args = 0;
    const setArgs = (v?: number) => args = v ?? args;
    deb.addListener(setArgs);
    await callPaused(1);
    expect(args).toBe(1);

    deb.removeListener(setArgs);
    await callPaused(2);
    expect(args).toBe(1);

    deb.removeAllListeners();
    await callPaused();
    expect(callAmt).toEqual(evtCallAmt + 1); // evtCallAmt is always behind by 1
  });

  //#region errors
  it("Errors", () => {
    try {
      // @ts-expect-error
      const deb = new Debouncer(200, "invalid");
      deb.call();
    }
    catch(e) {
      expect(e).toBeInstanceOf(TypeError);
    }
  });

  //#region debounce function
  it("Debounce function", async () => {
    let callAmt = 0;
    const callFn = debounce(() => ++callAmt, 200);

    for(let i = 0; i < 4; i++) {
      callFn();
      await pauseFor(25);
    }

    expect(callAmt).toBe(1);
  });
});
  