package com.dss.brechasdigitales.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.dss.brechasdigitales.entity.SimplifiedObservation;
import com.dss.brechasdigitales.repository.SimplifiedObservationRepository;

@Service
public class SimplifiedCsvService {

    @Autowired
    private SimplifiedObservationRepository observationRepository;

    private static final int BATCH_SIZE = 2000; // Aumentamos el tamaño del lote

    @Transactional // Agregamos transacción para mejor performance
    public List<String> processCsvFile(MultipartFile file) {
        List<String> results = new ArrayList<>();
        AtomicInteger processed = new AtomicInteger(0);
        AtomicInteger skipped = new AtomicInteger(0);
        long startTime = System.currentTimeMillis();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            CSVFormat format = CSVFormat.DEFAULT.builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setIgnoreHeaderCase(true)
                    .setTrim(true)
                    .build();

            try (CSVParser csvParser = new CSVParser(reader, format)) {

                List<SimplifiedObservation> batch = new ArrayList<>(BATCH_SIZE);
                final int[] counter = {0};

                csvParser.stream().forEach(record -> {
                    try {
                        SimplifiedObservation observation = mapCsvToObservation(record);
                        if (observation != null) {
                            batch.add(observation);
                            processed.incrementAndGet();

                            if (batch.size() >= BATCH_SIZE) {
                                observationRepository.saveAll(batch);
                                batch.clear();
                                System.out.println("Procesado lote: " + (++counter[0] * BATCH_SIZE) + " registros");
                            }
                        } else {
                            skipped.incrementAndGet();
                        }
                    } catch (Exception e) {
                        skipped.incrementAndGet();
                        results.add("Error en línea " + record.getRecordNumber() + ": " + e.getMessage());
                    }
                });

                // Guardar los registros restantes
                if (!batch.isEmpty()) {
                    observationRepository.saveAll(batch);
                }

                long endTime = System.currentTimeMillis();
                double seconds = (endTime - startTime) / 1000.0;
                
                results.add(0, "✅ Procesamiento completado: " + processed.get() + 
                        " registros importados, " + skipped.get() + " registros omitidos");
                results.add("⏱ Tiempo total: " + seconds + " segundos");
                results.add("📊 Velocidad: " + String.format("%.2f", processed.get() / seconds) + " registros/segundo");
            }

        } catch (Exception e) {
            throw new RuntimeException("Error procesando archivo CSV: " + e.getMessage(), e);
        }

        return results;
    }

    // Método mapCsvToObservation sin cambios...
    private SimplifiedObservation mapCsvToObservation(CSVRecord record) {
        if (!record.isMapped("REF_AREA") || !record.isMapped("INDICATOR_LABEL") ||
            !record.isMapped("TIME_PERIOD") || !record.isMapped("OBS_VALUE")) {
            return null;
        }

        String obsValueStr = record.get("OBS_VALUE");
        if (obsValueStr == null || obsValueStr.trim().isEmpty()) {
            return null;
        }

        try {
            SimplifiedObservation observation = new SimplifiedObservation();
            observation.setCountryCode(record.get("REF_AREA"));
            observation.setCountryName(record.get("REF_AREA_LABEL"));
            observation.setIndicatorName(record.get("INDICATOR_LABEL"));
            observation.setTimePeriod(Integer.parseInt(record.get("TIME_PERIOD")));
            observation.setObsValue(Double.parseDouble(obsValueStr));
            observation.setUnitMeasure(record.get("UNIT_MEASURE_LABEL"));
            observation.setSexLabel(getOptionalValue(record, "SEX_LABEL", "Total"));
            observation.setAgeLabel(getOptionalValue(record, "AGE_LABEL", "All ages"));
            observation.setUrbanisationLabel(getOptionalValue(record, "URBANISATION_LABEL", "Total"));
            return observation;

        } catch (NumberFormatException e) {
            throw new RuntimeException("Valor numérico inválido en la línea: " + record.getRecordNumber());
        }
    }

    private String getOptionalValue(CSVRecord record, String column, String defaultValue) {
        try {
            String value = record.get(column);
            return (value == null || value.trim().isEmpty()) ? defaultValue : value;
        } catch (IllegalArgumentException e) {
            return defaultValue;
        }
    }
}