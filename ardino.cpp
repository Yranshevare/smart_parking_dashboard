// =====================================================
// SMART PARKING SYSTEM + FIREBASE
// ESP32 + 2 Ultrasonic Sensors + Servo
//
// SENSOR 1 -> SENSOR 2 = ENTRY
// SENSOR 2 -> SENSOR 1 = EXIT
//
// GATE LOGIC:
// 1. First sensor detects -> OPEN GATE
// 2. Gate stays OPEN while car is detected
// 3. Second sensor detects -> crossing confirmed
// 4. Second sensor becomes CLEAR -> start close timer
// 5. If second sensor detects again -> cancel timer
// 6. After 3 seconds continuously clear -> CLOSE GATE
// =====================================================

#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <ESP32Servo.h>

#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"


// =====================================================
// WIFI + FIREBASE
// =====================================================

#define WIFI_SSID       "Thousand Sunny"
#define WIFI_PASSWORD   "11111111"

#define API_KEY         "AIzaSyAg61F60SI-bWLNes5ZXgjVuALqWum9McE"
#define DATABASE_URL    "https://smart-parking-system-6b0a6-default-rtdb.firebaseio.com/"


// =====================================================
// PIN DEFINITIONS
// =====================================================

#define TRIG1 5
#define ECHO1 18

#define TRIG2 2
#define ECHO2 19

#define SERVO_PIN 13


// =====================================================
// PARKING SETTINGS
// =====================================================

#define MAX_CARS 5

int cars = 0;

const int DETECTION_DISTANCE = 15;


// =====================================================
// GATE SETTINGS
// =====================================================

const int GATE_CLOSED = 0;
const int GATE_OPEN   = 90;

Servo gateServo;


// =====================================================
// TIMING SETTINGS
// =====================================================

// Maximum time allowed from first sensor
// to second sensor
const unsigned long SEQUENCE_TIMEOUT = 3000;

// Gate stays open for this much time
// after second sensor becomes clear
const unsigned long GATE_CLOSE_DELAY = 3000;


// =====================================================
// STATE MACHINE
// =====================================================

enum State {

  IDLE,

  // Entry
  ENTRY_WAITING_FOR_S2,
  ENTRY_WAITING_CLEAR,

  // Exit
  EXIT_WAITING_FOR_S1,
  EXIT_WAITING_CLEAR,

  // Closing gate
  CLOSING_DELAY
};

State state = IDLE;


// =====================================================
// TIMERS
// =====================================================

unsigned long sequenceStartTime = 0;

unsigned long closeTimerStart = 0;


// =====================================================
// CURRENT GATE STATUS
// =====================================================

bool gateIsOpen = false;


// =====================================================
// FIREBASE
// =====================================================

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long lastFirebaseUpdate = 0;

const unsigned long FIREBASE_INTERVAL = 2000;


// =====================================================
// ULTRASONIC SENSOR FUNCTION
// =====================================================

long getDistance(int trigPin, int echoPin) {

  digitalWrite(trigPin, LOW);

  delayMicroseconds(2);

  digitalWrite(trigPin, HIGH);

  delayMicroseconds(10);

  digitalWrite(trigPin, LOW);

  long duration =
    pulseIn(
      echoPin,
      HIGH,
      30000
    );

  if (duration == 0) {

    return 999;
  }

  return duration * 0.0343 / 2;
}


// =====================================================
// WIFI
// =====================================================

void connectWiFi() {

  Serial.println();
  Serial.println("Connecting to WiFi...");

  WiFi.begin(
    WIFI_SSID,
    WIFI_PASSWORD
  );

  while (
    WiFi.status() != WL_CONNECTED
  ) {

    Serial.print(".");

    delay(300);
  }

  Serial.println();

  Serial.println("WiFi connected!");

  Serial.print("IP: ");

  Serial.println(
    WiFi.localIP()
  );
}


// =====================================================
// FIREBASE SETUP
// =====================================================

void setupFirebase() {

  config.api_key =
    API_KEY;

  config.database_url =
    DATABASE_URL;


  // Anonymous authentication

  if (
    Firebase.signUp(
      &config,
      &auth,
      "",
      ""
    )
  ) {

    Serial.println(
      "Firebase authentication successful"
    );

  } else {

    Serial.print(
      "Firebase authentication failed: "
    );

    Serial.println(
      config.signer.signupError.message.c_str()
    );
  }


  config.token_status_callback =
    tokenStatusCallback;


  Firebase.begin(
    &config,
    &auth
  );

  Firebase.reconnectWiFi(true);

  Serial.println(
    "Firebase initialized"
  );
}


// =====================================================
// FIREBASE UPDATE
// =====================================================

void updateFirebase() {

  if (!Firebase.ready()) {

    return;
  }


  // -------------------------------
  // CARS
  // -------------------------------

  if (
    Firebase.RTDB.setInt(
      &fbdo,
      "/smartParking/cars",
      cars
    )
  ) {

    Serial.print(
      "Firebase cars: "
    );

    Serial.println(cars);

  } else {

    Serial.print(
      "Firebase error: "
    );

    Serial.println(
      fbdo.errorReason()
    );
  }


  // -------------------------------
  // TOTAL SLOTS
  // -------------------------------

  Firebase.RTDB.setInt(
    &fbdo,
    "/smartParking/totalSlots",
    MAX_CARS
  );
}


// =====================================================
// OPEN GATE
// =====================================================

void openGate() {

  if (!gateIsOpen) {

    Serial.println();
    Serial.println(">>> GATE OPEN <<<");

    gateServo.write(
      GATE_OPEN
    );

    gateIsOpen = true;
  }
}


// =====================================================
// CLOSE GATE
// =====================================================

void closeGate() {

  if (gateIsOpen) {

    Serial.println();
    Serial.println(">>> GATE CLOSE <<<");

    gateServo.write(
      GATE_CLOSED
    );

    gateIsOpen = false;
  }
}


// =====================================================
// SETUP
// =====================================================

void setup() {

  Serial.begin(115200);


  // ===================================================
  // SENSOR 1
  // ===================================================

  pinMode(
    TRIG1,
    OUTPUT
  );

  pinMode(
    ECHO1,
    INPUT
  );


  // ===================================================
  // SENSOR 2
  // ===================================================

  pinMode(
    TRIG2,
    OUTPUT
  );

  pinMode(
    ECHO2,
    INPUT
  );


  // ===================================================
  // SERVO
  // ===================================================

  gateServo.setPeriodHertz(50);

  gateServo.attach(
    SERVO_PIN,
    500,
    2400
  );

  gateServo.write(
    GATE_CLOSED
  );

  gateIsOpen = false;


  // ===================================================
  // WIFI
  // ===================================================

  connectWiFi();


  // ===================================================
  // FIREBASE
  // ===================================================

  setupFirebase();


  // ===================================================
  // INITIAL DATA
  // ===================================================

  delay(1000);

  updateFirebase();


  // ===================================================
  // START MESSAGE
  // ===================================================

  Serial.println();
  Serial.println("==============================");
  Serial.println(" SMART PARKING SYSTEM");
  Serial.println("==============================");

  Serial.print("Cars: ");

  Serial.print(cars);

  Serial.print("/");

  Serial.println(MAX_CARS);

  Serial.println("Gate: CLOSED");

  Serial.println("System: READY");

  Serial.println("==============================");
}


// =====================================================
// LOOP
// =====================================================

void loop() {


  // ===================================================
  // READ SENSOR 1
  // ===================================================

  long distance1 =
    getDistance(
      TRIG1,
      ECHO1
    );


  delay(20);


  // ===================================================
  // READ SENSOR 2
  // ===================================================

  long distance2 =
    getDistance(
      TRIG2,
      ECHO2
    );


  // ===================================================
  // SENSOR STATUS
  // ===================================================

  bool sensor1 =
    distance1 <= DETECTION_DISTANCE;

  bool sensor2 =
    distance2 <= DETECTION_DISTANCE;


  // ===================================================
  // SERIAL MONITOR
  // ===================================================

  Serial.print("S1: ");

  Serial.print(distance1);

  Serial.print(" cm | S2: ");

  Serial.print(distance2);

  Serial.print(" cm | Cars: ");

  Serial.print(cars);

  Serial.print("/");

  Serial.println(MAX_CARS);


  // ===================================================
  // FIREBASE
  // ===================================================

  if (
    millis() - lastFirebaseUpdate
    >= FIREBASE_INTERVAL
  ) {

    lastFirebaseUpdate =
      millis();

    updateFirebase();
  }


  // ===================================================
  // STATE: IDLE
  // ===================================================

  if (state == IDLE) {


    // =================================================
    // ENTRY
    // SENSOR 1 FIRST
    // =================================================

    if (
      sensor1 &&
      !sensor2
    ) {

      Serial.println();
      Serial.println(
        "Sensor 1 detected"
      );

      Serial.println(
        "CAR ENTERING"
      );


      // Check parking availability

      if (
        cars < MAX_CARS
      ) {

        // OPEN IMMEDIATELY

        openGate();


        // Start entry sequence

        state =
          ENTRY_WAITING_FOR_S2;


        sequenceStartTime =
          millis();


        Serial.println(
          "Waiting for Sensor 2..."
        );

      } else {

        Serial.println();
        Serial.println(
          "PARKING FULL"
        );

        Serial.println(
          "Gate remains CLOSED"
        );
      }
    }


    // =================================================
    // EXIT
    // SENSOR 2 FIRST
    // =================================================

    else if (
      sensor2 &&
      !sensor1
    ) {

      Serial.println();
      Serial.println(
        "Sensor 2 detected"
      );

      Serial.println(
        "CAR EXITING"
      );


      // OPEN IMMEDIATELY

      openGate();


      // Start exit sequence

      state =
        EXIT_WAITING_FOR_S1;


      sequenceStartTime =
        millis();


      Serial.println(
        "Waiting for Sensor 1..."
      );
    }
  }


  // ===================================================
  // ENTRY:
  // SENSOR 1 → SENSOR 2
  // ===================================================

  else if (
    state == ENTRY_WAITING_FOR_S2
  ) {


    // -------------------------------------------------
    // Sensor 2 detects car
    // -------------------------------------------------

    if (sensor2) {

      Serial.println();
      Serial.println(
        "Sensor 2 detected"
      );

      Serial.println(
        "CAR REACHED SECOND SENSOR"
      );


      // Count car ONCE

      if (
        cars < MAX_CARS
      ) {

        cars++;

        Serial.println();
        Serial.println(
          "=============================="
        );

        Serial.println(
          "CAR ENTERED"
        );

        Serial.print(
          "Cars: "
        );

        Serial.print(cars);

        Serial.print("/");

        Serial.println(
          MAX_CARS
        );

        Serial.println(
          "=============================="
        );
      }


      // ------------------------------------------------
      // IMPORTANT:
      //
      // DO NOT CLOSE GATE HERE.
      //
      // Wait until Sensor 2 becomes CLEAR.
      // ------------------------------------------------

      state =
        ENTRY_WAITING_CLEAR;
    }


    // -------------------------------------------------
    // 5 SECOND TIMEOUT
    // -------------------------------------------------

    else if (
      millis() - sequenceStartTime
      >= SEQUENCE_TIMEOUT
    ) {

      Serial.println();
      Serial.println(
        "ENTRY TIMEOUT"
      );

      Serial.println(
        "Sensor 2 not detected"
      );


      // Since the car never reached
      // Sensor 2, close the gate.

      closeGate();


      state =
        IDLE;
    }
  }


  // ===================================================
  // ENTRY:
  // WAIT FOR SENSOR 2 TO CLEAR
  // ===================================================

  else if (
    state == ENTRY_WAITING_CLEAR
  ) {


    // Sensor 2 is still detecting car

    if (sensor2) {

      // Keep gate open

      if (!gateIsOpen) {

        openGate();
      }

      Serial.println(
        "S2 occupied - Gate OPEN"
      );
    }


    // Sensor 2 became clear

    else {

      Serial.println();
      Serial.println(
        "Sensor 2 CLEAR"
      );

      Serial.println(
        "Starting 3 second close timer..."
      );


      closeTimerStart =
        millis();


      state =
        CLOSING_DELAY;
    }
  }


  // ===================================================
  // EXIT:
  // SENSOR 2 → SENSOR 1
  // ===================================================

  else if (
    state == EXIT_WAITING_FOR_S1
  ) {


    // Sensor 1 detects car

    if (sensor1) {

      Serial.println();
      Serial.println(
        "Sensor 1 detected"
      );

      Serial.println(
        "CAR REACHED EXIT SENSOR"
      );


      // Decrease car count

      if (cars > 0) {

        cars--;

        Serial.println();
        Serial.println(
          "=============================="
        );

        Serial.println(
          "CAR EXITED"
        );

        Serial.print(
          "Cars: "
        );

        Serial.print(cars);

        Serial.print("/");

        Serial.println(
          MAX_CARS
        );

        Serial.println(
          "=============================="
        );

      } else {

        Serial.println(
          "Cars already 0"
        );
      }


      // Do NOT close immediately.
      //
      // Wait for Sensor 1 to become clear.

      state =
        EXIT_WAITING_CLEAR;
    }


    // -------------------------------------------------
    // 5 SECOND TIMEOUT
    // -------------------------------------------------

    else if (
      millis() - sequenceStartTime
      >= SEQUENCE_TIMEOUT
    ) {

      Serial.println();
      Serial.println(
        "EXIT TIMEOUT"
      );

      Serial.println(
        "Sensor 1 not detected"
      );


      closeGate();


      state =
        IDLE;
    }
  }


  // ===================================================
  // EXIT:
  // WAIT FOR SENSOR 1 TO CLEAR
  // ===================================================

  else if (
    state == EXIT_WAITING_CLEAR
  ) {


    // Sensor 1 still detecting

    if (sensor1) {

      // Keep gate open

      if (!gateIsOpen) {

        openGate();
      }

      Serial.println(
        "S1 occupied - Gate OPEN"
      );
    }


    // Sensor 1 became clear

    else {

      Serial.println();
      Serial.println(
        "Sensor 1 CLEAR"
      );

      Serial.println(
        "Starting 3 second close timer..."
      );


      closeTimerStart =
        millis();


      state =
        CLOSING_DELAY;
    }
  }


  // ===================================================
  // CLOSE DELAY
  // ===================================================

  else if (
    state == CLOSING_DELAY
  ) {


    // -------------------------------------------------
    // IMPORTANT SAFETY CHECK
    //
    // If either sensor detects a car again,
    // cancel the closing timer.
    // -------------------------------------------------

    if (
      sensor1 ||
      sensor2
    ) {

      Serial.println();
      Serial.println(
        "CAR DETECTED DURING CLOSE TIMER"
      );

      Serial.println(
        "CANCEL CLOSE TIMER"
      );

      Serial.println(
        "Gate remains OPEN"
      );


      // Keep gate open

      openGate();


      // Return to appropriate waiting state

      if (
        cars > 0 &&
        sensor2
      ) {

        state =
          ENTRY_WAITING_CLEAR;

      } else {

        state =
          EXIT_WAITING_CLEAR;
      }
    }


    // -------------------------------------------------
    // BOTH SENSORS CLEAR
    // -------------------------------------------------

    else {

      // Check whether 3 seconds have passed

      if (
        millis() - closeTimerStart
        >= GATE_CLOSE_DELAY
      ) {

        Serial.println();
        Serial.println(
          "3 seconds completed"
        );

        Serial.println(
          "Both sensors clear"
        );

        Serial.println(
          "Closing gate..."
        );


        closeGate();


        // System ready

        state =
          IDLE;
      }
    }
  }


  // ===================================================
  // SMALL LOOP DELAY
  // ===================================================

  delay(20);
}