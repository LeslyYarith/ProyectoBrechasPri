import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UploadCsvComponent } from './upload-csv/upload-csv-component/upload-csv-component';
import { PriorityTabComponent } from './components/priority-table/priority-tab/priority-tab';
import { MapaComponent } from './components/mapa/mapa';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UploadCsvComponent, MapaComponent, PriorityTabComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']  // 👈 así
})

export class AppComponent {
  protected readonly title = signal('proyecto_brechas1');
}
