import type { Message, EagleStatusData } from './types.js'

import { EagleStatus } from './eagle.js'
import { EagleMode } from './types.js'

test('from parses message to eagle status', () => {
  const status = EagleStatus.from(12345, createStubStatusData())
  expect(status).toBeInstanceOf(EagleStatus)
})

test('data resolution', () => {
  const status = new EagleStatus(12345, createStubStatusData())
  expect(status.deviceId).toBe(12345)
  expect(status.power).toBe(1)
  expect(status.mode).toBe(2)
  expect(status.cadr).toBe(17)
  expect(status.denoise).toBe(0)
  expect(status.heatStatus).toBe(0)
  expect(status.status).toBe(0)
  expect(status.prm).toBe(660)
  expect(status.temperature).toBe(28)
  expect(status.g4Id).toBe('0111111')
  expect(status.g4Percent).toBe(20)
  expect(status.carbonId).toBe('0222222')
  expect(status.carbonPercent).toBe(30)
  expect(status.hepaId).toBe('0333333')
  expect(status.hepaPercent).toBe(40)
  expect(status.version).toBe('10.00.17')
})

test('isOn determines if the power is on', () => {
  const status = new EagleStatus(12345, createStubStatusData({ power: 1 }))
  expect(status.isOn()).toBe(true)
  expect(status.isOff()).toBe(false)
})

test('isOff determines if the power is off', () => {
  const status = new EagleStatus(12345, createStubStatusData({ power: 0 }))
  expect(status.isOff()).toBe(true)
  expect(status.isOn()).toBe(false)
})

test('mode 2 is the silent mode', () => {
  const status = new EagleStatus(
    12345,
    createStubStatusData({ mode: EagleMode.Silent }),
  )
  expect(status.isSilentMode()).toBe(true)
})

test('isDenoiseOn determines if the denoise feature is on', () => {
  const status = new EagleStatus(12345, createStubStatusData({ denoise: 1 }))
  expect(status.isDenoiseOn()).toBe(true)
  expect(status.isDenoiseOff()).toBe(false)
})

test('isDenoiseOff determines if the denoise feature is off', () => {
  const status = new EagleStatus(12345, createStubStatusData({ denoise: 0 }))
  expect(status.isDenoiseOff()).toBe(true)
  expect(status.isDenoiseOn()).toBe(false)
})

test('isHeaterOn determines if the heater is on', () => {
  const status = new EagleStatus(12345, createStubStatusData({ heatStatus: 1 }))
  expect(status.isHeaterOn()).toBe(true)
  expect(status.isHeaterOff()).toBe(false)
})

test('isHeaterOff determines if the heater is off', () => {
  const status = new EagleStatus(12345, createStubStatusData({ heatStatus: 0 }))
  expect(status.isHeaterOff()).toBe(true)
  expect(status.isHeaterOn()).toBe(false)
})

const createStubStatusData = (
  data: Partial<EagleStatusData> = {},
): Message<EagleStatusData> => ({
  cmdId: 210,
  data: {
    cadr: 17,
    carbonId: '0222222',
    carbonPercent: 30,
    denoise: 0,
    diffPressure1: 99999,
    diffPressure2: 99999,
    g4Id: '0111111',
    g4Percent: 20,
    heatStatus: 0,
    hepaId: '0333333',
    hepaPercent: 40,
    mode: 2,
    power: 1,
    prm: 660,
    status: 0,
    t0: 28,
    version: '10.00.17',
    ...data,
  },
  from: 2,
  name: 'eagleStatus',
  sig: 'foo',
  time: 1700000000,
})
