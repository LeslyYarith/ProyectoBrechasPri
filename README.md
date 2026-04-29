# 🌐 Sistema DSS para Inclusión Digital

## 📝 Descripción del Proyecto

Este proyecto consiste en un **Sistema de Soporte a Decisiones (DSS)** orientado a analizar y mejorar la inclusión digital a nivel territorial.

El sistema permite visualizar, mediante **mapas interactivos** y **segmentación de datos**, la situación digital de un país. A través de un **motor de priorización basado en algoritmos**, el DSS sugiere dónde realizar inversiones estratégicas para maximizar el impacto en la conectividad y el acceso a tecnologías.

---

## 🎯 Caso de Uso Principal

Una ONG analiza los datos del sistema y detecta que una región rural presenta:

* Bajo acceso a internet
* Alta densidad de estudiantes

Con base en esta información, decide enfocar sus recursos en infraestructura digital en dicha zona, optimizando así el impacto social de su inversión.

---

## 🏗️ Arquitectura del Sistema

El sistema está diseñado bajo los tres subsistemas fundamentales de un DSS:

### 1. 📊 Subsistema de Datos (Data Subsystem)

* Conectividad con la API de la UIT
* Módulo de carga de archivos (compatibles con estructura UIT)
* Gestión de base de datos con control de versiones

---

### 2. 🧠 Subsistema de Modelos (Model Subsystem)

* Algoritmo del Motor de Priorización
* Lógica de segmentación demográfica:

  * Edad
  * Género
  * Nivel de ingresos

---

### 3. 🖥️ Subsistema de Interfaz de Usuario (User Interface Subsystem)

* Mapas interactivos georreferenciados
* Filtros dinámicos
* Dashboards de visualización
* Diseño enfocado en:

  * Ergonomía
  * Usabilidad

---

## 🛠️ Requerimientos Técnicos

### 🔓 Acceso

* Sistema de acceso libre
* No requiere autenticación (sin login ni roles)

### 📡 Fuentes de Datos

* API externa (UIT)
* Carga manual de archivos locales

### 📏 Estándares

* Aplicación de estándares de codificación
* Metodología de desarrollo documentada

### 🔄 Control de Versiones

* Uso de Git para:

  * Código fuente
  * Versionamiento de la base de datos

---

## 🚀 Objetivo del Sistema

Facilitar la toma de decisiones estratégicas para reducir la brecha digital, priorizando inversiones en zonas con mayor necesidad e impacto potencial.

---

## 📌 Notas Adicionales

Este sistema está orientado a organizaciones como ONG, entidades gubernamentales y centros de investigación interesados en mejorar el acceso a tecnologías de la información.

---
