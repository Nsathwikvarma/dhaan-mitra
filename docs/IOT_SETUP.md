# Physical ESP32 Hardware Setup & Wiring Guide

This document explains how to connect a physical ESP32 microcontroller with a capacitive moisture sensor and DHT22 temperature/humidity sensor to the Dhaan Mitra backend API.

---

## Required Hardware Components

1. **ESP32 Development Board** (ESP-WROOM-32)
2. **Capacitive Soil/Grain Moisture Sensor** (v1.2 Analog Output)
3. **DHT22 / DHT11 Temperature & Humidity Sensor**
4. **Breadboard & Jumper Wires**
5. **5V Micro-USB / Type-C Power Supply**

---

## Wiring Diagram

| Sensor Pin | ESP32 Pin | Note |
| :--- | :--- | :--- |
| **Moisture Sensor VCC** | `3.3V` | Power |
| **Moisture Sensor GND** | `GND` | Ground |
| **Moisture Sensor AOUT** | `GPIO34` (ADC1_CH6) | Analog Signal Input |
| **DHT22 VCC** | `3.3V` | Power |
| **DHT22 GND** | `GND` | Ground |
| **DHT22 DATA** | `GPIO4` | Digital Signal Input with 10k Pull-up |

---

## ESP32 C++ / Arduino Code (`dhaan_mitra_esp32.ino`)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://YOUR_SERVER_IP:5000/api/sensors/readings";

#define MOISTURE_PIN 34
#define DHTPIN 4
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    int rawAnalog = analogRead(MOISTURE_PIN);
    // Calibration formula: map raw ADC (1200 - 3200) to 10% - 25% moisture
    float moisture = map(rawAnalog, 3200, 1200, 100, 250) / 10.0;
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();

    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = "{\"deviceId\":\"MOISTURE-ESP32-01\",\"centerId\":\"PROC-001\",\"moisture\":" 
      + String(moisture, 1) + ",\"temperature\":" + String(temp, 1) + ",\"humidity\":" + String(hum, 1) + "}";

    int httpResponseCode = http.POST(jsonPayload);
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    http.end();
  }
  delay(10000); // Transmit reading every 10 seconds
}
```
