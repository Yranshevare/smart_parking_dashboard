import type { Site } from "../types";

const sites: Site[] = [
    {
        name: "Central Plaza",
        zone: "Ground level · Zone A",
        bays: [
            { id: "A01", occupied: true, distance: 42, lastChange: "2 min ago" },
            { id: "A02", occupied: true, distance: 39, lastChange: "18 min ago" },
            { id: "A03", occupied: false, distance: 186, lastChange: "6 min ago" },
            { id: "A04", occupied: true, distance: 45, lastChange: "32 min ago" },
            { id: "A05", occupied: true, distance: 41, lastChange: "1 hr ago" },
            { id: "A06", occupied: false, distance: 191, lastChange: "14 min ago" },
            { id: "A07", occupied: true, distance: 38, lastChange: "46 min ago" },
            { id: "A08", occupied: true, distance: 43, lastChange: "21 min ago" },
            { id: "A09", occupied: false, distance: 188, lastChange: "9 min ago" },
            { id: "A10", occupied: true, distance: 47, lastChange: "4 min ago", warning: true },
        ],
    },
    {
        name: "Riverside Deck",
        zone: "Level 2 · West wing",
        bays: Array.from({ length: 8 }, (_, index) => ({
            id: `B${String(index + 1).padStart(2, "0")}`,
            occupied: index < 5,
            distance: index < 5 ? 40 + index : 184 + index,
            lastChange: `${index + 3} min ago`,
        })),
    },
    {
        name: "North Garage",
        zone: "Level 1 · Main aisle",
        bays: Array.from({ length: 12 }, (_, index) => ({
            id: `N${String(index + 1).padStart(2, "0")}`,
            occupied: index < 10,
            distance: index < 10 ? 38 + (index % 7) : 187 + index,
            lastChange: `${index + 1} min ago`,
        })),
    },
];

export default sites;