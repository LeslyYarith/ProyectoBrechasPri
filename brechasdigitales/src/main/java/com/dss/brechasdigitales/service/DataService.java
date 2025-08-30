package com.dss.brechasdigitales.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dss.brechasdigitales.entity.SimplifiedObservation;
import com.dss.brechasdigitales.repository.SimplifiedObservationRepository;

@Service
public class DataService {
        @Autowired
    private SimplifiedObservationRepository observationRepository;
    
    public List<SimplifiedObservation> getTimeSeriesData(String countryCode, String indicatorName) {
        return observationRepository.findByCountryCodeAndIndicatorNameOrderByTimePeriod(countryCode, indicatorName);
    }
    
    public List<SimplifiedObservation> getCountryComparison(Integer year, String indicatorName) {
        return observationRepository.findByTimePeriodAndIndicatorNameOrderByObsValueDesc(year, indicatorName);
    }
    
    public Map<String, String> getAvailableIndicators() {
        List<String> indicators = observationRepository.findDistinctIndicatorNames();
        return indicators.stream()
                .collect(Collectors.toMap(
                        indicator -> indicator, 
                        indicator -> indicator // O podrías tener un mapa de nombres más amigables
                ));
    }
    
    public List<Integer> getAvailableYears(String indicatorName) {
        return observationRepository.findAvailableYears(indicatorName);
    }
    
    public Map<String, Integer> getLatestData() {
        return observationRepository.findLatestYearsPerIndicator().stream()
                .collect(Collectors.toMap(
                        result -> (String) result[0],
                        result -> (Integer) result[1]
                ));
    }
    public List<SimplifiedObservation> getAllData() {
    return observationRepository.findAll();
}
    
}