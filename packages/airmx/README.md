# Control AIRMX Pro 1S with Javascript

This package uses the MQTT protocol to communicate with your AIRMX machine.
However, some prerequisites must be met for this communication to work.
Because the AIRMX machine doesn't have built-in support for extending
connections, we need to intercept network packets to obtain the machine ID
and access token. Furthermore, network firewall rules are required to redirect
packets from the AIRMX machine to our computing platform.

## Installation

The package can be installed via NPM:

```bash
npm i @lizhineng/airmx
```

## Usage

### Setup

First of all, we need to initialize an AIRMX client before we can
communicate with our machine:

```typescript
const airmx = new Airmx({
    mqtt: {
        // MQTT server configuration
    },
    machines: [
        {
            machineId: 1234, // Your machine ID
            token: '<YOUR-ACCESS-TOKEN>', // The access token
        }
    ]
})
```

If you only need to monitor your machines and don't intend to control them,
you can skip the entire "machines" setting.

### Control

The package exposes a list of APIs to control the machine effortlessly.

Turn the machine on:

```typescript
airmx.on()
```

Turn the machine off:

```typescript
airmx.off()
```

Control the fan speed:

```typescript
airmx.setFanByCidr(cidr: number)
airmx.setFanByPercentage(percentage: number)
airmx.setAutoFan()
```

Control the AUX heat:

```typescript
airmx.setAuxHeat(heat: boolean)
```

Control the denose function:

```typescript
airmx.setDenoise(denose: boolean)
```

### Monitor

Get the running status of the machine through the status properties:

```typescript
// Determine if the machine power is on
//
// Data type: boolean

airmx.status.on

// Determine if the machine power is off
//
// Data type: boolean

airmx.status.off

// Determine if the machine power is on
//
// Data type: boolean
//
// true: The machine is on
// false: The machine is off

airmx.status.power

// The value of Clean Air Delivery Rate (CADR)
//
// Data type: number

airmx.status.cidr

// The percentage value of the fan speed
//
// Data type: number

airmx.status.fan_percentage 

// Determine if the fan speed is automatically controlled by the machine
//
// Data type: boolean

airmx.status.auto_fan

// Determine whether the AUX heat function is turned on
//
// Data type: boolean

airmx.status.aux_heat

// The percentage to replace the G4 filter
//
// Data type: number
// Value range: 0 - 100
//
// 0 indicates the filter is brand new
// 100 indicates the filter is run out, and should be replaced

airmx.status.filters.g4

// The percentage to replace the carbon filter
//
// Data type: number
// Value range: 0 - 100
//
// 0 indicates the filter is brand new
// 100 indicates the filter is run out, and should be replaced

airmx.status.filters.carbon

// The percentage to replace the HEPA filter
//
// Data type: number
// Value range: 0 - 100
//
// 0 indicates the filter is brand new
// 100 indicates the filter is run out, and should be replaced

airmx.status.filters.hepa
```

## License

This package is released under the MIT License.
