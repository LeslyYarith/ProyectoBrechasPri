import { Component, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';   // 👈 Necesario para directivas como *ngIf, *ngFor y pipes
import { FormsModule } from '@angular/forms';     // 👈 Necesario para inputs, select y binding [(ngModel)]
import { PrioritizationService, PriorityRegion } from '../../../services/prioritization-service';

@Component({
  selector: 'app-priority-tab',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './priority-tab.html',
  styleUrl: './priority-tab.css'
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

  constructor(
    private prioritizationService: PrioritizationService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.loadAvailableIndicators();  // 👈 Al iniciar el componente, se cargan los indicadores

    // 👇 Detectar si el body tiene dark-mode al iniciar
    this.isDarkMode = document.body.classList.contains('dark-mode');

    // 👇 Observar cambios en el body para actualizar el flag
    const observer = new MutationObserver(() => {
      this.isDarkMode = document.body.classList.contains('dark-mode');
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // 👇 Mantener actualizada la fecha cada minuto
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

  // ================================
  // EVENTO: CAMBIO DE INDICADOR
  // ================================
  onIndicatorChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedIndicator = select.value;
    this.loadPriorityRegions();
  }

  // ================================
  // EVENTO: CAMBIO DE RANGO DE AÑOS
  // ================================
  onYearRangeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.id === 'minYear') {
      this.minYear = Number(input.value);
    } else if (input.id === 'maxYear') {
      this.maxYear = Number(input.value);
    }
    this.loadPriorityRegions();
  }

  // ================================
  // CLASES CSS SEGÚN PRIORIDAD
  // ================================
  getPriorityClass(score: number): string {
    if (score > 0.7) return 'high-priority';
    if (score > 0.4) return 'medium-priority';
    return 'low-priority';
  }

  // ================================
  // CLASES CSS DE TABLA SEGÚN TEMA
  // ================================
  getTableThemeClass(): string {
    return this.isDarkMode ? 'table-dark' : 'table-light';
  }
}
