export type CityData = {
  id: number;
  cityId: number;
};

export type UpdateEventData = {
  title?: string;
  description?: string;
  categoryId?: number;
  eventCity?: CityData[];
  startTime?: Date;
  endTime?: Date;
  maxPeople?: number;
};
