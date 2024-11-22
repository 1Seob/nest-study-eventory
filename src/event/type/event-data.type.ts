export type EventData = {
  id: number;
  hostId: number;
  title: string;
  description: string;
  categoryId: number;
  citiesId: number[];
  startTime: Date;
  endTime: Date;
  maxPeople: number;
};
