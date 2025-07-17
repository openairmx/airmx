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
