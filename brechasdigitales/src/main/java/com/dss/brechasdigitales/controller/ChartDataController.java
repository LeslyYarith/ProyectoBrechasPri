package com.dss.brechasdigitales.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dss.brechasdigitales.entity.SimplifiedObservation;
import com.dss.brechasdigitales.service.DataService;

@RestController
@RequestMapping("/api/chart-data")
@CrossOrigin(origins = "*") // Permitir Angular en desarrollo

public class ChartDataController {
    @Autowired
    private DataService dataService;
    
    @GetMapping("/time-series")
    public ResponseEntity<List<SimplifiedObservation>> getTimeSeriesData(
            @RequestParam String countryCode,
            @RequestParam String indicatorName) {
        
        List<SimplifiedObservation> data = dataService.getTimeSeriesData(countryCode, indicatorName);
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/country-comparison")
    public ResponseEntity<List<SimplifiedObservation>> getCountryComparison(
            @RequestParam Integer year,
            @RequestParam String indicatorName) {
        
        List<SimplifiedObservation> data = dataService.getCountryComparison(year, indicatorName);
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/indicators")
    public ResponseEntity<Map<String, String>> getAvailableIndicators() {
        return ResponseEntity.ok(dataService.getAvailableIndicators());
    }
    
    @GetMapping("/years")
    public ResponseEntity<List<Integer>> getAvailableYears(@RequestParam String indicatorName) {
        return ResponseEntity.ok(dataService.getAvailableYears(indicatorName));
    }
    @GetMapping("/all")
public ResponseEntity<List<SimplifiedObservation>> getAllData() {
    return ResponseEntity.ok(dataService.getAllData());
}

}