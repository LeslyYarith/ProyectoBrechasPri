package com.dss.brechasdigitales.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/proxy/worldbank")
public class WorldBankController {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String WORLD_BANK_API_BASE_URL = "https://api.worldbank.org/v2";

    @GetMapping("/test")
    public ResponseEntity<String> testConnection() {
        return ResponseEntity.ok("Conexión con el backend establecida.");
    }

    // Endpoint para obtener la lista de temas
    @GetMapping("/topics")
    public ResponseEntity<String> getAllTopics() {
        String url = WORLD_BANK_API_BASE_URL + "/topic?format=json";
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("Error al obtener temas de la API del World Bank: " + e.getMessage());
        }
    }

    // Endpoint para obtener indicadores de un tema
    @GetMapping("/topics/{topicId}/indicators")
    public ResponseEntity<String> getIndicatorsByTopic(@PathVariable String topicId) {
        String url = WORLD_BANK_API_BASE_URL + "/topic/" + topicId + "/indicator?format=json";
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("Error al obtener indicadores para el tema " + topicId + ": " + e.getMessage());
        }
    }
}
