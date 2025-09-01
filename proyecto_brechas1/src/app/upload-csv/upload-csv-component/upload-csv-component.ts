// upload-csv-component.ts
import { Component, OnInit, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { DataService } from '../../services/data-service';
import { ApiService } from '../../services/api.service';
import { HttpEvent, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MapaComponent } from "../../components/mapa/mapa";
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-upload-csv',
  standalone: true,
  imports: [CommonModule, FormsModule, MapaComponent, BaseChartDirective],
  templateUrl: './upload-csv-component.html',
  styleUrls: ['./upload-csv-component.css']
})
export class UploadCsvComponent implements OnInit {
  selectedFile: File | null = null;
  progress = 0;
  isConnected = false;
  connectionMessage = '';

  // 🔹 ahora apiData será solo el array "value" de la respuesta
  apiData: any[] = [];
  colombiaPopulation: any[] = [];
  // 🔹 guardamos el total de resultados que devuelve "@odata.count"
  totalResultados = 0;

  isLoading = false;
  activeTab: string = 'upload';
  selectedTopicId: string = '1';
  isBrowser = false;

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ["Sin datos aún"],
    datasets: [
      {
        data: [0],
        label: 'Valores CSV/DB',
        fill: false,
        borderColor: 'blue',
        backgroundColor: 'rgba(30,136,229,0.2)',
        tension: 0.4
      }
    ]
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: { legend: { display: true } }
  };

  constructor(
    private dataService: DataService,
    private apiService: ApiService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.apiService.connectionStatus$.subscribe(status => {
      this.isConnected = status;
      this.connectionMessage = status
        ? 'Conexión establecida correctamente con la API'
        : 'No se pudo conectar a la API';
    });

    // ⚡ Cargar datos de DB al iniciar
    this.loadChartDataFromDB();
  }

  goToPriorizacion() { this.router.navigate(['/priorizacion']); }

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
        } else if (event.type === HttpEventType.Response) {
          const rows = typeof event.body === 'string'
            ? event.body.split('\n')
            : (event.body as string[]);

          this.procesarCsv(rows); // ⚡ actualiza gráfica
          alert("Archivo subido correctamente.");
          this.progress = 0;

          // 🔄 también recargar desde DB
          this.loadChartDataFromDB();
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
        alert('Conexión con la API exitosa.');
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error conectando a API:', err);
        alert('Error al conectar con la API.');
      }
    });
  }

  fetchAPIData(): void {
    if (!this.isConnected) {
      alert('Primero debe establecer conexión con la API');
      return;
    }

    this.isLoading = true;

    // 🔎 ejemplo: buscar "poverty"
    this.apiService.searchIndicators("poverty").subscribe({
      next: (data: any) => {
        // ✅ Ajuste: la API devuelve un objeto con @odata.count y value[]
        this.apiData = data.value || [];            // guardamos solo el array
        this.totalResultados = data['@odata.count'] || this.apiData.length; // guardamos el total
        console.log("✅ Datos recibidos de la API:", data);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error obteniendo datos:', err);
        alert('Error al obtener datos de la API');
        this.isLoading = false;
      }
    });
  }

fetchColombiaPopulation(): void {
  this.isLoading = true;
  this.apiService.getColombiaPopulation().subscribe({
    next: (data: any) => {
      console.log("📊 Datos crudos de población Colombia:", data);

      // Normalizar dependiendo del formato que llegue
      if (data.data && Array.isArray(data.data)) {
        this.colombiaPopulation = data.data;
      } else if (data.value && Array.isArray(data.value)) {
        this.colombiaPopulation = data.value;
      } else if (Array.isArray(data)) {
        this.colombiaPopulation = data;
      } else {
        this.colombiaPopulation = [];
      }

      console.log("📊 Normalizado:", this.colombiaPopulation);
      this.isLoading = false;
    },
    error: (err: any) => {
      console.error('❌ Error obteniendo datos de población de Colombia:', err);
      alert('Error al obtener población de Colombia');
      this.isLoading = false;
    }
  });
}


  setActiveTab(tab: string): void { this.activeTab = tab; }

  private procesarCsv(rows: string[]): void {
    const labels: string[] = [];
    const values: number[] = [];

    rows.forEach((row, i) => {
      if (!row.trim()) return;
      const cols = row.split(',');
      if (i === 0) return; // encabezado

      labels.push(cols[0]);
      values.push(Number(cols[1]) || 0);
    });

    this.lineChartData = {
      labels,
      datasets: [
        {
          ...this.lineChartData.datasets[0],
          data: values
        }
      ]
    };

    this.chart?.update();
  }

  // ✅ Cargar la gráfica desde DB con múltiples series
  private loadChartDataFromDB(): void {
    this.dataService.getObservations().subscribe({
      next: (data) => {
        if (!data || data.length === 0) return;

        // 1️⃣ Todos los años únicos (eje X)
        const years = Array.from(new Set(data.map(d => d.timePeriod))).sort();

        // 2️⃣ Agrupar por indicador
        const indicatorsMap = new Map<string, number[]>();
        data.forEach(d => {
          if (!indicatorsMap.has(d.indicatorName)) {
            indicatorsMap.set(d.indicatorName, Array(years.length).fill(0));
          }
          const index = years.indexOf(d.timePeriod);
          indicatorsMap.get(d.indicatorName)![index] = d.obsValue;
        });

        // 3️⃣ Construir datasets
        const datasets = Array.from(indicatorsMap.entries()).map(([name, values], i) => ({
          label: name,
          data: values,
          fill: false,
          borderColor: this.getColor(i),
          tension: 0.4
        }));

        this.lineChartData = {
          labels: years,
          datasets
        };

        this.chart?.update();
      },
      error: (err) => console.error('Error cargando datos de DB:', err)
    });
  }

  // 🔹 Generar colores distintos para cada serie
  private getColor(index: number): string {
    const colors = [
      '#3e95cd', '#8e5ea2', '#3cba9f', '#e8c3b9', '#c45850',
      '#ff6384', '#36a2eb', '#cc65fe', '#ffce56'
    ];
    return colors[index % colors.length];
  }
}
