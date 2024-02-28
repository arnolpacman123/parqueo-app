import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ParkingService } from "./services/parking.service";
import { Parking } from "./models/interfaces";
import { update } from "@angular-devkit/build-angular/src/tools/esbuild/angular/compilation/parallel-worker";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ RouterOutlet ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}
