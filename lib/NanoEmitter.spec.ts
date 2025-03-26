import { describe, expect, it } from "vitest";
import { NanoEmitter } from "./NanoEmitter.js";

describe("NanoEmitter", () => {
  it("Functional", async () => {
    const evts = new NanoEmitter<{
      val: (v1: number, v2: number) => void;
    }>({
      publicEmit: true,
    });

    setTimeout(() => evts.emit("val", 5, 5), 1);
    const [v1, v2] = await evts.once("val");
    expect(v1 + v2).toBe(10);

    let v3 = 0, v4 = 0;
    const unsub = evts.on("val", (v1, v2) => {
      v3 = v1;
      v4 = v2;
    });
    evts.emit("val", 10, 10);
    expect(v3 + v4).toBe(20);

    unsub();
    evts.emit("val", 20, 20);
    expect(v3 + v4).toBe(20);

    evts.on("val", (v1, v2) => {
      v3 = v1;
      v4 = v2;
    });
    evts.emit("val", 30, 30);
    expect(v3 + v4).toBe(60);
    evts.unsubscribeAll();
    evts.emit("val", 40, 40);
    expect(v3 + v4).toBe(60);
  });

  it("Object oriented", async () => {
    class MyEmitter extends NanoEmitter<{
      val: (v1: number, v2: number) => void;
    }> {
      constructor() {
        super({ publicEmit: false });
      }

      run() {
        this.events.emit("val", 5, 5);
      }
    }

    const evts = new MyEmitter();

    setTimeout(() => evts.run(), 1);
    const [v1, v2] = await evts.once("val");
    expect(v1 + v2).toBe(10);

    expect(evts.emit("val", 0, 0)).toBe(false);
  });
});
