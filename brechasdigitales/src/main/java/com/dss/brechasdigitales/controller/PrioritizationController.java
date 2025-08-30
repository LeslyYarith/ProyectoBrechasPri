// src/main/java/com/dss/brechasdigitales/controller/PrioritizationController.java
package com.dss.brechasdigitales.controller;

import com.dss.brechasdigitales.repository.SimplifiedObservationRepository;
import com.dss.brechasdigitales.service.PrioritizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prioritization")
@CrossOrigin(origins = "http://localhost:4200")
public class PrioritizationController {
    
    @Autowired
    private PrioritizationService prioritizationService;

    @Autowired
    private SimplifiedObservationRepository observationRepository; // ✅ ahora sí se inyecta
    
    @GetMapping("/regions")
    public List<PrioritizationService.PriorityRegion> getPriorityRegions(
            @RequestParam String indicator,
            @RequestParam(defaultValue = "2010") int minYear,
            @RequestParam(defaultValue = "2025") int maxYear) {
        
        return prioritizationService.getPriorityRegions(indicator, minYear, maxYear);
    }
    
    @GetMapping("/indicators")
    public List<String> getAvailableIndicators() {
        return observationRepository.findDistinctIndicatorNames();
    }
}

