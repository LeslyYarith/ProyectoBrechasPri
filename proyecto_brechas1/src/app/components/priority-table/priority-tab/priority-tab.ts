import { Component, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';   // 👈 Necesario para directivas como *ngIf, *ngFor y pipes
import { FormsModule } from '@angular/forms';     // 👈 Necesario para inputs, select y binding [(ngModel)]
import { PrioritizationService, PriorityRegion } from '../../../services/prioritization-service';

@Component({
  selector: 'app-priority-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './priority-tab.html',
  styleUrls: ['./priority-tab.css']   // ✅ corregido: styleUrls en plural y como array
})
export class PriorityTabComponent {
  // ================================
  // VARIABLES DEL FILTRO Y DATOS
  // ================================
  priorityRegions: PriorityRegion[] = [];   // 👈 Lista de regiones priorizadas que se mostrarán en la tabla
  availableIndicators: string[] = [];       // 👈 Lista de indicadores que se cargarán en el <select>
  selectedIndicator: string = '';           // 👈 Indicador actualmente seleccionado en el filtro
  minYear: number = 2010;                   // 👈 Año mínimo seleccionado en el filtro
  maxYear: number = 2025;                   // 👈 Año máximo seleccionado en el filtro
  isLoading: boolean = false;               // 👈 Bandera para mostrar un spinner mientras carga
  errorMessage: string = '';                // 👈 Mensaje de error si falla la carga de datos
  isDarkMode: boolean = false;              // 👈 Bandera para saber si está en modo oscuro o claro
  today: Date = new Date();                 // 👈 Fecha actual para "Última Actualización"

  // Control ver más/menos
  visibleCount: number = 10;                // número de filas a mostrar inicialmente
  isExpanded: boolean = false;              // si true, se muestran todas las filas

  // Estado de exportación
  isExporting: boolean = false;

  constructor(
    private prioritizationService: PrioritizationService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.loadAvailableIndicators();  // 👈 Al iniciar el componente, se cargan los indicadores

    // Detectar si el body tiene dark-mode al iniciar
    this.isDarkMode = document.body.classList.contains('dark-mode');

    // Observar cambios en el body para actualizar el flag
    const observer = new MutationObserver(() => {
      this.isDarkMode = document.body.classList.contains('dark-mode');
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Mantener actualizada la fecha cada minuto
    setInterval(() => {
      this.today = new Date();
    }, 60000);
  }

  // ================================
  // CARGAR LISTA DE INDICADORES
  // ================================
  loadAvailableIndicators(): void {
    this.prioritizationService.getAvailableIndicators().subscribe({
      next: (indicators) => {
        this.availableIndicators = indicators;
        if (indicators.length > 0) {
          this.selectedIndicator = indicators[0];
          this.loadPriorityRegions();
        }
      },
      error: (error) => {
        console.error('Error loading indicators:', error);
      }
    });
  }

  // ================================
  // CARGAR REGIONES PRIORIZADAS (TABLA)
  // ================================
  loadPriorityRegions(): void {
    if (!this.selectedIndicator) return;

    this.isLoading = true;
    this.errorMessage = '';

    // Al cargar nuevos datos, colapsamos la tabla a su estado inicial
    this.isExpanded = false;

    this.prioritizationService.getPriorityRegions(
      this.selectedIndicator,
      this.minYear,
      this.maxYear
    ).subscribe({
      next: (data) => {
        this.priorityRegions = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los datos de priorización';
        this.isLoading = false;
        console.error('Error:', error);
      }
    });
  }

  // EVENTO: CAMBIO DE INDICADOR
  onIndicatorChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedIndicator = select.value;
    this.loadPriorityRegions();
  }

  // EVENTO: CAMBIO DE RANGO DE AÑOS
  onYearRangeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.id === 'minYear') {
      this.minYear = Number(input.value);
    } else if (input.id === 'maxYear') {
      this.maxYear = Number(input.value);
    }
    this.loadPriorityRegions();
  }

  // CLASES CSS SEGÚN PRIORIDAD
  getPriorityClass(score: number): string {
    if (score > 0.7) return 'high-priority';
    if (score > 0.4) return 'medium-priority';
    return 'low-priority';
  }

  // CLASES CSS DE TABLA SEGÚN TEMA
  getTableThemeClass(): string {
    return this.isDarkMode ? 'table-dark' : 'table-light';
  }

  // Alternar expansión/plegado de filas
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  // Obtén las filas actualmente visibles (se mantiene para la UI, no para exportar)
  private getDisplayedRegions(): PriorityRegion[] {
    return this.isExpanded ? this.priorityRegions : this.priorityRegions.slice(0, this.visibleCount);
  }

  // util para limpiar el nombre del archivo
  private sanitizeFilename(name: string): string {
    return (name || 'indicador')
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^\w\-\.]/g, '');
  }

  // util para formatear números sin separador de miles
  private toFixed2(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value as number)) return '';
    return (value as number).toFixed(2);
  }

  // util para escapar valores CSV cuando haga falta
  private csvEscape(val: string | number): string {
    let s = (val ?? '').toString();
    if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
      s = '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  // ⭐ CAMBIO: generar y descargar CSV con TODAS las filas (ignora ver más/menos)
  downloadCSV(): void {
    if (this.isLoading || this.priorityRegions.length === 0) return;

    try {
      this.isExporting = true;

      // ⭐ CAMBIO: siempre tomamos todas las filas
      const rows = this.priorityRegions.slice(); // copia defensiva

      const headers = [
        'Prioridad',
        'País',
        'Código',
        'Valor Actual',
        'Tasa de Crecimiento',
        'Score de Prioridad',
        'Año más reciente'
      ];

      const lines: string[] = [];
      lines.push(headers.join(','));

      rows.forEach((region, idx) => {
        const row = [
          (idx + 1).toString(),
          this.csvEscape(region.countryName),
          this.csvEscape(region.countryCode),
          this.toFixed2(region.currentValue),
          this.csvEscape(this.toFixed2(region.growthRate) + '%'),
          this.toFixed2(region.priorityScore),
          (region.latestYear ?? '').toString()
        ];
        lines.push(row.join(','));
      });

      // Agregamos BOM para compatibilidad con Excel (UTF-8)
      const csvContent = '\uFEFF' + lines.join('\n');

      const indicatorSafe = this.sanitizeFilename(this.selectedIndicator);
      // ⭐ CAMBIO: nombre consistente indicando "all"
      const filename = `prioridades_${indicatorSafe}_${this.minYear}-${this.maxYear}_all.csv`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      // Limpieza
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error al exportar CSV:', e);
      this.errorMessage = 'No se pudo descargar el CSV. Inténtalo de nuevo.';
    } finally {
      this.isExporting = false;
    }
  }
}
