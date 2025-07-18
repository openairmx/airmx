import type { Message, EagleStatusData, EagleControlData } from './types.js'

import { Airmx } from './airmx.js'
import { EagleMode } from './types.js'

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
    return this.power === 1
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
    return this.denoise === 1
  }

  isDenoiseOff() {
    return !this.isDenoiseOn()
  }

  get heatStatus() {
    return this.message.data.heatStatus
  }

  isHeaterOn() {
    return this.heatStatus === 1
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
    this.#send({ power: 1 })
  }

  off() {
    this.#send({ power: 0 })
  }

  heatOn() {
    this.#send({ heatStatus: 1 })
  }

  heatOff() {
    this.#send({ heatStatus: 0 })
  }

  denoiseOn() {
    this.#send({ denoise: 1 })
  }

  denoiseOff() {
    this.#send({ denoise: 0 })
  }

  cadr(cadr: number) {
    this.#send({
      power: 1,
      mode: EagleMode.Manual,
      cadr,
    })
  }

  /**
   * Automate the fan speed based on the data from the air monitor.
   */
  ai() {
    this.#send({
      power: 1,
      mode: EagleMode.Ai,
    })
  }

  /**
   * Activate silent mode to minimize fan noise.
   */
  silent() {
    this.#send({
      power: 1,
      mode: EagleMode.Silent,
    })
  }

  /**
   * Activate turbo mode for optimum air purification.
   */
  turbo() {
    this.#send({
      power: 1,
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
