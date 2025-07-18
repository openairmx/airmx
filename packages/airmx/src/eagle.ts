import type { Message, EagleStatusData, EagleControlData } from './types.js'

import { Airmx } from './airmx.js'
import { EagleMode, Switch } from './types.js'

export class EagleStatus {
  constructor(
    public readonly deviceId: number,
    public readonly message: Message<EagleStatusData>,
  ) {}

  static commandId() {
    return 210
  }

  static from(deviceId: number, message: Message<EagleStatusData>) {
    if (message.cmdId !== this.commandId()) {
      throw new Error(
        `Eagle status expects a message with command ID ${this.commandId()}.`,
      )
    }

    return new this(deviceId, message)
  }

  get power() {
    return this.message.data.power
  }

  isOn() {
    return this.power === Switch.On
  }

  isOff() {
    return !this.isOn()
  }

  get mode() {
    return this.message.data.mode
  }

  isSilentMode() {
    return this.mode === EagleMode.Silent
  }

  get status() {
    return this.message.data.status
  }

  get denoise() {
    return this.message.data.denoise
  }

  isDenoiseOn() {
    return this.denoise === Switch.On
  }

  isDenoiseOff() {
    return !this.isDenoiseOn()
  }

  get heatStatus() {
    return this.message.data.heatStatus
  }

  isHeaterOn() {
    return this.heatStatus === Switch.On
  }

  isHeaterOff() {
    return !this.isHeaterOn()
  }

  get cadr() {
    return this.message.data.cadr
  }

  get prm() {
    return this.message.data.prm
  }

  get temperature() {
    return this.message.data.t0
  }

  get g4Id() {
    return this.message.data.g4Id
  }

  get g4Percent() {
    return this.message.data.g4Percent
  }

  get carbonId() {
    return this.message.data.carbonId
  }

  get carbonPercent() {
    return this.message.data.carbonPercent
  }

  get hepaId() {
    return this.message.data.hepaId
  }

  get hepaPercent() {
    return this.message.data.hepaPercent
  }

  get version() {
    return this.message.data.version
  }

  toControlData(): EagleControlData {
    const { power, heatStatus, mode, cadr, denoise } = this.message.data
    return { power, heatStatus, mode, cadr, denoise }
  }
}

export class EagleController {
  constructor(
    private readonly airmx: Airmx,
    private readonly deviceId: number,
  ) {}

  on() {
    this.#send({ power: Switch.On })
  }

  off() {
    this.#send({ power: Switch.Off })
  }

  heatOn() {
    this.#send({ heatStatus: Switch.On })
  }

  heatOff() {
    this.#send({ heatStatus: Switch.Off })
  }

  denoiseOn() {
    this.#send({ denoise: Switch.On })
  }

  denoiseOff() {
    this.#send({ denoise: Switch.Off })
  }

  cadr(cadr: number) {
    this.#send({
      power: Switch.On,
      mode: EagleMode.Manual,
      cadr,
    })
  }

  /**
   * Automate the fan speed based on the data from the air monitor.
   */
  ai() {
    this.#send({
      power: Switch.On,
      mode: EagleMode.Ai,
    })
  }

  /**
   * Activate silent mode to minimize fan noise.
   */
  silent() {
    this.#send({
      power: Switch.On,
      mode: EagleMode.Silent,
    })
  }

  /**
   * Activate turbo mode for optimum air purification.
   */
  turbo() {
    this.#send({
      power: Switch.On,
      mode: EagleMode.Turbo,
      cadr: 100,
    })
  }

  status() {
    const status = this.airmx.getEagleStatus(this.deviceId)

    if (status === undefined) {
      throw new Error(
        `Could not retrieve the status of the device with ID ${this.deviceId}.`,
      )
    }

    return status
  }

  #send(data: Partial<EagleControlData>) {
    this.airmx.control(this.deviceId, {
      ...this.status().toControlData(),
      ...data,
    })
  }
}
