import { MqttClient } from 'mqtt/*'
import { Airmx, Topic, TOPIC_STATUS } from './airmx'

describe('topic', () => {
  test('parse parses topic from string', () => {
    const topic = Topic.parse('airmx/01/0/1/1/1/12345')
    expect(topic.deviceId).toBe(12345)
    expect(topic.unknown1).toBe(false)
    expect(topic.unknown2).toBe(true)
    expect(topic.unknown3).toBe(true)
    expect(topic.unknown4).toBe(true)
  })

  test('the topic format is expected to have 7 parts', () => {
    expect(() => Topic.parse('foo'))
      .toThrow('The topic format is expected to be airmx/+/+/+/+/+/+.')
  })

  test('the 1st part is expected to be airmx', () => {
    expect(() => Topic.parse('foo/01/0/1/1/1/12345'))
      .toThrow('The 1st part of the topic must be "airmx".')
  })

  test('the 2nd part is expected to be "01"', () => {
    expect(() => Topic.parse('airmx/00/0/1/1/1/12345'))
      .toThrow('The 2nd part of the topic must be "01".')
  })

  test('the 3rd part is expected to be either "1" or "0"', () => {
    expect(Topic.parse('airmx/01/0/1/1/1/12345')).toBeInstanceOf(Topic)
    expect(Topic.parse('airmx/01/1/1/1/1/12345')).toBeInstanceOf(Topic)

    expect(() => Topic.parse('airmx/01/2/1/1/1/12345'))
      .toThrow('The 3rd part of the topic must be either "1" or "0".')
  })

  test('the 4th part is expected to be either "1" or "0"', () => {
    expect(Topic.parse('airmx/01/0/0/1/1/12345')).toBeInstanceOf(Topic)
    expect(Topic.parse('airmx/01/0/1/1/1/12345')).toBeInstanceOf(Topic)

    expect(() => Topic.parse('airmx/01/0/2/1/1/12345'))
      .toThrow('The 4th part of the topic must be either "1" or "0".')
  })

  test('the 5th part is expected to be either "1" or "0"', () => {
    expect(Topic.parse('airmx/01/0/1/0/1/12345')).toBeInstanceOf(Topic)
    expect(Topic.parse('airmx/01/0/1/1/1/12345')).toBeInstanceOf(Topic)

    expect(() => Topic.parse('airmx/01/0/1/2/1/12345'))
      .toThrow('The 5th part of the topic must be either "1" or "0".')
  })

  test('the 6th part is expected to be either "1" or "0"', () => {
    expect(Topic.parse('airmx/01/0/1/1/0/12345')).toBeInstanceOf(Topic)
    expect(Topic.parse('airmx/01/0/1/1/1/12345')).toBeInstanceOf(Topic)

    expect(() => Topic.parse('airmx/01/0/1/1/2/12345'))
      .toThrow('The 6th part of the topic must be either "1" or "0".')
  })

  test('the 7th part is expected to be the device id', () => {
    expect(() => Topic.parse('airmx/01/0/1/1/1/'))
      .toThrow('The 7th part of the topic must be a device ID.')

    expect(() => Topic.parse('airmx/01/0/1/1/1/foo'))
      .toThrow('The 7th part of the topic must be a device ID.')
  })
})

describe('airmx', () => {
  let mockMqttClient: jest.Mocked<MqttClient>

  beforeEach(() => {
    mockMqttClient = {
      on: jest.fn(),
      subscribe: jest.fn()
    } as unknown as jest.Mocked<MqttClient>
  })

  it('should subscribe to the topic when the client connects', () => {
    new Airmx({ mqtt: mockMqttClient })
    const connectHandler = mockMqttClient.on.mock.calls.find(
      ([event]) => event === 'connect'
    )?.[1] as (() => void) | undefined;
    connectHandler?.()
    expect(mockMqttClient.subscribe).toHaveBeenCalledWith(TOPIC_STATUS);
  })
})
