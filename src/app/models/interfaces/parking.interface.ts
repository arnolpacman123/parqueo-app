export interface Parking {
  id?: number;
  geom?: Point;
  capacity?: number;
  currentOccupancy?: number;
  isFull?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Point {
  type: "Point";
  coordinates: [ number, number ];
}
