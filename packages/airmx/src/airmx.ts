import crypto from 'crypto'
import { MqttClient } from 'mqtt'
import { EagleStatus } from './eagle.js'
import { SnowStatus } from './snow.js'
import type { Config, SnowListener, EagleListener } from './types.js'
import { Command } from './types.js'

export class Topic {
  constructor(
    public readonly unknown1: boolean,
    public readonly unknown2: boolean,
    public readonly unknown3: boolean,
    public readonly unknown4: boolean,
    public readonly deviceId: number
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
        const ordinal = `${i + 1}${(i + 1) === 3 ? 'rd' : 'th'}`
        throw new Error(`The ${ordinal} part of the topic must be either "1" or "0".`)
      }
    }

    const deviceId = components[6]
    if (deviceId === '' || ! /^\d+$/.test(deviceId)) {
      throw new Error('The 7th part of the topic must be a device ID.')
    }

    return new this(
      components[2] === '1',
      components[3] === '1',
      components[4] === '1',
      components[5] === '1',
      +deviceId
    )
  }
}

export class Airmx {
  #listeners: {
    eagle: EagleListener[],
    snow: SnowListener[]
  } = {
    eagle: [],
    snow: []
  }

  #client: MqttClient

  constructor(
    private readonly config: Config
  ) {
    this.#client = this.config.mqtt
    this.#client.on('connect', this.#handleConnect.bind(this))
    this.#client.on('message', this.#handleMessage.bind(this))
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
  }

  #handleMessage(topic: string, message: Buffer): void {
    let t: Topic

    try {
      t = Topic.parse(topic)
    } catch (e) {
      return
    }

    const str = message.toString()
    const data = JSON.parse(str)
    this.#validateMessage(t.deviceId, str, data.sig)

    switch (data.cmdId) {
      case Command.SnowStatus:
        this.#notifySnow(SnowStatus.from(t.deviceId, data))
        break
      case Command.EagleStatus:
        this.#notifyEagle(EagleStatus.from(t.deviceId, data))
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
    const device = this.config.devices.find((device) => device.id === deviceId)
    if (device === undefined) {
      throw new Error(`Could not find the device with ID ${deviceId}.`)
    }
    const plainText = message.slice(1, message.lastIndexOf('"sig"'))
    const calculated = crypto.createHash('md5')
      .update(plainText)
      .update(device.key)
      .digest('hex')
    if (calculated !== sig) {
      throw new Error('Failed to validate the message.')
    }
  }
}
