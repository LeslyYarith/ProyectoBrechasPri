import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import * as echarts from 'echarts';
import { Observation, ObservationService } from '../../services/observation';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [], // 👈 Quitamos HttpClientModule (usa provideHttpClient en main.ts)
  template: `
    <div class="map-container">
      <!-- 🔍 Buscador -->
      <input
        type="text"
        placeholder="Buscar país..."
        (keyup.enter)="buscarPais($event)"
        class="buscador"
      />

      <!-- 📝 Explicación -->
      <div class="info-box">
        🌍 Cada país está coloreado según su valor de observación.<br />
        🔍 Usa la barra de búsqueda para encontrar un país y acercar la vista.<br />
        🖱️ También puedes hacer <b>zoom</b> y mover el mapa con el ratón.
      </div>

      <!-- 📌 Contenedor del mapa -->
      <div #chart style="width: 100%; height: 600px;"></div>
    </div>
  `,
  styleUrls: ['./mapa.css'],
})
export class MapaComponent implements OnInit, AfterViewInit {
  @ViewChild('chart', { static: true }) chartElement!: ElementRef;
  private chart!: echarts.ECharts;
  private chartData: any[] = [];

  constructor(
    private http: HttpClient,
    private observationService: ObservationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Aquí puedes cargar datos si quieres, pero NO iniciar ECharts todavía
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // 👇 Esperar al render del DOM para asegurar ancho/alto
      setTimeout(() => this.inicializarMapa(), 0);
    }
  }

  private inicializarMapa() {
    this.chart = echarts.init(this.chartElement.nativeElement);

    // 1. Cargar mapa base (world.json debe estar en src/assets/world.json)
    this.http.get('assets/world.json').subscribe((worldMap: any) => {
      echarts.registerMap('world', worldMap);

      // 2. Obtener datos del backend
      this.observationService.getAll().subscribe((observations: Observation[]) => {
        const grouped: { [key: string]: Observation } = {};
        observations.forEach((obs) => {
          if (
            !grouped[obs.countryName] ||
            obs.timePeriod > grouped[obs.countryName].timePeriod
          ) {
            grouped[obs.countryName] = obs;
          }
        });

        // ✅ Datos para el mapa
        this.chartData = Object.values(grouped).map((obs) => ({
          name: obs.countryName,
          value: obs.obsValue,
          indicatorName: obs.indicatorName,
          timePeriod: obs.timePeriod,
          unitMeasure: obs.unitMeasure,
          sexLabel: obs.sexLabel,
          ageLabel: obs.ageLabel,
          urbanisationLabel: obs.urbanisationLabel,
        }));

        console.log('✅ Datos cargados:', this.chartData);

        const option = {
          tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
              if (!params.data) return `${params.name}<br/>Sin datos`;
              const d = params.data;
              return `
                <strong>${params.name}</strong><br/>
                Valor: ${d.value || 'Sin datos'} ${d.unitMeasure || ''}<br/>
                Indicador: ${d.indicatorName}<br/>
                Año: ${d.timePeriod}<br/>
              `;
            },
          },
          visualMap: {
            min: 0,
            max: 200,
            text: ['Alto', 'Bajo'],
            left: 'left',
            bottom: '10px',
            inRange: { color: ['#d4f1f9', '#005f73'] },
            calculable: true,
          },
          geo: {
            map: 'world',
            roam: true,
            scaleLimit: { min: 1, max: 10 },
            emphasis: { label: { show: false } },
          },
          series: [
            {
              name: 'Mapa',
              type: 'map',
              geoIndex: 0,
              roam: true,
              data: this.chartData,
            },
          ],
        };

        this.chart.setOption(option);
        this.chart.resize(); // 👈 fuerza render por si el div estaba colapsado
      });
    });
  }

  // 🔍 Buscar y resaltar país
  buscarPais(event: any) {
    const nombre = event.target.value.trim();
    if (!nombre) return;

    const pais = this.chartData.find(
      (d) => d.name.toLowerCase() === nombre.toLowerCase()
    );
    if (pais) {
      this.chart.dispatchAction({
        type: 'highlight',
        name: pais.name,
      });
      this.chart.dispatchAction({
        type: 'showTip',
        name: pais.name,
      });
    } else {
      alert('País no encontrado');
    }
  }
}
