export type CityData = {
  id: number;
  cityId: number;
};

export type CreateEventData = {
  hostId: number;
  title: string;
  description: string;
  categoryId: number;
  eventCity: CityData[];
  startTime: Date;
  endTime: Date;
  maxPeople: number;
};
