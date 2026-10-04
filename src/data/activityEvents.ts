import type { ActivityEvent } from "../types";

const activityEvents: ActivityEvent[] = [
    { id: 1, type: "entry", bay: "A01", plate: "KA 05 MK 2814", time: "10:42:18" },
    { id: 2, type: "exit", bay: "A03", plate: "KA 01 NX 9042", time: "10:38:51" },
    { id: 3, type: "entry", bay: "A10", plate: "KA 03 AR 1180", time: "10:36:09" },
    { id: 4, type: "exit", bay: "A09", plate: "KA 04 JC 6721", time: "10:29:44" },
    { id: 5, type: "entry", bay: "A07", plate: "KA 02 MP 5516", time: "10:21:03" },
];

export default activityEvents;