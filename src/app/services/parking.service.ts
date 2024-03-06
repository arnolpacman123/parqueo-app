import { Injectable } from '@angular/core';
import { Socket } from "ngx-socket-io";
import { Parking } from "../models/interfaces";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ParkingService extends Socket {

  constructor() {
    super({
      url: "https://parqueos-api.adaptable.app/parking",
    });
    this.onNewConnection();
    this.onNewDisconnection();
    this.onUpdate();
  }

  onNewConnection() {
    return this.fromEvent("connected");
  }

  onNewDisconnection() {
    return this.fromEvent("disconnected");
  }

  onUpdate() {
    return this.fromEvent<Parking[]>("update");
  }

  update(parking: Parking): Observable<Parking[]> {
    return new Observable<any>((observer) => {
      this.ioSocket.emit("update", parking, (data: any) => {
        observer.next(data);
        observer.complete();
      });
    });
  }
}
