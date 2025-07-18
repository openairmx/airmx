import type { Message, EagleStatusData } from './types.js'
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
}
