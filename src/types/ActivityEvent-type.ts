type ActivityEvent = {
    id: number;
    type: "entry" | "exit";
    bay: string;
    plate: string;
    time: string;
};

export type { ActivityEvent };
