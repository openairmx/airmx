import crypto from 'crypto'
import type { CommandMessage } from './messages.js'

export class Signer {
  sign(message: CommandMessage<unknown>, key: string) {
    const plainText = JSON.stringify(message.payload())
    return crypto
      .createHash('md5')
      .update(plainText.slice(1, -1))
      .update(',')
      .update(key)
      .digest('hex')
  }
}
