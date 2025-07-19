# Control AIRMX Pro with JavaScript

The package utilizes the MQTT protocol to communicate with your AIRMX devices.
Once connected to the server, it constantly monitors the status updates from
your machines. Additionally, it provides a set of useful APIs to facilitate
smooth control of your devices.

## Installation

The package can be installed via NPM:

```bash
npm i airmx
```

## Usage

First of all, we need to initialize an AIRMX client before we can monitor or
control our machines:

```typescript
import mqtt from 'mqtt'

const airmx = new Airmx({
  mqtt: mqtt.connect('mqtt://<YOUR-MQTT-SERVER>'),
  devices: [
    { id: <YOUR-DEVICE-ID>, key: '<YOUR-DEVICE-KEY>' }
  ]
})
```

You can register a handler when an AIRMX Pro sends us its latest status.

```typescript
airmx.onEagleUpdate((status: EagleStatus) => {
  console.log(`🎈 AIRMX: ${status.deviceId}  ${status.power ? 'on' : 'off'}`)
})
```

Sending commands directly to your machines is simple with the control API.
Just provide the device ID and control data.

```typescript
airmx.control(1, {
  power: 1,      // 1 indicates on
  mode: 0,       // 0 indicates manual control
  cadr: 47,      // CADR accepts a number range from 0 - 100
  denoise: 0,    // 0 indicates off
  heatStatus: 0  // 0 indicates off
})
```

Dealing with the control API's fixed data structure can be tedious. That's
why we built a semantic and fluent API for easier device control. Its method
names are so intuitive, you'll instantly grasp their function.

```typescript
// Turn on the machine
airmx.device(1).on()

// Turn off the machine
airmx.device(1).off()

// Turn on heat mode
airmx.device(1).heatOn()

// Turn off heat mode
airmx.device(1).heatOff()

// Turn on noise cancelling mode
airmx.device(1).denoiseOn()

// Turn off noise cancelling mode
airmx.device(1).denoiseOff()

// Adjust the CADR value (fan speed)
airmx.device(1).cadr(47)
```

The library replicates the built-in modes available in the official mobile
applications:

- **AI Mode:** Automatically adjusts CADR (Clean Air Delivery Rate) based
    on data from a paired air monitor.
- **Silent Mode:** Reduces fan speed to minimize noise output.
- **Turbo Mode:** Maximizes the device's purification capability, operating
    at 100% fan speed for rapid air cleaning.

```typescript
airmx.device(1).ai()
airmx.device(1).slient()
airmx.device(1).turbo()
```

Whenever a device sends an update or you request its current state, you'll
get an EagleStatus object with all the latest information.

```typescript
airmx.device(1).status()
```

## AIRMX Pro Status Reference

```typescript
// Determine the device's power status
//
// Data type: boolean

status.isOn()
status.isOff()

// Determine if the machine is set to silent mode
//
// Data type: boolean

status.isSilentMode()

// Determine if noise cancelling is enabled
//
// Data type: boolean

status.isDenoiseOn()
status.isDenoiseOff()

// Determine if AUX heat is enabled
//
// Data type: boolean

status.isHeaterOn()
status.isHeaterOff()

// The current Clean Air Delivery Rate
//
// Data type: number (0 - 100)

status.cadr

// The filter identifications
//
// Data type: string

status.g4Id
status.carbonId
status.hepaId

// The usage percentage for the filters
//
// Data type: number
// Value range: 0 - 100
//
// 0 indicates the filter is brand new
// 100 indicates the filter is run out, and should be replaced

status.g4Percent
status.carbonPercent
status.hepaPercent
```

## License

This package is released under [the MIT license](LICENSE).
