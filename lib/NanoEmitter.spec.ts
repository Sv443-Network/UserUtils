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
  });
});
