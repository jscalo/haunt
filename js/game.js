const V = new URL(import.meta.url).search || "";
const { WM, Engine } = await import("./engine.js" + V);
const { Runtime } = await import("./runtime.js" + V);
const { createRules } = await import("./rules.generated.js" + V);

export function patchRules(rt) {
    const nextIdx = 900;
    return [
        {
            name: "patch_long_hall_east",
            priority: 0,
            sourceIndex: nextIdx + 30,
            conditions: [
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_const", value: "long_hall" }] },
                { cls: "status", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "going", op: "eq_const", value: "e" }] },
            ],
            action: async (m, wm, term) => {
                rt.modify(m.$1, { name: "upper_hall" });
                rt.modify(m.$2, { going: null });
            },
        },
        {
            name: "patch_long_hall_south",
            priority: 0,
            sourceIndex: nextIdx + 31,
            conditions: [
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_const", value: "long_hall" }] },
                { cls: "status", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "going", op: "eq_const", value: "s" }] },
            ],
            action: async (m, wm, term) => {
                rt.write("\n", "You force your way through the boarded-up doorway.");
                rt.modify(m.$1, { name: "bedroom" });
                rt.modify(m.$2, { going: null });
            },
        },
        {
            name: "patch_dig_undug",
            priority: 0,
            sourceIndex: nextIdx + 40,
            conditions: [
                { cls: "input", isPositional: true, prefixLength: 1, negated: false,
                  tests: [{ index: 0, op: "eq_const", value: "dig" }] },
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [
                      { field: "name", op: "eq_const", value: "lawn" },
                      { field: "side", op: "eq_const", value: "in" },
                      { field: "east", op: "eq_const", value: "8" },
                      { field: "north", op: "eq_const", value: "8" },
                  ] },
                { cls: "history", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "grave_status", op: "eq_const", value: "undug" }] },
            ],
            action: async (m, wm, term) => {
                rt.remove(m.$1);
                rt.modify(m.$3, { grave_status: "dug" });
                rt.write("\n", "Luckily, the dirt is soft.");
            },
        },
        {
            name: "patch_dig_dug",
            priority: 0,
            sourceIndex: nextIdx + 41,
            conditions: [
                { cls: "input", isPositional: true, prefixLength: 1, negated: false,
                  tests: [{ index: 0, op: "eq_const", value: "dig" }] },
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [
                      { field: "name", op: "eq_const", value: "lawn" },
                      { field: "side", op: "eq_const", value: "in" },
                      { field: "east", op: "eq_const", value: "8" },
                      { field: "north", op: "eq_const", value: "8" },
                  ] },
                { cls: "history", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "grave_status", op: "eq_const", value: "dug" }] },
            ],
            action: async (m, wm, term) => {
                rt.remove(m.$1);
                rt.modify(m.$3, { grave_status: "deep" });
            },
        },
        {
            name: "patch_pull_lever",
            priority: 0,
            sourceIndex: nextIdx + 42,
            conditions: [
                { cls: "input", isPositional: true, prefixLength: 2, negated: false,
                  tests: [
                      { index: 0, op: "eq_const", value: "pull" },
                      { index: 1, op: "eq_const", value: "lever" },
                  ] },
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [
                      { field: "name", op: "eq_const", value: "lawn" },
                      { field: "side", op: "eq_const", value: "in" },
                      { field: "east", op: "eq_const", value: "8" },
                      { field: "north", op: "eq_const", value: "8" },
                  ] },
                { cls: "history", isPositional: false, prefixLength: null, negated: false,
                  tests: [
                      { field: "grave_status", op: "eq_const", value: "deep" },
                      { field: "grave_status2", op: "neq_const", value: "oil" },
                  ] },
                { cls: "time", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "realtime", op: "eq_var", var: "_rt" }] },
                { cls: "fixed", isPositional: true, prefixLength: 0, negated: true, tests: [] },
            ],
            action: async (m, wm, term) => {
                rt.remove(m.$1);
                rt.write("\n", "Ummph!");
                rt.modify(m.$3, { grave_status2: "oil" });
                rt.modify(m.$4, { oil_time: rt.compute(m._rt, "+", 30) });
            },
        },
        {
            name: "patch_enter_truck",
            priority: 0,
            sourceIndex: nextIdx + 50,
            conditions: [
                { cls: "input", isPositional: true, prefixLength: 2, negated: false,
                  tests: [
                      { index: 0, op: "in_set", set: ["mount", "enter"] },
                      { index: 1, op: "any" },
                  ] },
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [
                      { field: "name", op: "eq_const", value: "lawn" },
                      { field: "side", op: "eq_const", value: "in" },
                      { field: "east", op: "eq_const", value: "7" },
                      { field: "north", op: "eq_const", value: "5" },
                  ] },
                { cls: "object", isPositional: false, prefixLength: null, negated: false,
                  tests: [
                      { field: "name", op: "eq_const", value: "truck" },
                      { field: "place", op: "eq_const", value: "lawn" },
                      { field: "side", op: "eq_const", value: "in" },
                      { field: "east", op: "eq_const", value: "7" },
                      { field: "north", op: "eq_const", value: "5" },
                  ] },
                { cls: "portal", isPositional: false, prefixLength: null, negated: false,
                  tests: [
                      { field: "name", op: "eq_const", value: "truck" },
                      { field: "door", op: "eq_const", value: "open" },
                  ] },
                { cls: "status", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "score", op: "any" }] },
            ],
            action: async (m, wm, term) => {
                rt.remove(m.$1);
                rt.modify(m.$2, { name: "intruck", side: null, east: null, north: null });
                rt.write("\n", "You are in the back of the truck.");
            },
        },
        {
            name: "patch_close_truck_door",
            priority: 0,
            sourceIndex: nextIdx + 51,
            conditions: [
                { cls: "input", isPositional: true, prefixLength: 1, negated: false,
                  tests: [{ index: 0, op: "eq_const", value: "close" }] },
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_const", value: "intruck" }] },
                { cls: "portal", isPositional: false, prefixLength: null, negated: false,
                  tests: [
                      { field: "name", op: "eq_const", value: "truck" },
                      { field: "door", op: "eq_const", value: "open" },
                  ] },
            ],
            action: async (m, wm, term) => {
                rt.remove(m.$1);
                rt.modify(m.$3, { door: "closed" });
                rt.write("\n", "Ok.");
            },
        },
        {
            name: "patch_truck_escape",
            priority: 0,
            sourceIndex: -1,
            conditions: [
                { cls: "object", isPositional: false, prefixLength: null, negated: false,
                  tests: [
                      { field: "name", op: "eq_const", value: "truck" },
                      { field: "place", op: "eq_const", value: "lawn" },
                      { field: "side", op: "eq_const", value: "in" },
                      { field: "east", op: "eq_const", value: "7" },
                      { field: "north", op: "eq_const", value: "5" },
                  ] },
                { cls: "portal", isPositional: false, prefixLength: null, negated: false,
                  tests: [
                      { field: "name", op: "eq_const", value: "truck" },
                      { field: "door", op: "eq_const", value: "closed" },
                  ] },
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_const", value: "intruck" }] },
                { cls: "return", isPositional: true, prefixLength: 1, negated: false,
                  tests: [{ index: 0, op: "eq_var", var: "_retTime" }] },
                { cls: "time", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "realtime", op: "eq_var", var: "_retTime" }] },
                { cls: "input", isPositional: true, prefixLength: 1, negated: false,
                  tests: [{ index: 0, op: "eq_var", var: "_z" }] },
                { cls: "status", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "score", op: "any" }] },
            ],
            action: async (m, wm, term) => {
                rt.remove(m.$6);
                rt.remove(m.$4);
                rt.remove(m.$1);
                rt.modify(m.$5, { oil_status: "escaped" });
                rt.write("\n", "VaVoom! The truck has started up.");
                rt.write("\n", "Bump bump! You feel yourself being driven out of the yard.");
                rt.modify(m.$7, { going: "out" });
            },
        },
        {
            name: "patch_balcony_jump_safe",
            priority: 0,
            sourceIndex: nextIdx + 35,
            conditions: [
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_const", value: "balcony" }] },
                { cls: "input", isPositional: true, prefixLength: 1, negated: false,
                  tests: [{ index: 0, op: "eq_const", value: "jump" }] },
                { cls: "object", isPositional: false, prefixLength: null, negated: false,
                  tests: [
                      { field: "name", op: "eq_const", value: "mattress" },
                      { field: "place", op: "eq_const", value: "lawn" },
                      { field: "side", op: "eq_const", value: "in" },
                      { field: "east", op: "eq_const", value: "5" },
                      { field: "north", op: "eq_const", value: "6" },
                  ] },
                { cls: "status", isPositional: false, prefixLength: null, negated: false,
                  tests: [] },
            ],
            action: async (m, wm, term) => {
                rt.remove(m.$2);
                rt.modify(m.$1, { name: "lawn", side: "in", east: 5, north: 6 });
                rt.write("\n", "Luckily you land on the mattress.");
            },
        },
        {
            name: "patch_long_hall_desc",
            priority: 1,
            sourceIndex: nextIdx + 32,
            conditions: [
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_const", value: "long_hall" }] },
            ],
            action: async (m, wm, term) => {
                rt.write("\n", "You are in a long, narrow hallway.");
                rt.write("\n", "The upper hall is to the east. A boarded-up doorway leads south.");
            },
        },
        {
            name: "patch_secret_room_exit",
            priority: 0,
            sourceIndex: nextIdx + 33,
            conditions: [
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_const", value: "secret_room" }] },
                { cls: "status", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "going", op: "eq_const", value: "w" }] },
            ],
            action: async (m, wm, term) => {
                rt.modify(m.$1, { name: "upper_hall" });
                rt.modify(m.$2, { going: null });
            },
        },
        {
            name: "patch_ductf2_exit",
            priority: 0,
            sourceIndex: nextIdx + 34,
            conditions: [
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_const", value: "ductf2" }] },
                { cls: "status", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "going", op: "eq_const", value: "n" }] },
            ],
            action: async (m, wm, term) => {
                rt.modify(m.$1, { name: "kitchen" });
                rt.modify(m.$2, { going: null });
            },
        },
        {
            name: "patch_wine_cellar_exit",
            priority: 0,
            sourceIndex: nextIdx,
            conditions: [
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_const", value: "wine_cellar" }] },
                { cls: "status", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "going", op: "eq_const", value: "u" }] },
            ],
            action: async (m, wm, term) => {
                rt.modify(m.$1, { name: "secret_stairs" });
                rt.modify(m.$2, { going: null });
            },
        },
        {
            name: "patch_dark_room_exit",
            priority: 0,
            sourceIndex: nextIdx + 1,
            conditions: [
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_const", value: "dark_room" }] },
                { cls: "status", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "going", op: "eq_const", value: "n" }] },
            ],
            action: async (m, wm, term) => {
                rt.modify(m.$1, { name: "upper_hall" });
                rt.modify(m.$2, { going: null });
            },
        },
        {
            name: "patch_dull_room_exit",
            priority: 0,
            sourceIndex: nextIdx + 2,
            conditions: [
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_const", value: "dull_room" }] },
                { cls: "status", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "going", op: "eq_const", value: "s" }] },
            ],
            action: async (m, wm, term) => {
                rt.modify(m.$1, { name: "upper_hall" });
                rt.modify(m.$2, { going: null });
            },
        },
        {
            name: "patch_oil_status",
            priority: 0,
            sourceIndex: nextIdx + 20,
            conditions: [
                { cls: "history", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "grave_status2", op: "eq_const", value: "oil" }] },
                { cls: "time", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "oil_status", op: "eq_const", value: "nil" }] },
            ],
            action: async (m, wm, term) => {
                rt.modify(m.$2, { oil_status: "oil" });
            },
        },
        {
            name: "patch_oil_enter_marker",
            priority: 0,
            sourceIndex: nextIdx + 21,
            conditions: [
                { cls: "time", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "oil_status", op: "eq_const", value: "enter" }] },
                { cls: "enter", isPositional: true, prefixLength: 0, negated: true, tests: [] },
            ],
            action: async (m, wm, term) => {
                rt.make("enter", [m.$1.oil_time]);
            },
        },
        {
            name: "patch_oil_walk_marker",
            priority: 0,
            sourceIndex: nextIdx + 22,
            conditions: [
                { cls: "time", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "oil_status", op: "eq_const", value: "walk" }] },
                { cls: "walk", isPositional: true, prefixLength: 0, negated: true, tests: [] },
            ],
            action: async (m, wm, term) => {
                const old = wm.first("enter");
                if (old) rt.remove(old);
                rt.make("walk", [m.$1.oil_time]);
            },
        },
        {
            name: "patch_oil_fixit_marker",
            priority: 0,
            sourceIndex: nextIdx + 23,
            conditions: [
                { cls: "time", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "oil_status", op: "eq_const", value: "fixit" }] },
                { cls: "fixit", isPositional: true, prefixLength: 0, negated: true, tests: [] },
            ],
            action: async (m, wm, term) => {
                const old = wm.first("walk");
                if (old) rt.remove(old);
                rt.make("fixit", [m.$1.oil_time]);
            },
        },
        {
            name: "patch_oil_return_marker",
            priority: 0,
            sourceIndex: nextIdx + 24,
            conditions: [
                { cls: "time", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "oil_status", op: "eq_const", value: "return" }] },
                { cls: "return", isPositional: true, prefixLength: 0, negated: true, tests: [] },
            ],
            action: async (m, wm, term) => {
                const old = wm.first("fixit");
                if (old) rt.remove(old);
                rt.make("return", [m.$1.oil_time]);
            },
        },
        {
            name: "patch_save",
            priority: 0,
            sourceIndex: nextIdx + 10,
            conditions: [
                { cls: "x", isPositional: true, prefixLength: 1, negated: false,
                  tests: [{ index: 0, op: "eq_const", value: 30 }] },
                { cls: "input", isPositional: true, prefixLength: 0, negated: false,
                  tests: [{ index: 0, op: "eq_const", value: "save" }] },
            ],
            action: async (m, wm, term) => {
                rt.remove(m.$2);
                const slot = m.$2.tokens && m.$2.tokens[1] ? m.$2.tokens[1] : "1";
                if (typeof window !== "undefined" && window.__haunt) {
                    const msg = window.__haunt.save(slot);
                    rt.write("\n", msg);
                } else {
                    rt.write("\n", "Save not available.");
                }
            },
        },
        {
            name: "patch_restore",
            priority: 0,
            sourceIndex: nextIdx + 11,
            conditions: [
                { cls: "x", isPositional: true, prefixLength: 1, negated: false,
                  tests: [{ index: 0, op: "eq_const", value: 30 }] },
                { cls: "input", isPositional: true, prefixLength: 0, negated: false,
                  tests: [{ index: 0, op: "eq_const", value: "restore" }] },
            ],
            action: async (m, wm, term) => {
                rt.remove(m.$2);
                const slot = m.$2.tokens && m.$2.tokens[1] ? m.$2.tokens[1] : "1";
                if (typeof window !== "undefined" && window.__haunt) {
                    const msg = window.__haunt.restore(slot);
                    rt.write("\n", msg);
                } else {
                    rt.write("\n", "Restore not available.");
                }
            },
        },
        {
            name: "patch_saves_list",
            priority: 0,
            sourceIndex: nextIdx + 12,
            conditions: [
                { cls: "x", isPositional: true, prefixLength: 1, negated: false,
                  tests: [{ index: 0, op: "eq_const", value: 30 }] },
                { cls: "input", isPositional: true, prefixLength: 0, negated: false,
                  tests: [{ index: 0, op: "eq_const", value: "saves" }] },
            ],
            action: async (m, wm, term) => {
                rt.remove(m.$2);
                if (typeof window === "undefined") {
                    rt.write("\n", "Saves not available.");
                    return;
                }
                let found = false;
                for (let i = 1; i <= 3; i++) {
                    const raw = localStorage.getItem("haunt:save:" + i);
                    if (raw) {
                        found = true;
                        rt.write("\n", "Slot " + i + ": saved");
                    }
                }
                if (!found) rt.write("\n", "No saves found.");
                rt.write("\n", "Use SAVE [1-3] or RESTORE [1-3].");
            },
        },
        {
            name: "patch_look",
            priority: 0,
            sourceIndex: nextIdx + 60,
            conditions: [
                { cls: "x", isPositional: true, prefixLength: 1, negated: false,
                  tests: [{ index: 0, op: "eq_const", value: 30 }] },
                { cls: "place", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_var", var: "_loc" }] },
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_var", var: "_loc" }] },
                { cls: "input", isPositional: true, prefixLength: 1, negated: false,
                  tests: [{ index: 0, op: "eq_const", value: "look" }] },
            ],
            action: async (m, wm, term) => {
                rt.remove(m.$4);
                rt.modify(m.$2, { visited: null });
                rt.modify(m.$3, {});
            },
        },
        {
            name: "patch_get_bust",
            priority: 0,
            sourceIndex: -2,
            conditions: [
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_const", value: "library" }] },
                { cls: "input", isPositional: true, prefixLength: 2, negated: false,
                  tests: [
                      { index: 0, op: "eq_const", value: "get" },
                      { index: 1, op: "eq_const", value: "bust" },
                  ] },
            ],
            action: async (m, wm, term) => {
                rt.remove(m.$2);
                rt.write("\n", "The bust is too heavy to carry.");
            },
        },
        {
            name: "patch_fill_bathroom",
            priority: 0,
            sourceIndex: -3,
            conditions: [
                { cls: "input", isPositional: true, prefixLength: 2, negated: false,
                  tests: [
                      { index: 0, op: "eq_const", value: "fill" },
                      { index: 1, op: "eq_const", value: "bottle" },
                      { index: 0, op: "eq_var", var: "_fill" },
                      { index: 1, op: "eq_var", var: "_bottle" },
                  ] },
                { cls: "object", isPositional: false, prefixLength: null, negated: false,
                  tests: [
                      { field: "name", op: "eq_const", value: "bottle" },
                      { field: "place", op: "eq_const", value: "held" },
                      { field: "name", op: "eq_var", var: "_bname" },
                  ] },
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_const", value: "bathroom" }] },
                { cls: "place", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_const", value: "bathroom" }] },
                { cls: "object", isPositional: false, prefixLength: null, negated: true,
                  tests: [{ field: "inside", op: "eq_const", value: "bottle" }] },
            ],
            action: async (m, wm, term) => {
                rt.remove(m.$1);
                rt.make("object", { name: "bathwater", inside: "bottle" });
                rt.write("\n", "The bottle is full of bathwater.");
            },
        },
        {
            name: "patch_pour_on_lawn",
            priority: 0,
            sourceIndex: -4,
            conditions: [
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [
                      { field: "name", op: "eq_const", value: "lawn" },
                      { field: "side", op: "eq_var", var: "_side" },
                      { field: "east", op: "eq_var", var: "_east" },
                      { field: "north", op: "eq_var", var: "_north" },
                  ] },
                { cls: "object", isPositional: false, prefixLength: null, negated: false,
                  tests: [
                      { field: "name", op: "eq_const", value: "bottle" },
                      { field: "place", op: "eq_const", value: "held" },
                  ] },
                { cls: "object", isPositional: false, prefixLength: null, negated: false,
                  tests: [
                      { field: "name", op: "eq_var", var: "_liquid" },
                      { field: "inside", op: "eq_const", value: "bottle" },
                  ] },
                { cls: "input", isPositional: true, prefixLength: 1, negated: false,
                  tests: [{ index: 0, op: "eq_const", value: "pour" }] },
            ],
            action: async (m, wm, term) => {
                rt.remove(m.$4);
                rt.modify(m.$3, {
                    inside: null,
                    place: "lawn",
                    side: m._side,
                    east: m._east,
                    north: m._north,
                });
            },
        },
        {
            name: "patch_wine_cellar_desc",
            priority: 1,
            sourceIndex: nextIdx + 3,
            conditions: [
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_const", value: "wine_cellar" }] },
            ],
            action: async (m, wm, term) => {
                rt.write("\n", "You are in a dusty wine cellar. Rows of bottles line the walls.");
                rt.write("\n", "The stairs go back up.");
            },
        },
        {
            name: "patch_dark_room_desc",
            priority: 1,
            sourceIndex: nextIdx + 4,
            conditions: [
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_const", value: "dark_room" }] },
            ],
            action: async (m, wm, term) => {
                rt.write("\n", "You are in a dark, musty room. It reeks of decay.");
                rt.write("\n", "The exit is to the north.");
            },
        },
        {
            name: "patch_dull_room_desc",
            priority: 1,
            sourceIndex: nextIdx + 5,
            conditions: [
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_const", value: "dull_room" }] },
            ],
            action: async (m, wm, term) => {
                rt.write("\n", "You are in an uninteresting room. Dust covers everything.");
                rt.write("\n", "The exit is to the south.");
            },
        },
    ];
}

const SAVE_KEY = "haunt:save:";
const AUTO_KEY = "haunt:autosave";

function serializeWM(wm) {
    const data = {};
    for (const [cls, bucket] of wm.classes) {
        const wmes = [];
        for (const w of bucket.values()) {
            const copy = { ...w };
            wmes.push(copy);
        }
        data[cls] = wmes;
    }
    return { version: 1, stamp: wm.stamp, nextId: wm.nextId, classes: data };
}

function restoreWM(wm, snapshot) {
    wm.classes.clear();
    wm.stamp = snapshot.stamp;
    wm.nextId = snapshot.nextId;
    for (const [cls, wmes] of Object.entries(snapshot.classes)) {
        const bucket = wm._bucket(cls);
        for (const w of wmes) {
            bucket.set(w._id, w);
        }
    }
}

export async function runGame(term, opts = {}) {
    const wm = new WM();
    const rt = new Runtime(wm, term);
    const engine = new Engine({ rules: [], wm, term });
    const rules = createRules(rt, engine);
    rules.push(...patchRules(rt));
    engine.rules = rules;
    engine.maxCycles = 1_000_000;

    if (typeof window !== "undefined") {
        window.__haunt = { wm, engine, rt, rules };

        window.__haunt.save = (slot) => {
            const key = SAVE_KEY + (slot || 1);
            localStorage.setItem(key, JSON.stringify(serializeWM(wm)));
            engine.refracted.clear();
            return "Saved to slot " + (slot || 1);
        };
        window.__haunt.restore = (slot) => {
            const key = SAVE_KEY + (slot || 1);
            const raw = localStorage.getItem(key);
            if (!raw) return "No save in slot " + (slot || 1);
            restoreWM(wm, JSON.parse(raw));
            engine.refracted.clear();
            return "Restored from slot " + (slot || 1);
        };
        window.__haunt.autosave = () => {
            localStorage.setItem(AUTO_KEY, JSON.stringify(serializeWM(wm)));
        };
    }

    if (typeof window !== "undefined") {
        const origReadLine = term.readLine.bind(term);
        term.readLine = async function () {
            if (window.__haunt && window.__haunt.autosave) {
                try { window.__haunt.autosave(); } catch (_) {}
            }
            return origReadLine();
        };
    }

    if (opts.snapshot) {
        restoreWM(wm, opts.snapshot);
        engine.refracted.clear();
    } else {
        wm.make("start", []);
    }

    try {
        await engine.run();
    } catch (e) {
        if (!/input exhausted/.test(e && e.message || "")) {
            console.error(e);
            term.println("");
            term.println("[engine error in " + (e.ruleName || "?") + ": " + (e && e.message ? e.message : String(e)) + "]");
        }
    }
    rt.flush();
    term.blank();
    term.println("[adventure ended]");
}
