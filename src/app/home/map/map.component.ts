import { Component, inject } from '@angular/core';
import { LeafletControlLayersConfig, LeafletModule } from "@asymmetrik/ngx-leaflet";
import {
  Control,
  Icon,
  IconOptions, LatLng,
  latLng,
  LatLngExpression, LeafletEvent, LocationEvent,
  Map,
  MapOptions,
  Marker,
  MarkerOptions,
  tileLayer
} from "leaflet";
import { NgxLeafletLocateModule } from "@runette/ngx-leaflet-locate";
import { ParkingService } from "../../services/parking.service";
import { Parking } from "../../models/interfaces";

interface PulseIconOptions extends IconOptions {
  animate?: boolean;
  heartbeat: number;
  fillColor?: string;
  color?: string;
}

class PulseIcon extends Icon<PulseIconOptions> {
  override options!: PulseIconOptions;

  constructor(
    options: PulseIconOptions
  ) {
    super(options);
  }

  override createIcon(oldIcon?: HTMLElement): HTMLElement {
    const div = super.createIcon(oldIcon);
    div.style.borderRadius = '50%';
    div.style.border = `0.25px solid ${ this.options.color }`;
    return div;
  }
}

interface PulseMarkerOptions extends MarkerOptions {
  icon?: PulseIcon;
}

class PulseMarker extends Marker {
  override options!: PulseMarkerOptions;

  constructor(
    latlng: LatLngExpression,
    options: PulseMarkerOptions,
  ) {
    super(latlng, options);
  }
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [ LeafletModule, NgxLeafletLocateModule ],
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

  locateOptions: Control.LocateOptions = {
    position: 'bottomright',
    strings: {
      title: 'Mostrar mi ubicación actual',
    },
    locateOptions: {
      enableHighAccuracy: true,
      watch: true,
    },
    keepCurrentZoomLevel: true,
    flyTo: true,
    cacheLocation: true,
  };
  myLocation?: LatLng;
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
    this.map.on('locatedeactivate', this._onLocateDeactivate.bind(this));
  }

  _onLocateDeactivate(_: LeafletEvent) {
    this.myLocation = undefined!;
  }

  createMarker(parking: Parking) {
    const pulseIcon = new PulseIcon({
      iconSize: [ 23, 23 ],
      iconUrl: parking.capacity === parking.currentOccupancy ? 'assets/parking-full.gif' : 'assets/parking-free.gif',
      animate: true,
      heartbeat: 1,
      fillColor: parking.capacity === parking.currentOccupancy ? 'red' : 'green',
      color: parking.capacity === parking.currentOccupancy ? 'red' : 'green',
    });

    return new PulseMarker([ parking.geom!.coordinates[1], parking.geom!.coordinates[0] ], {
      icon: pulseIcon,
    });
  }

  // updateParking(parking: Parking) {
  //   if (parking.capacity === parking.currentOccupancy) {
  //     return;
  //   }
  //   parking.currentOccupancy!++;
  //   this.parkingService.update(parking).subscribe((parkings) => {
  //     this.parkings = parkings;
  //   });
  // }

  _onNewLocation(event: LocationEvent) {
    this.myLocation = event.latlng;
  }
}
