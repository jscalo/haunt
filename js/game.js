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
            name: "patch_stairs_debris_up",
            priority: 0,
            sourceIndex: nextIdx + 36,
            conditions: [
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_const", value: "stairs_debris" }] },
                { cls: "status", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "going", op: "eq_const", value: "u" }] },
            ],
            action: async (m, wm, term) => {
                rt.write("\n", "You clamber up the wreckage to the upper hall.");
                rt.modify(m.$1, { name: "upper_hall" });
                rt.modify(m.$2, { going: null });
            },
        },
        {
            name: "patch_kick_football_lab",
            priority: 2,
            sourceIndex: nextIdx + 72,
            conditions: [
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_const", value: "laboratory" }] },
                { cls: "object", isPositional: false, prefixLength: null, negated: false,
                  tests: [
                      { field: "name", op: "eq_const", value: "football" },
                      { field: "place", op: "eq_const", value: "held" },
                  ] },
                { cls: "input", isPositional: true, prefixLength: 2, negated: false,
                  tests: [
                      { index: 0, op: "eq_const", value: "kick" },
                      { index: 1, op: "eq_const", value: "football" },
                  ] },
            ],
            action: async (m, wm, term) => {
                rt.remove(m.$3);
                rt.write("\n", "The football goes crashing through the glass dome.");
                rt.modify(m.$2, { place: "lawn", side: "in", east: 7, north: 4 });
                rt.make("object", { name: "dome", state: "broken" });
            },
        },
        {
            name: "patch_disable_madness",
            priority: 3,
            sourceIndex: nextIdx + 75,
            conditions: [
                { cls: "time", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "orc_status", op: "in_set", set: ["sweat", "dizzy", "mad", "suicide"] }] },
            ],
            action: async (m, wm, term) => {
                rt.modify(m.$1, { orc_status: null, orc_time: null });
            },
        },
        {
            name: "patch_get_orchid",
            priority: 2,
            sourceIndex: nextIdx + 74,
            conditions: [
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [
                      { field: "name", op: "eq_const", value: "lawn" },
                      { field: "side", op: "eq_const", value: "in" },
                      { field: "east", op: "eq_const", value: "3" },
                      { field: "north", op: "eq_const", value: "7" },
                  ] },
                { cls: "object", isPositional: false, prefixLength: null, negated: false,
                  tests: [
                      { field: "name", op: "eq_const", value: "orchid" },
                      { field: "state", op: "eq_const", value: "plant" },
                  ] },
                { cls: "input", isPositional: true, prefixLength: 2, negated: false,
                  tests: [
                      { index: 0, op: "eq_const", value: "get" },
                      { index: 1, op: "eq_const", value: "orchid" },
                  ] },
            ],
            action: async (m, wm, term) => {
                rt.remove(m.$3);
                rt.modify(m.$2, { place: "held", side: null, east: null, north: null, state: null, treasure: "t" });
                rt.write("\n", "You pick the orchid.");
            },
        },
        {
            name: "patch_dracula_to_lab",
            priority: 0,
            sourceIndex: nextIdx + 73,
            conditions: [
                { cls: "object", isPositional: false, prefixLength: null, negated: false,
                  tests: [
                      { field: "name", op: "eq_const", value: "Dracula" },
                      { field: "place", op: "neq_const", value: "laboratory" },
                  ] },
                { cls: "object", isPositional: false, prefixLength: null, negated: false,
                  tests: [
                      { field: "name", op: "eq_const", value: "dome" },
                      { field: "state", op: "eq_const", value: "broken" },
                  ] },
                { cls: "time", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "morning", op: "eq_const", value: "t" }] },
            ],
            action: async (m, wm, term) => {
                rt.modify(m.$1, { place: "laboratory", asleep: null });
            },
        },
        {
            name: "patch_force_morning",
            priority: 0,
            sourceIndex: nextIdx + 71,
            conditions: [
                { cls: "time", isPositional: false, prefixLength: null, negated: false,
                  tests: [
                      { field: "realtime", op: "cmp", cmp: ">", value: 2300 },
                      { field: "morning", op: "neq_const", value: "t" },
                  ] },
            ],
            action: async (m, wm, term) => {
                rt.modify(m.$1, { morning: "t" });
                rt.write("\n", "'Cock-a-doodle-do'.  You hear a rooster crow.");
            },
        },
        {
            name: "patch_spawn_football",
            priority: 0,
            sourceIndex: nextIdx + 70,
            conditions: [
                { cls: "history", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "football_spawned", op: "neq_const", value: "t" }] },
            ],
            action: async (m, wm, term) => {
                rt.make("object", { name: "football", place: "main_hall" });
                rt.modify(m.$1, { football_spawned: "t" });
            },
        },
        {
            name: "patch_bus_out",
            priority: 0,
            sourceIndex: nextIdx + 6,
            conditions: [
                { cls: "input", isPositional: true, prefixLength: 1, negated: false,
                  tests: [{ index: 0, op: "eq_const", value: "out" }] },
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_const", value: "bus" }] },
            ],
            action: async (m, wm, term) => {
                rt.remove(m.$1);
                rt.modify(m.$2, { name: "lawn", side: "out", east: 5, north: 2 });
                rt.write("\n", "The bus drives off as you get off.");
            },
        },
        // === East-gate entry: button + dialog + trivia (binary fidelity) ===
        // State lives in history.gate_state ("", "await_bus", "await_survive",
        // "await_want_in", "await_name", "await_sex", "await_trivia", "done").
        // Press count lives in history.gate_presses (nil → "1" → ... → "4").
        ...gateEntryPatches(rt, nextIdx),
        {
            name: "patch_dhi_disabled",
            priority: 2,
            sourceIndex: nextIdx + 99,
            conditions: [
                { cls: "input", isPositional: true, prefixLength: 1, negated: false,
                  tests: [{ index: 0, op: "eq_const", value: "hi" }] },
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [
                      { field: "name", op: "eq_const", value: "lawn" },
                      { field: "side", op: "eq_const", value: "out" },
                      { field: "east", op: "eq_const", value: 8 },
                      { field: "north", op: "eq_const", value: 5 },
                  ] },
            ],
            action: async (m, wm, term) => {
                rt.remove(m.$1);
                rt.write("\n", "The speaker doesn't seem to respond to that. Try the button.");
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

const EAST_GATE_LOC = { cls: "location", isPositional: false, prefixLength: null, negated: false,
    tests: [
        { field: "name", op: "eq_const", value: "lawn" },
        { field: "side", op: "eq_const", value: "out" },
        { field: "east", op: "eq_const", value: 8 },
        { field: "north", op: "eq_const", value: 5 },
    ] };

function kickToBusStop(rt, loc, hist, msg) {
    if (msg) rt.write("\n", msg);
    rt.modify(loc, { name: "bus_stop", side: null, east: null, north: null });
    rt.modify(hist, { gate_state: null, gate_presses: null, bus_stopped: "nil" });
}

function gateEntryPatches(rt, nextIdx) {
    const pressRule = (n, prevPresses, text, stateUpdate = {}) => ({
        name: `patch_gate_press_${n}`,
        priority: 5,
        sourceIndex: nextIdx + 80 + n,
        conditions: [
            { cls: "input", isPositional: true, prefixLength: 2, negated: false,
              tests: [
                  { index: 0, op: "in_set", set: ["press", "push"] },
                  { index: 1, op: "eq_const", value: "button" },
              ] },
            EAST_GATE_LOC,
            { cls: "history", isPositional: false, prefixLength: null, negated: false,
              tests: [{ field: "gate_presses", op: "eq_const", value: prevPresses }] },
        ],
        action: async (m, wm, term) => {
            rt.remove(m.$1);
            rt.modify(m.$3, { gate_presses: String(n), ...stateUpdate });
            for (const line of text) rt.write("\n", line);
        },
    });

    const dialogRule = (name, stateWhen, inputTest, action) => ({
        name: `patch_gate_${name}`,
        priority: 5,
        sourceIndex: nextIdx + 90 + name.charCodeAt(0),
        conditions: [
            inputTest,
            { cls: "history", isPositional: false, prefixLength: null, negated: false,
              tests: [{ field: "gate_state", op: "eq_const", value: stateWhen }] },
            { cls: "location", isPositional: false, prefixLength: null, negated: false,
              tests: [{ field: "name", op: "eq_var", var: "__loc" }] },
        ],
        action,
    });

    const yesInput = { cls: "input", isPositional: true, prefixLength: 1, negated: false,
        tests: [{ index: 0, op: "in_set", set: ["yes", "y"] }] };
    const noInput = { cls: "input", isPositional: true, prefixLength: 1, negated: false,
        tests: [{ index: 0, op: "in_set", set: ["no", "n"] }] };
    const anyInput = { cls: "input", isPositional: true, prefixLength: 1, negated: false, tests: [] };
    const trivInput = { cls: "input", isPositional: true, prefixLength: 1, negated: false,
        tests: [{ index: 0, op: "eq_const", value: "haunt" }] };

    return [
        // --- Press 1..3: progressive wake-up sounds ---
        pressRule(1, "nil", ["'ZZZZZZZ CracKLe ZZZZZZZZZ'"]),
        pressRule(2, "1", ["'ZZZZZZZZ, snort snort ZZZZZZZ'"]),
        pressRule(3, "2", ["'Meep, ZZzz, Go AWAY!!  Leave me alone!, ZZZT'"]),
        // --- Press 4: attendant wakes and opens dialog ---
        pressRule(4, "3", [
            "'Alright, alright.  Stop pressing that damn buzzer!'",
            "'There is a microphone there so I can hear anything you say.'",
            "'How did you get here, on that stupid bus?'",
        ], { gate_state: "await_bus" }),
        // --- Press 5: punishment — teleport to bus stop ---
        {
            name: "patch_gate_press_5",
            priority: 5,
            sourceIndex: nextIdx + 86,
            conditions: [
                { cls: "input", isPositional: true, prefixLength: 2, negated: false,
                  tests: [
                      { index: 0, op: "in_set", set: ["press", "push"] },
                      { index: 1, op: "eq_const", value: "button" },
                  ] },
                EAST_GATE_LOC,
                { cls: "history", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "gate_presses", op: "eq_const", value: "4" }] },
            ],
            action: async (m, wm, term) => {
                rt.remove(m.$1);
                rt.write("\n", "'That's it!! You've pressed my buzzer once too often.'");
                rt.write("\n", "'I guess you must love that bus stop.'");
                kickToBusStop(rt, m.$2, m.$3);
            },
        },
        // --- Dialog Q1: "got here by bus?" ---
        dialogRule("q1_yes", "await_bus", yesInput, async (m) => {
            rt.remove(m.$1);
            rt.modify(m.$2, { gate_state: "await_survive" });
            rt.write("\n", "'I thought so. Mumble. I suppose you think you can survive");
            rt.write("\n", "in Chez Moose for a night without going crazy and find mucho treasure?'");
        }),
        dialogRule("q1_no", "await_bus", noInput, async (m) => {
            rt.remove(m.$1);
            kickToBusStop(rt, m.$3, m.$2, "'Then how did you get here? Bah! Go away.'");
        }),
        // --- Dialog Q2: "survive Chez Moose?" ---
        dialogRule("q2_yes", "await_survive", yesInput, async (m) => {
            rt.remove(m.$1);
            rt.modify(m.$2, { gate_state: "await_want_in" });
            rt.write("\n", "'So I guess you want to come in the gate, don't you?'");
        }),
        dialogRule("q2_no", "await_survive", noInput, async (m) => {
            rt.remove(m.$1);
            kickToBusStop(rt, m.$3, m.$2, "'Smart turkey. Go home.'");
        }),
        // --- Dialog Q3: "want to come in?" ---
        dialogRule("q3_yes", "await_want_in", yesInput, async (m) => {
            rt.remove(m.$1);
            rt.modify(m.$2, { gate_state: "await_name" });
            rt.write("\n", "'In order for you to enter you must first answer three questions!'");
            rt.write("\n", "'First, what is your name?'");
        }),
        dialogRule("q3_no", "await_want_in", noInput, async (m) => {
            rt.remove(m.$1);
            kickToBusStop(rt, m.$3, m.$2,
                "'Then leave me alone, you turkey.  Good night!!  Enjoy the bus stop.'");
        }),
        // --- Admission Q1: name (any input accepted) ---
        dialogRule("q_name", "await_name", anyInput, async (m) => {
            rt.remove(m.$1);
            rt.modify(m.$2, { gate_state: "await_sex" });
            rt.write("\n", "'Second, which sex (male, female, ...) interests you sexually'");
        }),
        // --- Admission Q2: sex (any input) ---
        dialogRule("q_sex", "await_sex", anyInput, async (m) => {
            rt.remove(m.$1);
            rt.modify(m.$2, { gate_state: "await_trivia" });
            rt.write("\n", "'Your mother would faint if she knew that.'");
            rt.write("\n", "'What was the first production system with more than 1500 productions?'");
        }),
        // --- Admission Q3: trivia. Correct answer: haunt ---
        {
            name: "patch_gate_trivia_right",
            priority: 6,
            sourceIndex: nextIdx + 100,
            conditions: [
                trivInput,
                { cls: "history", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "gate_state", op: "eq_const", value: "await_trivia" }] },
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_const", value: "lawn" }] },
            ],
            action: async (m, wm, term) => {
                rt.remove(m.$1);
                rt.modify(m.$2, { gate_state: "done" });
                rt.modify(m.$3, { side: "in" });
                rt.write("\n", "Correct!!");
                rt.write("\n", "The gate opens.  You rush in and then it closes behind you.");
                rt.write("\n", "Out of the speaker you hear, 'Now you are in, but will you ever get out?'");
                const tokens = [...(wm.classes.get("object")?.values() ?? [])]
                    .filter(o => (o.name === "token" || o.name === "tokens") && o.place === "held");
                for (const t of tokens) {
                    rt.write("\n", "'I'll take that gold token you've got there.'");
                    rt.write("\n", "'CHOMP!  Yep these old teeth left a mark in it.'");
                    rt.write("\n", "'Maybe next time you'll be smart enough to test it yourself.'");
                    rt.remove(t);
                    break;
                }
            },
        },
        {
            name: "patch_gate_trivia_wrong",
            priority: 5,
            sourceIndex: nextIdx + 101,
            conditions: [
                anyInput,
                { cls: "history", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "gate_state", op: "eq_const", value: "await_trivia" }] },
                { cls: "location", isPositional: false, prefixLength: null, negated: false,
                  tests: [{ field: "name", op: "eq_var", var: "__loc" }] },
            ],
            action: async (m, wm, term) => {
                rt.remove(m.$1);
                kickToBusStop(rt, m.$3, m.$2,
                    "Wrong!! Buzzzzz.  Don't come back til you know the answer!");
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
