# IoT Experimentation

## Overview

An ESP8266 D1 Mini microcontroller reads sensor data on a configurable interval and ships it through a cloud-native AWS pipeline to InfluxDB and Grafana. A PC-based simulator is included so the pipeline can be tested without physical hardware. 

## Showcase

[Grafana Public Dashboard](https://lbirchenprojectiot.grafana.net/public-dashboards/1471ef71123f4562ac81b2c83ca5a912?refresh=30s&from=now-24h&to=now&timezone=browser)

## Tech Stack

- **Device:** ESP8266 D1 Mini (MicroPython)
- **Sensors:** SHARP 2Y0A21 IR distance sensor, digital switch
- **Transport:** MQTT over TLS (AWS IoT Core)
- **Pipeline:** AWS IoT Core -> Kinesis Data Streams -> Lambda (Python)
- **Storage:** InfluxDB Cloud Serverless
- **Visualisation:** Grafana Cloud
- **Laravel API:** Parallel HTTP POST to a Laravel backend for comparison/original path

## Hardware

The physical setup uses an ESP8266 D1 Mini as the microcontroller, running MicroPython. Two sensors are wired up: a SHARP 2Y0A21 infrared distance sensor which outputs an analogue voltage that maps to distance, and a simple digital switch. Both are read every 30 seconds and the readings are packaged into an MQTT payload for the cloud pipeline.

<div class="grid grid-cols-2 gap-4 my-4">
  <img src="https://res.cloudinary.com/duevte0ku/image/upload/w_800,q_auto,f_auto/v1775543571/iot-hardware1_fggydc.jpg" alt="IoT hardware setup 1" class="rounded-lg border border-gray-700 w-full h-auto" />
  <img src="https://res.cloudinary.com/duevte0ku/image/upload/w_800,q_auto,f_auto/v1775546260/iot-hardware3_gywo56.jpg" alt="IoT hardware setup 2" class="rounded-lg border border-gray-700 w-full h-auto" />
</div>

## Project Origins

This project began as a learning exercise with my friend Hiroshi Ransom, exploring core IoT concepts: sending sensor data from a microcontroller to a backend and visualising it in a web page. I was learning Laravel at the time, so it made a natural choice for the backend API. Livewire was a good fit for the frontend, as its built-in polling and component-driven design suited a dashboard layout better than standard Blade templates. We initially used a Raspberry Pi with a wired connection, but later moved toward a wireless "IoT box": an ESP8266 in a custom enclosure to better simulate a real field device.

The ESP8266 POSTs sensor readings directly to a Laravel REST API, which stores them in a database and surfaces them through a [Livewire dashboard](https://iotproject-wamacq4e.on-forge.com/sensor-data) with live-updating charts (username: test@test.com, password: hiroluke123).

![Laravel Livewire sensor dashboard](https://res.cloudinary.com/duevte0ku/image/upload/v1775556033/IoT-LivewireChart_mg2sjk.png)

## Cloud Native Upgrade

After getting my AWS Cloud Practitioner certification I wanted to apply that knowledge to something practical. Extending this project into a cloud-native pipeline felt like a natural next step, as it aligns more closely with how IoT devices are managed at scale in industry. It gave me a reason to explore AWS IoT Core, Kinesis, and Lambda together in a real pipeline rather than just reading about them.

## Architecture

![IoT pipeline architecture](https://res.cloudinary.com/duevte0ku/image/upload/v1775540743/iot-architecture_wgmht0.png)

The pipeline is designed to support multiple devices, with each device publishing MQTT payloads to AWS IoT Core, identified by its own topic. An IoT Core rule forwards every message to a Kinesis stream, a Lambda function consumes the stream, converts payloads to InfluxDB line protocol, and batch-writes to InfluxDB Cloud. Grafana sits on top of InfluxDB for dashboarding, with readings partitioned by device ID so each device can be tracked independently. Devices also POST directly to a Laravel API, the original integration that predates the AWS pipeline and runs in parallel.

## Cloud Setup

### AWS IoT Core
- Thing: `esp8266-box1` with auto-generated certificates (PKCS#1 DER format for ESP8266 axTLS compatibility)
- Policy allows Connect, Publish, Subscribe, and Receive on `esp8266/box1/*`
- IoT Rule `esp8266_box1_to_kinesis`: `SELECT * FROM 'esp8266/box1/#'` -> Kinesis

### Kinesis
- Stream: `esp8266-box1-stream`, provisioned, 1 shard, 24h retention
- Partition key: `${topic()}`

### Lambda
- Function: `esp8266-kinesis-processor`, Python 3.12
- Trigger: Kinesis stream, batch size 10, Trim horizon
- Decodes base64 Kinesis records, converts to InfluxDB line protocol, batch-writes to InfluxDB
- All credentials (InfluxDB URL, token, org, bucket) via environment variables

### InfluxDB Cloud Serverless
- Org: `IoTProject`, bucket: `esp8266-sensors`, 30-day retention
- Measurement: `sensor_readings`, tags: `device_id` / `sensor_type` / `unit`, field: `value`

### Grafana Cloud
- Data source: InfluxDB plugin with SQL query language
- Dashboard: distance time series (partitioned by `device_id`) + switch state timeline (0=Open/1=Active)
- Public dashboard enabled with time range and refresh controls

## Challenges & Learnings

**TLS on the ESP8266**

Getting mTLS working with AWS IoT Core on the ESP8266 was the most frustrating part. AWS generates certificates in PKCS#8 format by default, but the ESP8266's SSL implementation is built on axTLS — a minimal library that only supports RSA keys in PKCS#1 DER (binary) format. The connection would silently fail until I realised the certificates needed to be repackaged with OpenSSL before flashing them to the device.

Even once connected, the TLS handshake is painfully slow. A 2048-bit RSA handshake on this hardware takes around 50 seconds. On top of that, MicroPython's axTLS configuration doesn't validate certificates, which leaves connections open to man-in-the-middle attacks. For a learning project sending sensor data this is fine, but for anything more serious an ESP32 or similar would be a much better starting point.

**Memory Constraints and MicroPython**

Coming back to embedded development after a while away, the memory limitations of the ESP8266 took some readjusting to. The device has around 80KB total RAM of which 30-50kb is usable after MicroPython is loaded. If you're not careful with object lifetimes the heap fragments quickly and you start getting memory allocation errors mid-run.

The main tool for dealing with this is calling `gc.collect()` manually at key points in the loop - after closing a connection, after processing a payload, before opening a new one. MicroPython doesn't garbage collect as aggressively as you might expect, so being explicit about it makes a real difference to stability. 

## Links

- [GitHub - IoT / AWS Pipeline](https://github.com/lbirchenough/iotproject)
- [GitHub - Laravel / Livewire](https://github.com/lbirchenough/livewire_test)
