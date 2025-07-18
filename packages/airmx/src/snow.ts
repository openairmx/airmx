import type { Message, SnowStatusData } from './types.js'
import { BatteryState, SensorState } from './types.js'

export class SnowStatus {
  constructor(
    public readonly deviceId: number,
    public readonly message: Message<SnowStatusData>,
  ) {
    //
  }

  static commandId() {
    return 200
  }

  static from(deviceId: number, message: Message<SnowStatusData>) {
    if (message.cmdId !== this.commandId()) {
      throw new Error(
        `Snow status expects a message with command ID "${this.commandId()}".`,
      )
    }

    return new this(deviceId, message)
  }

  get battery() {
    return this.message.data.battery
  }

  get batteryState() {
    return this.message.data.battery_state
  }

  isCharging() {
    return this.message.data.battery_state === BatteryState.Charging
  }

  isDischarge() {
    return this.message.data.battery_state === BatteryState.Discharge
  }

  get temperature() {
    return this.message.data.t / 100
  }

  get temperatureState() {
    return this.message.data.temp_state
  }

  get isTemperatureSampling() {
    return this.message.data.temp_state === SensorState.Sampling
  }

  get temperatureUnit() {
    return this.message.data.temp_unit
  }

  get outdoorTemperature() {
    return this.message.data.ot / 100
  }

  get humidity() {
    return this.message.data.h / 100
  }

  get humidityState() {
    return this.message.data.humi_state
  }

  get isHumiditySampling() {
    return this.message.data.humi_state === SensorState.Sampling
  }

  get outdoorHumidity() {
    return this.message.data.oh / 100
  }

  /**
   * The PM2.5 measurement.
   */
  get pm25() {
    return this.message.data.pm25
  }

  /**
   * The PM10 measurement.
   */
  get pm100() {
    return this.message.data.pm100
  }

  /**
   * The outdoor PM2.5 measurement.
   */
  get outdoorPm25() {
    return this.message.data.opm25
  }

  /**
   * The outdoor PM10 measurement.
   */
  get outdoorPm100() {
    return this.message.data.opm100
  }

  get pmState() {
    return this.message.data.pm_state
  }

  isPmSampling() {
    return this.message.data.pm_state === SensorState.Sampling
  }

  get pmTime() {
    return this.message.data.pm_time
  }

  get co2() {
    return this.message.data.co2
  }

  get co2State() {
    return this.message.data.co2_state
  }

  isCo2Sampling() {
    return this.message.data.co2_state === SensorState.Sampling
  }

  get co2Time() {
    return this.message.data.co2_time
  }

  get tvoc() {
    return this.message.data.tvoc
  }

  get tvocDuration() {
    return this.message.data.tvoc_duration
  }

  get tvocState() {
    return this.message.data.tvoc_state
  }

  isTvocSampling() {
    return this.message.data.tvoc_state === SensorState.Sampling
  }

  get tvocTime() {
    return this.message.data.tvoc_time
  }

  get tvocUnit() {
    return this.message.data.tvoc_unit
  }

  get time() {
    return this.message.data.time
  }

  get version() {
    return this.message.data.version
  }

  get versionType() {
    return this.message.data.version_type
  }
}
