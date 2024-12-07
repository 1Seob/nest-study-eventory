export type CityData = {
  id: number;
  cityId: number;
};

export type EventData = {
  id: number;
  hostId: number;
  title: string;
  description: string;
  categoryId: number;
  eventCity: CityData[];
  startTime: Date;
  endTime: Date;
  maxPeople: number;
  clubId?: number | null;
  isArchived?: boolean | null;
};
