import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data-service';
import { ApiService } from '../../services/api.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MapaComponent } from "../../components/mapa/mapa"; // <-- agregado

@Component({
  selector: 'app-upload-csv',
  standalone: true,
  imports: [CommonModule, FormsModule, MapaComponent],
  templateUrl: './upload-csv-component.html',
  styleUrls: ['./upload-csv-component.css']
})
export class UploadCsvComponent implements OnInit {
  selectedFile: File | null = null;
  progress = 0;
  isConnected: boolean = false;
  connectionMessage: string = '';
  apiData: any[] = [];
  isLoading: boolean = false;
  activeTab: string = 'upload';

  // Agrega una variable para el topicId (ejemplo)
  selectedTopicId: string = '1'; // Puedes poner un ID de tema por defecto o hacerlo seleccionable

  constructor(
    private dataService: DataService,
    private apiService: ApiService,
    private router: Router // <-- inyectado correctamente
  ) {}

  ngOnInit(): void {
    this.apiService.connectionStatus$.subscribe(status => {
      this.isConnected = status;
      this.connectionMessage = status
        ? 'Conexión establecida correctamente con la API'
        : 'No se pudo conectar a la API';
    });
  }

  goToPriorizacion() {
    this.router.navigate(['/priorizacion']); // <-- ahora funciona
  }

  onFileSelected(event: Event) {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.selectedFile = element.files[0];
    }
  }

  onUpload() {
    if (!this.selectedFile) {
      alert("⚠ Selecciona un archivo primero.");
      return;
    }

    this.dataService.uploadCsv(this.selectedFile).subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress = Math.round((100 * event.loaded) / event.total);
          console.log(`Progreso: ${this.progress}%`);
        } else if (event.type === HttpEventType.Response) {
          console.log("✅ Respuesta del backend:", event.body);
          alert("Archivo subido correctamente.\n" + (event.body as string[]).join("\n"));
          this.progress = 0;
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error("❌ Error al subir:", err.message);
        alert("Error al subir archivo CSV");
        this.progress = 0;
      }
    });
  }

  checkAPIConnection(): void {
    this.isLoading = true;
    this.apiService.testConnection().subscribe({
      next: () => {
        this.isLoading = false;
        this.activeTab = 'api';
        alert('Conexión con la API de World Bank (a través del backend) exitosa.');
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error conectando a API:', err);
        alert('Error al conectar con la API de World Bank.');
      }
    });
  }

  fetchAPIData(): void {
    if (!this.isConnected) {
      alert('Primero debe establecer conexión con la API');
      return;
    }

    if (!this.selectedTopicId) {
        alert('Por favor, selecciona un ID de tema.');
        return;
    }

    this.isLoading = true;
    this.apiService.getIndicators(this.selectedTopicId).subscribe({
      next: (data: any[]) => {
        this.apiData = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error obteniendo datos:', err);
        alert('Error al obtener datos de la API');
        this.isLoading = false;
      }
    });
  }

  // Cambiar entre pestañas
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
