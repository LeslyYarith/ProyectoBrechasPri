import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';   // 👈 Necesario para directivas como *ngIf, *ngFor y pipes
import { FormsModule } from '@angular/forms';     // 👈 Necesario para inputs, select y binding [(ngModel)]
import { PrioritizationService, PriorityRegion } from '../../../services/prioritization-service';



@Component({
  selector: 'app-priority-tab',
  imports: [CommonModule,
    FormsModule],
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

  constructor(private prioritizationService: PrioritizationService) {}

  ngOnInit(): void {
    this.loadAvailableIndicators();  // 👈 Al iniciar el componente, se cargan los indicadores
  }
// ================================
  // CARGAR LISTA DE INDICADORES
  // ================================
  loadAvailableIndicators(): void {
    this.prioritizationService.getAvailableIndicators().subscribe({
      next: (indicators) => {
        this.availableIndicators = indicators;   // 👈 Se guardan los indicadores recibidos
        if (indicators.length > 0) {
          this.selectedIndicator = indicators[0]; // 👈 Se selecciona el primero por defecto
          this.loadPriorityRegions();             // 👈 Se cargan las regiones según ese indicador
        }
      },
      error: (error) => {
        console.error('Error loading indicators:', error); // 👈 Manejo de error
      }
    });
  }
// ================================
  // CARGAR REGIONES PRIORIZADAS (TABLA)
  // ================================
  loadPriorityRegions(): void {
    if (!this.selectedIndicator) return;  // 👈 Si no hay indicador seleccionado, no hace nada

    this.isLoading = true;    // 👈 Se activa el spinner
    this.errorMessage = '';   // 👈 Se limpia cualquier error previo

    this.prioritizationService.getPriorityRegions(
      this.selectedIndicator, // 👈 Indicador seleccionado en el filtro
      this.minYear,           // 👈 Año mínimo
      this.maxYear            // 👈 Año máximo
    ).subscribe({
      next: (data) => {
        this.priorityRegions = data;  // 👈 Se guardan los datos en la tabla
        this.isLoading = false;       // 👈 Se apaga el spinner
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los datos de priorización'; // 👈 Se muestra error en la UI
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
    this.selectedIndicator = select.value;   // 👈 Se actualiza el indicador seleccionado
    this.loadPriorityRegions();              // 👈 Se recargan los datos de la tabla
  }
// ================================
  // EVENTO: CAMBIO DE RANGO DE AÑOS
  // ================================
  onYearRangeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.id === 'minYear') {
      this.minYear = Number(input.value);  // 👈 Actualiza año mínimo
    } else if (input.id === 'maxYear') {
      this.maxYear = Number(input.value);  // 👈 Actualiza año máximo
    }
    this.loadPriorityRegions();            // 👈 Se recargan los datos con el nuevo rango
  }

  // ================================
  // CLASES CSS SEGÚN PRIORIDAD
  // ================================
  getPriorityClass(score: number): string {
    if (score > 0.7) return 'high-priority';   // 👈 Alta prioridad
    if (score > 0.4) return 'medium-priority'; // 👈 Media prioridad
    return 'low-priority';                     // 👈 Baja prioridad
  }



}
