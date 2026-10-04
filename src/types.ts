type Bay = {
    id: string;
    occupied: boolean;
    distance: number;
    lastChange: string;
    warning?: boolean;
};

type ActivityEvent = {
    id: number;
    type: "entry" | "exit";
    bay: string;
    plate: string;
    time: string;
};

type Site = {
    name: string;
    zone: string;
    bays: Bay[];
};

export type { Bay, ActivityEvent, Site };