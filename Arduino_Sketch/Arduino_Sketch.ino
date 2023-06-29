#include <Wire.h>
#include <U8g2lib.h>
#include <qrcode.h>

// Display configuration
U8G2_SSD1306_128X64_NONAME_F_SW_I2C u8g2(U8G2_R0, /* clock=*/ SCL, /* data=*/ SDA, /* reset=*/ U8X8_PIN_NONE);

QRCode qrcode;

void setup() {
  // Initialize display
  u8g2.begin();
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_ncenB14_tr);

  // Initialize Serial communication
  Serial.begin(9600);
}

void loop() {
  String a1SensorValue = String(analogRead(A1)); // Read the value of A1 Sensor and convert it to a String
  const char *data = a1SensorValue.c_str(); // Convert the String to a C-style string (const char *)

  // Generate QR code
  uint8_t qrcodeData[qrcode_getBufferSize(1)];
  qrcode_initText(&qrcode, qrcodeData, 1, ECC_LOW, data);

  // Draw QR code on OLED
  u8g2.clearBuffer();
  for (uint8_t y = 0; y < qrcode.size; y++) {
    for (uint8_t x = 0; x < qrcode.size; x++) {
      if (qrcode_getModule(&qrcode, x, y)) {
        u8g2.drawBox(x * 2, y * 2, 2, 2);
      }
    }
  }

  // Send buffer to display
  u8g2.sendBuffer();

  // Read and print values of A0 through A3
  Serial.print("A0: ");
  Serial.println(analogRead(A0));
  Serial.print("A1: ");
  Serial.println(analogRead(A1));
  Serial.print("A2: ");
  Serial.println(analogRead(A2));
  Serial.print("A3: ");
  Serial.println(analogRead(A3));

  // Add a small delay before refreshing the QR code
  delay(250);
}
