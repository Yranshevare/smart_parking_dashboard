
type Bay = {
    id: string;
    occupied: boolean;
    distance: number;
    lastChange: string;
    warning?: boolean;
};


type Site = {
    name: string;
    zone: string;
    bays: Bay[];
};

export type { Bay, Site };