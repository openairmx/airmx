import type { InstantPushData } from './types.js'
import { MessageSource } from './types.js'

export class CommandMessage<T> {
  constructor(
    readonly commandId: number,
    readonly commandName: string,
    readonly data: T,
    readonly time: number,
    readonly from: number
  ) {}

  payload() {
    return {
      cmdId: this.commandId,
      name: this.commandName,
      time: this.time,
      from: this.from,
      data: this.data,
    }
  }
}

const current = () => {
  return Math.floor(new Date().getTime() / 1000)
}

export class InstantPushMessage extends CommandMessage<InstantPushData> {
  static commandId() {
    return 40
  }

  /**
   * @param frequency - Report frequency in seconds.
   * @param duration - Report duration in seconds.
   */
  static make(frequency: number, duration: number) {
    const data = {
      frequencyTime: frequency,
      durationTime: duration
    }
    return new InstantPushMessage(
      this.commandId(), 'instantPush', data, current(), MessageSource.App_Android
    )
  }
}
