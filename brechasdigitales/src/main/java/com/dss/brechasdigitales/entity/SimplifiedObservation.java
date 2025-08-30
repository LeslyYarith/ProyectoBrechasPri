package com.dss.brechasdigitales.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "simplified_observations")
public class SimplifiedObservation {
     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "country_code", length = 10)
    private String countryCode;
    
    @Column(name = "country_name", length = 100)
    private String countryName;
    
    @Column(name = "indicator_name", length = 255)
    private String indicatorName;
    
    @Column(name = "time_period")
    private Integer timePeriod;
    
    @Column(name = "obs_value")
    private Double obsValue;
    
    @Column(name = "unit_measure", length = 100)
    private String unitMeasure;
    
    @Column(name = "sex_label", length = 50)
    private String sexLabel = "Total";
    
    @Column(name = "age_label", length = 100)
    private String ageLabel = "All ages";
    
    @Column(name = "urbanisation_label", length = 100)
    private String urbanisationLabel = "Total";

    // Constructores
    public SimplifiedObservation() {}
    
    public SimplifiedObservation(String countryCode, String countryName, String indicatorName, 
                               Integer timePeriod, Double obsValue, String unitMeasure) {
        this.countryCode = countryCode;
        this.countryName = countryName;
        this.indicatorName = indicatorName;
        this.timePeriod = timePeriod;
        this.obsValue = obsValue;
        this.unitMeasure = unitMeasure;
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCountryCode() { return countryCode; }
    public void setCountryCode(String countryCode) { this.countryCode = countryCode; }
    
    public String getCountryName() { return countryName; }
    public void setCountryName(String countryName) { this.countryName = countryName; }
    
    public String getIndicatorName() { return indicatorName; }
    public void setIndicatorName(String indicatorName) { this.indicatorName = indicatorName; }
    
    public Integer getTimePeriod() { return timePeriod; }
    public void setTimePeriod(Integer timePeriod) { this.timePeriod = timePeriod; }
    
    public Double getObsValue() { return obsValue; }
    public void setObsValue(Double obsValue) { this.obsValue = obsValue; }
    
    public String getUnitMeasure() { return unitMeasure; }
    public void setUnitMeasure(String unitMeasure) { this.unitMeasure = unitMeasure; }
    
    public String getSexLabel() { return sexLabel; }
    public void setSexLabel(String sexLabel) { this.sexLabel = sexLabel; }
    
    public String getAgeLabel() { return ageLabel; }
    public void setAgeLabel(String ageLabel) { this.ageLabel = ageLabel; }
    
    public String getUrbanisationLabel() { return urbanisationLabel; }
    public void setUrbanisationLabel(String urbanisationLabel) { this.urbanisationLabel = urbanisationLabel; }
    
}
