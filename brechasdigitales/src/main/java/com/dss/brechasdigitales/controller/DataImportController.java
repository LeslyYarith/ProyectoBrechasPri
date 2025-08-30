package com.dss.brechasdigitales.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;



import com.dss.brechasdigitales.service.SimplifiedCsvService;


@RestController
@RequestMapping("/api/import")
@CrossOrigin(origins = "http://localhost:4200") // Permitir Angular en desarrollo
public class DataImportController {
     @Autowired
    private SimplifiedCsvService csvService;

    public DataImportController (SimplifiedCsvService csvService) {
        this.csvService = csvService;
    }
    

    // Método que maneja solicitudes POST en la ruta "/upload", recibe un archivo desde un formulario
// Verifica si el archivo está vacío y devuelve un error si es así
// Llama al servicio para procesar el archivo CSV y obtiene los resultados
// Devuelve los resultados con un estado HTTP 200 OK si todo fue exitoso
    @PostMapping("/upload")
    public ResponseEntity<List<String>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(List.of("⚠ El archivo está vacío"));
        }

        List<String> results = csvService.processCsvFile(file);
        return ResponseEntity.ok(results);
    }
    
}