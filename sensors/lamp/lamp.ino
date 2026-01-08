#include "Arduino.h"
#include <ArduinoJson.h>
#include <WiFi.h>
#include <HTTPClient.h>

const int deviceId = 2;
const char* ssid = "AHS-IoT-Devices-2.4";
const char* password = "DitIsSimpel";

int brightness = 255;
bool state = false;

void setup() {
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected!");
  JsonDocument doc;

  doc["id"] = deviceId;
  sendJsonRequest("https://sensor-routes.vercel.app/sensor", "POST", doc);

  delay(2000);
}


void loop() {  
  JsonDocument requestDoc; // Empty because GET doesn't need a body
  
  String res = sendJsonRequest("https://sensor-routes.vercel.app/sensor/" + String(deviceId), "GET", requestDoc);

  JsonDocument readDoc;
  DeserializationError error = deserializeJson(readDoc, res);

  if (!error) {
    state = readDoc["sensor"]["data"][0].as<bool>();
    
    Serial.print("State: ");
    Serial.println(state);
    Serial.print("Brightness: ");
    Serial.println(brightness);

    if (state) {
      analogWrite(9, 0);
    } else {
      analogWrite(9, brightness);
    }
  } else {
    Serial.print("JSON Error: ");
    Serial.println(error.c_str());
  }
}

/**
 * Sends an HTTP request and returns the response body.
 * @param url The endpoint URL
 * @param method The HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param payload The body of the request (for POST/PATCH/PUT)
 */
String sendJsonRequest(String url, String method, const JsonDocument& doc) {
  if (WiFi.status() != WL_CONNECTED) {
    return "Error: WiFi not connected";
  }

  HTTPClient http;
  String response = "";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  // Convert the JsonDocument to a String for the request body
  String requestBody;
  serializeJson(doc, requestBody);

  int httpResponseCode = -1;

  if (method == "POST") {
    httpResponseCode = http.POST(requestBody);
  } else if (method == "PUT") {
    httpResponseCode = http.PUT(requestBody);
  } else if (method == "PATCH") {
    httpResponseCode = http.PATCH(requestBody);
  } else {
    // For GET or DELETE, usually you don't send a body
    httpResponseCode = http.sendRequest(method.c_str());
  }

  if (httpResponseCode > 0) {
    response = http.getString();
  } else {
    response = "Error: " + String(httpResponseCode);
  }

  http.end();
  return response;
}  