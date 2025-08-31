package com.dss.brechasdigitales.controller;

import com.dss.brechasdigitales.entity.SimplifiedObservation;
import com.dss.brechasdigitales.repository.SimplifiedObservationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/observations")
@CrossOrigin(origins = "http://localhost:4200") // permite acceso desde Angular
public class SimplifiedObservationController {

    private final SimplifiedObservationRepository repository;

    public SimplifiedObservationController(SimplifiedObservationRepository repository) {
        this.repository = repository;
    }

    // Obtener todos los datos
    @GetMapping
    public List<SimplifiedObservation> getAll() {
        return repository.findAll();
    }

    // Obtener por país
    @GetMapping("/country/{countryCode}")
    public List<SimplifiedObservation> getByCountry(@PathVariable String countryCode) {
        return repository.findByCountryCode(countryCode);
    }

    // Obtener por indicador
    @GetMapping("/indicator/{indicatorName}")
    public List<SimplifiedObservation> getByIndicator(@PathVariable String indicatorName) {
        return repository.findByIndicatorName(indicatorName);
    }

    // Obtener por año
    @GetMapping("/year/{timePeriod}")
    public List<SimplifiedObservation> getByYear(@PathVariable Integer timePeriod) {
        return repository.findByTimePeriod(timePeriod);
    }
     @GetMapping("/all")
    public List<SimplifiedObservation> getAllObservations() {
        return repository.findAll();
    }
}
