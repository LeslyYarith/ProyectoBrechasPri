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
  imports: [],
  templateUrl: './mapa.html',
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

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.inicializarMapa(), 0);
    }
  }

  private inicializarMapa() {
    this.chart = echarts.init(this.chartElement.nativeElement);

    // 👀 Loader mientras carga
    this.chart.showLoading('default', {
      text: 'Cargando mapa...',
      color: '#005f73',
    });

    // 1. Cargar mapa base
    this.http.get('assets/world.json').subscribe((worldMap: any) => {
      echarts.registerMap('world', worldMap);

      // 2. Mostrar el mapa vacío al instante
      this.chart.setOption({
        tooltip: { trigger: 'item' },
        geo: {
          map: 'world',
          roam: true,
          zoom: 1.2,
          scaleLimit: { min: 1, max: 10 },
          emphasis: { label: { show: false } },
        },
        series: [
          {
            name: 'Mapa',
            type: 'map',
            geoIndex: 0,
            roam: true,
            data: [],
          },
        ],
      });

      // 3. Obtener datos del backend
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

        // ✅ Preparar datos
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

        // 4. Actualizar mapa con datos
        this.chart.setOption({
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
          series: [
            {
              name: 'Mapa',
              type: 'map',
              geoIndex: 0,
              roam: true,
              data: this.chartData,
            },
          ],
        });

        this.chart.hideLoading();
        this.chart.resize();
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
      this.chart.dispatchAction({ type: 'highlight', name: pais.name });
      this.chart.dispatchAction({ type: 'showTip', name: pais.name });
    } else {
      alert('País no encontrado');
    }
  }
}
