import crypto from 'crypto'
import { MqttClient } from 'mqtt'

import type {
  Config,
  SnowListener,
  EagleListener,
  EagleControlData,
} from './types.js'
import type { CommandMessage } from './messages.js'

import { EagleControlMesasge, InstantPushMessage } from './messages.js'
import { EagleController, EagleStatus } from './eagle.js'
import { Signer } from './util.js'
import { SnowStatus } from './snow.js'

export class Topic {
  constructor(
    public readonly unknown1: boolean,
    public readonly unknown2: boolean,
    public readonly unknown3: boolean,
    public readonly unknown4: boolean,
    public readonly deviceId: number,
  ) {
    //
  }

  static parse(topic: string) {
    const components = topic.split('/')

    if (components.length !== 7) {
      throw new Error('The topic format is expected to be airmx/+/+/+/+/+/+.')
    }

    if (components[0] !== 'airmx') {
      throw new Error('The 1st part of the topic must be "airmx".')
    }

    if (components[1] !== '01') {
      throw new Error('The 2nd part of the topic must be "01".')
    }

    for (let i = 2; i < 6; i++) {
      if (components[i] !== '0' && components[i] !== '1') {
        const ordinal = `${i + 1}${i + 1 === 3 ? 'rd' : 'th'}`
        throw new Error(
          `The ${ordinal} part of the topic must be either "1" or "0".`,
        )
      }
    }

    const deviceId = components[6]
    if (deviceId === '' || !/^\d+$/.test(deviceId)) {
      throw new Error('The 7th part of the topic must be a device ID.')
    }

    return new this(
      components[2] === '1',
      components[3] === '1',
      components[4] === '1',
      components[5] === '1',
      +deviceId,
    )
  }
}

interface AirmxListeners {
  eagle: EagleListener[]
  snow: SnowListener[]
}

export class Airmx {
  #listeners: AirmxListeners = {
    eagle: [],
    snow: [],
  }

  #client: MqttClient

  #signer

  /** Pairs of device ID and its latest running status. */
  #eagles

  constructor(private readonly config: Config) {
    this.#client = this.config.mqtt
    this.#client.on('connect', this.#handleConnect.bind(this))
    this.#client.on('message', this.#handleMessage.bind(this))
    this.#signer = new Signer()
    this.#eagles = new Map<number, EagleStatus>()
  }

  onSnowUpdate(callback: SnowListener) {
    this.#listeners.snow.push(callback)
    return this
  }

  onEagleUpdate(callback: EagleListener) {
    this.#listeners.eagle.push(callback)
    return this
  }

  #handleConnect() {
    this.#client.subscribe('airmx/01/+/+/1/1/+')

    // After successfully connecting to the MQTT server, we need to retrieve
    // the latest statuses for all devices instead of waiting for them to
    // notify us. It also enables us to make partial tweaks to devices.
    this.#dispatchAll(InstantPushMessage.make(2, 1))
  }

  #handleMessage(topic: string, message: Buffer): void {
    const { deviceId } = Topic.parse(topic)

    const str = message.toString()
    const data = JSON.parse(str)
    this.#validateMessage(deviceId, str, data.sig)

    switch (data.cmdId) {
      case SnowStatus.commandId():
        this.#notifySnow(SnowStatus.from(deviceId, data))
        break
      case EagleStatus.commandId():
        const status = EagleStatus.from(deviceId, data)
        this.#eagles.set(deviceId, status)
        this.#notifyEagle(status)
        break
    }
  }

  #notifySnow(status: SnowStatus) {
    this.#listeners.snow.forEach((listener) => listener(status))
  }

  #notifyEagle(status: EagleStatus) {
    this.#listeners.eagle.forEach((listener) => listener(status))
  }

  #validateMessage(deviceId: number, message: string, sig: string) {
    const device = this.#getDevice(deviceId)
    const plainText = message.slice(1, message.lastIndexOf('"sig"'))
    const calculated = crypto
      .createHash('md5')
      .update(plainText)
      .update(device.key)
      .digest('hex')
    if (calculated !== sig) {
      throw new Error('Failed to validate the message.')
    }
  }

  control(deviceId: number, data: EagleControlData) {
    this.#dispatch(deviceId, EagleControlMesasge.make(data))
  }

  #dispatch(deviceId: number, message: CommandMessage<unknown>) {
    const device = this.#getDevice(deviceId)
    const sig = this.#signer.sign(message, device.key)
    const payload = { ...message.payload(), sig }
    this.#client.publish(
      `airmx/01/1/1/0/1/${deviceId}`,
      JSON.stringify(payload),
    )
  }

  #dispatchAll(message: CommandMessage<unknown>) {
    for (const device of this.config.devices) {
      this.#dispatch(device.id, message)
    }
  }

  #getDevice(deviceId: number) {
    const device = this.config.devices.find((device) => device.id === deviceId)
    if (device === undefined) {
      throw new Error(`Could not find the device with ID ${deviceId}.`)
    }
    return device
  }

  getEagleStatus(deviceId: number) {
    return this.#eagles.get(deviceId)
  }

  /**
   * Specify an AIRMX Pro device.
   *
   * @param deviceId - The device ID.
   * @returns The device controller.
   */
  device(deviceId: number) {
    return new EagleController(this, deviceId)
  }
}
