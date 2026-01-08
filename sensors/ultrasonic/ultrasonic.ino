#include "Arduino.h"
#include <ArduinoJson.h>
#include <WiFi.h>
#include <HTTPClient.h>

const int deviceId = 1;
const char* ssid = "AHS-IoT-Devices-2.4";
const char* password = "DitIsSimpel";

class Ultrasonic
{
    public:
    Ultrasonic(int pin);
    void DistanceMeasure(void);
    double microsecondsToCentimeters(void);
    double microsecondsToInches(void);
    private:
    int this_pin;//pin number of Arduino that is connected with SIG pin of Ultrasonic Ranger.
    long duration;// the Pulse time received;
};
Ultrasonic::Ultrasonic(int pin)
{
    this_pin = pin;
}
/*Begin the detection and get the pulse back signal*/
void Ultrasonic::DistanceMeasure(void)
{
    pinMode(this_pin, OUTPUT);
    digitalWrite(this_pin, LOW);
    delayMicroseconds(2);
    digitalWrite(this_pin, HIGH);
    delayMicroseconds(5);
    digitalWrite(this_pin,LOW);
    pinMode(this_pin,INPUT);
    duration = pulseIn(this_pin,HIGH);
}
/*The measured distance from the range 0 to 400 Centimeters*/
double Ultrasonic::microsecondsToCentimeters(void)
{
    return duration/29.0/2.0;
}
/*The measured distance from the range 0 to 157 Inches*/
double Ultrasonic::microsecondsToInches(void)
{
    return duration/74.0/2.0;
}

Ultrasonic ultrasonic(9);
void setup()
{
  Serial.begin(9600);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected!");
  JsonDocument doc;

  doc["id"] = deviceId;
  sendJsonRequest("https://sensor-routes.vercel.app/sensor", "POST", doc);
}

void loop()
{
    double RangeInCentimeters;
    ultrasonic.DistanceMeasure();
    RangeInCentimeters = ultrasonic.microsecondsToCentimeters();

    JsonDocument doc;

    JsonArray data = doc["data"].to<JsonArray>();
    data.add(RangeInCentimeters);

    serializeJson(doc, Serial);
    sendJsonRequest("https://sensor-routes.vercel.app/sensor/" + String(deviceId), "PATCH", doc);

    delay(2000);
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