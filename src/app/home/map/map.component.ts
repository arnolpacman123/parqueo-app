import { Component, inject } from '@angular/core';
import { LeafletModule, LeafletControlLayersConfig } from "@asymmetrik/ngx-leaflet";
import {
  latLng,
  MapOptions,
  tileLayer,
  Map, LatLng, marker, icon,
} from "leaflet";
import { ParkingService } from "../../services/parking.service";
import { Parking } from "../../models/interfaces";

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [ LeafletModule ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {
  options: MapOptions = {
    layers: [
      tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: [ 'mt0', 'mt1', 'mt2', 'mt3' ]
      })
    ],
    attributionControl: false,
    zoom: 13,
    center: latLng(-17.7834, -63.1821),
    doubleClickZoom: false,
  };

  layersControl: LeafletControlLayersConfig = {
    baseLayers: {
      'Google Maps': tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 22,
        subdomains: [ 'mt0', 'mt1', 'mt2', 'mt3' ],
      }),
      'Google Satellite': tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 22,
        subdomains: [ 'mt0', 'mt1', 'mt2', 'mt3' ],
      }),
      'Open Street Map': tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
      }),
    },
    overlays: {},
  };
  map!: Map;
  parkings: Parking[] = [];
  parkingService = inject(ParkingService);

  constructor() {
    this.parkingService.onUpdate().subscribe((parkings) => {
      this.parkings = parkings;
    });
  }

  onMapReady(map: Map) {
    this.map = map;
  }

  createMarker(parking: Parking) {
    const newMarker = marker([ parking.geom!.coordinates[1], parking.geom!.coordinates[0] ], {
      icon: icon({
        iconSize: [ 25, 32 ],
        iconUrl: parking.capacity === parking.currentOccupancy ? 'assets/parking-full.svg' : 'assets/parking-free.svg',

      }),
    });
    newMarker.on('click', () => {
      this.updateParking(parking);
    });
    return newMarker;
  }

  updateParking(parking: Parking) {
    if (parking.capacity === parking.currentOccupancy) {
      return;
    }
    parking.currentOccupancy!++;
    this.parkingService.update(parking).subscribe((parkings) => {
      this.parkings = parkings;
    });
  }
}
