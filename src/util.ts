import crypto from 'crypto'
import type { CommandMessage } from './messages.js'

export class Signer {
  /**
   * Calculate the signature for the message.
   *
   * @param message - The command message.
   * @param key - The device key.
   * @returns An 8-byte signature for the given message.
   */
  sign(message: CommandMessage<unknown>, key: string) {
    const plainText = JSON.stringify(message.payload())
    return this.#hash(plainText.slice(1, -1), key)
  }

  /**
   * Calculate the signature for the plain text.
   *
   * @param message - The plain text.
   * @param key - The device key.
   * @returns An 8-byte signature for the given text.
   */
  signText(message: string, key: string) {
    return this.#hash(message, key)
  }

  /**
   * Hash the data with the MD5 algorithm.
   *
   * @param data - The plain text.
   * @param key - The device key.
   * @returns An 8-byte signature for the given data.
   */
  #hash(data: string, key: string) {
    return crypto
      .createHash('md5')
      .update(data)
      .update(',')
      .update(key)
      .digest('hex')
  }
}
