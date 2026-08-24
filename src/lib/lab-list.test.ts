import { describe, expect, it } from "vitest";
import { LAB_PAGE_SIZE, paginate } from "./lab-list";

describe("lab dispatch pagination", () => {
  it("keeps the newest 15 on page 1 and older rows on later pages", () => {
    const newestFirst = Array.from({ length: 37 }, (_, i) => `DSP-${String(37 - i).padStart(3, "0")}`);
    const page1 = paginate(newestFirst, 1);
    const page2 = paginate(newestFirst, 2);
    const page3 = paginate(newestFirst, 3);

    expect(LAB_PAGE_SIZE).toBe(15);
    expect(page1.items).toEqual(newestFirst.slice(0, 15));
    expect(page1.from).toBe(1);
    expect(page1.to).toBe(15);
    expect(page1.total).toBe(37);
    expect(page1.totalPages).toBe(3);

    expect(page2.items[0]).toBe("DSP-022");
    expect(page2.items).toHaveLength(15);
    expect(page3.items).toHaveLength(7);
    expect(page3.items.at(-1)).toBe("DSP-001");
  });

  it("clamps an out-of-range page onto the last page", () => {
    const items = ["a", "b", "c"];
    const slice = paginate(items, 9, 2);
    expect(slice.page).toBe(2);
    expect(slice.items).toEqual(["c"]);
  });
});
