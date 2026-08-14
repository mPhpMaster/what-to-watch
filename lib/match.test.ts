import { describe, expect, it } from "vitest";
import catalog from "../data/titles.json";
import { byPopularity, match, scoreTitle } from "./match";
import { isReachable, type QuizAnswers, type Title } from "./types";

const ALL = catalog as Title[];

const base: QuizAnswers = {
  mood: "laugh",
  who: "friends",
  time: "movie",
  fam: "new",
  kids: false,
};

function make(over: Partial<Title>): Title {
  return {
    id: "x",
    titleAr: "س",
    titleEn: "X",
    year: 2020,
    kind: "movie",
    genresAr: [],
    moods: ["laugh"],
    timeBucket: "movie",
    familyFriendly: true,
    audience: ["alone"],
    iconic: false,
    popularity: 50,
    overviewAr: "",
    platforms: { shahid: true, netflix: false },
    ...over,
  };
}

describe("catalog integrity", () => {
  it("has unique ids", () => {
    const ids = ALL.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has no unreachable titles", () => {
    expect(ALL.filter((t) => !isReachable(t))).toEqual([]);
  });

  it("gives every title at least one mood", () => {
    expect(ALL.filter((t) => t.moods.length === 0)).toEqual([]);
  });
});

describe("hard filters", () => {
  it("never returns an unreachable title", () => {
    const pool = [
      make({ id: "ghost", platforms: { shahid: false, netflix: false }, popularity: 100 }),
      make({ id: "real", popularity: 1 }),
    ];
    const { best, backups } = match(pool, base);
    expect(best?.id).toBe("real");
    expect([best, ...backups].map((t) => t?.id)).not.toContain("ghost");
  });

  it("drops non-family titles when the user asked for family-safe", () => {
    const pool = [
      make({ id: "adult", familyFriendly: false, popularity: 100 }),
      make({ id: "safe", familyFriendly: true, popularity: 1 }),
    ];
    const { best } = match(pool, { ...base, kids: true });
    expect(best?.id).toBe("safe");
  });

  it("keeps the family filter even when it has to relax the mood", () => {
    // No family-friendly horror exists in the catalog by design.
    const { best, backups, relaxed } = match(ALL, {
      ...base,
      mood: "horror",
      kids: true,
    });
    expect(relaxed).toBe(true);
    for (const t of [best, ...backups]) {
      expect(t?.familyFriendly).toBe(true);
    }
  });

  it("returns an empty result rather than violating a filter", () => {
    const pool = [make({ id: "adult", familyFriendly: false })];
    expect(match(pool, { ...base, kids: true })).toEqual({
      best: null,
      backups: [],
      relaxed: true,
    });
  });
});

describe("scoring", () => {
  it("ranks mood above popularity", () => {
    const pool = [
      make({ id: "wrong-mood", moods: ["horror"], popularity: 100 }),
      make({ id: "right-mood", moods: ["laugh"], popularity: 0 }),
    ];
    expect(match(pool, base).best?.id).toBe("right-mood");
  });

  it("prefers an exact time bucket over a near one", () => {
    const short = make({ id: "short", timeBucket: "short" });
    const movie = make({ id: "movie", timeBucket: "movie" });
    expect(scoreTitle(movie, base)).toBeGreaterThan(scoreTitle(short, base));
  });

  it("scores short and binge as unrelated, not adjacent", () => {
    const binge = make({ id: "binge", timeBucket: "binge" });
    const movie = make({ id: "movie", timeBucket: "movie" });
    const answers: QuizAnswers = { ...base, time: "short" };
    // movie is adjacent to short, binge is not.
    expect(scoreTitle(movie, answers)).toBeGreaterThan(scoreTitle(binge, answers));
  });

  it("matches iconic titles to 'أعرفه وأحبه' and discoveries to 'جديد علي'", () => {
    const iconic = make({ id: "iconic", iconic: true });
    const fresh = make({ id: "fresh", iconic: false });
    expect(scoreTitle(iconic, { ...base, fam: "known" })).toBeGreaterThan(
      scoreTitle(fresh, { ...base, fam: "known" }),
    );
    expect(scoreTitle(fresh, { ...base, fam: "new" })).toBeGreaterThan(
      scoreTitle(iconic, { ...base, fam: "new" }),
    );
  });

  it("uses company as a tiebreaker", () => {
    const withFriends = make({ id: "friends", audience: ["friends"] });
    const solo = make({ id: "solo", audience: ["alone"] });
    expect(scoreTitle(withFriends, base)).toBeGreaterThan(scoreTitle(solo, base));
  });
});

describe("determinism and shape", () => {
  it("returns the same result for the same answers", () => {
    const a = match(ALL, base);
    const b = match(ALL, base);
    expect(a.best?.id).toBe(b.best?.id);
    expect(a.backups.map((t) => t.id)).toEqual(b.backups.map((t) => t.id));
  });

  it("returns a hero plus exactly three backups, all distinct", () => {
    const { best, backups } = match(ALL, base);
    expect(best).not.toBeNull();
    expect(backups).toHaveLength(3);
    const ids = [best!.id, ...backups.map((t) => t.id)];
    expect(new Set(ids).size).toBe(4);
  });

  it("gives a different hero on retake", () => {
    const first = match(ALL, base, 0).best?.id;
    const second = match(ALL, base, 1).best?.id;
    const third = match(ALL, base, 2).best?.id;
    expect(second).not.toBe(first);
    expect(third).not.toBe(second);
  });

  it("wraps the rotation instead of running out of titles", () => {
    const pool = [make({ id: "a" }), make({ id: "b" }), make({ id: "c" }), make({ id: "d" })];
    const { best, backups } = match(pool, base, 3);
    expect(best).not.toBeNull();
    expect(backups).toHaveLength(3);
  });

  it("does not flag relaxed when the mood alone fills the result", () => {
    expect(match(ALL, base).relaxed).toBe(false);
  });

  it("covers every mood with at least four titles when kids mode is off", () => {
    for (const mood of ["laugh", "thrill", "horror", "drama", "chill"] as const) {
      const r = match(ALL, { ...base, mood });
      expect(r.relaxed, `mood ${mood} should not need relaxing`).toBe(false);
      expect(r.best!.moods).toContain(mood);
    }
  });
});

describe("byPopularity", () => {
  it("sorts descending and drops unreachable titles", () => {
    const pool = [
      make({ id: "low", popularity: 10 }),
      make({ id: "ghost", popularity: 99, platforms: { shahid: false, netflix: false } }),
      make({ id: "high", popularity: 90 }),
    ];
    expect(byPopularity(pool).map((t) => t.id)).toEqual(["high", "low"]);
  });
});
