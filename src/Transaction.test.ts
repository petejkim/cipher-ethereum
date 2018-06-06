import { Transaction, TransactionParams } from './Transaction'

import { BigNumber } from 'bignumber.js'
import { denominations } from './denominations'

const privateKey = Buffer.from(
  '18aed7b31dea5e7d7e50c868b72efcb10e4e5b8060e9bb3cf30b6e2ca6b8471c',
  'hex'
)

const params: TransactionParams = {
  nonce: 27,
  gasPriceWei: new BigNumber(20).times(denominations.Gwei),
  gasLimit: new BigNumber(21000),
  toAddress: '0xC589aC793Af309DB9690D819aBC9AAb37D169F6a',
  valueWei: new BigNumber(1.5).times(denominations.ether),
  data: '0xdeadbeef0cafebabe0123456789'
}

const paramsWithChainId: TransactionParams = {
  ...params,
  chainId: 1
}

describe('initialization', () => {
  test('allows some param fields to be optional', () => {
    let tx: Transaction | null = null
    expect(() => {
      tx = new Transaction({
        nonce: 0,
        gasPriceWei: new BigNumber(20).times(denominations.Gwei),
        gasLimit: new BigNumber(21000),
        valueWei: new BigNumber(1.5).times(denominations.ether)
      })
    }).not.toThrow()
    expect(tx).not.toBe(null)
  })
})

describe('fields', () => {
  test('returns all fields of the transaction including v, r and s as a list of binary fields', () => {
    let tx = new Transaction(params)
    let hexFields = tx.fields.map(field => field.toString('hex'))

    // default v, r, and s
    expect(hexFields).toEqual([
      '1b', // 0: nonce
      '04a817c800', // 1: gas price
      '5208', // 2: gas limit
      'c589ac793af309db9690d819abc9aab37d169f6a', // 3: to
      '14d1120d7b160000', // 4: value
      '0deadbeef0cafebabe0123456789', // 5: data
      '1c', // 6: v = 28
      '', // 7: r = 0
      '' // 8: s = 0
    ])

    tx = new Transaction({
      ...params,
      toAddress: null,
      valueWei: new BigNumber(0)
    })
    hexFields = tx.fields.map(field => field.toString('hex'))
    expect(hexFields).toEqual([
      '1b', // 0: nonce
      '04a817c800', // 1: gas price
      '5208', // 2: gas limit
      '', // 3: to
      '', // 4: value
      '0deadbeef0cafebabe0123456789', // 5: data
      '1c', // 6: v = 28
      '', // 7: r = 0
      '' // 8: s = 0
    ])

    tx = new Transaction({
      ...params,
      v: 37,
      r: '0xfe353f9175fcf4bb3e7b7fca1c1e40f7062db642102ca70db7348e7a7e42a046',
      s: '0x2ba7b98c5782fb4d85ca57557306633ae31663145a1ac0355ac3d5e84d87036b'
    })
    hexFields = tx.fields.map(field => field.toString('hex'))

    expect(hexFields).toEqual([
      '1b', // 0: nonce
      '04a817c800', // 1: gas price
      '5208', // 2: gas limit
      'c589ac793af309db9690d819abc9aab37d169f6a', // 3: to
      '14d1120d7b160000', // 4: value
      '0deadbeef0cafebabe0123456789', // 5: data
      '25', // 6: v
      'fe353f9175fcf4bb3e7b7fca1c1e40f7062db642102ca70db7348e7a7e42a046', // 7: r
      '2ba7b98c5782fb4d85ca57557306633ae31663145a1ac0355ac3d5e84d87036b' // 8: s
    ])
  })
})

describe('fieldsForSigning', () => {
  test('returns the first 6 fields of the transaction as a list of binary fields', () => {
    const tx = new Transaction(params)
    const hexFields = tx.fieldsForSigning.map(field => field.toString('hex'))

    expect(hexFields).toEqual([
      '1b', // 0: nonce
      '04a817c800', // 1: gas price
      '5208', // 2: gas limit
      'c589ac793af309db9690d819abc9aab37d169f6a', // 3: to
      '14d1120d7b160000', // 4: value
      '0deadbeef0cafebabe0123456789' // 5: data
    ])
  })

  test('when chainId is set, return 3 additional fields (EIP155)', () => {
    const tx = new Transaction(paramsWithChainId)
    const hexFields = tx.fieldsForSigning.map(field => field.toString('hex'))

    expect(hexFields).toEqual([
      '1b', // 0: nonce
      '04a817c800', // 1: gas price
      '5208', // 2: gas limit
      'c589ac793af309db9690d819abc9aab37d169f6a', // 3: to
      '14d1120d7b160000', // 4: value
      '0deadbeef0cafebabe0123456789', // 5: data
      '01', // 6: v = chainId
      '', // 7: r = 0
      '' // s: s = 0
    ])
  })
})

describe('hash', () => {
  test('returns keccak256 hash of the RLP representation of the transaction', () => {
    // before signing, so v = 28, r = 0, and s = 0
    let tx = new Transaction(params)
    expect(tx.hash.toString('hex')).toBe(
      '618a78020be294cd84983996ef9378dc2c65ad6e340cbde030bc031eff3a729f'
    )

    // tx hash is the same because v, r, and s haven't been populated by signing
    tx = new Transaction(paramsWithChainId)
    expect(tx.hash.toString('hex')).toBe(
      '618a78020be294cd84983996ef9378dc2c65ad6e340cbde030bc031eff3a729f'
    )
  })
})

describe('hashForSigning', () => {
  test('returns keccak256 hash of the RLP representation of fieldsForSigning', () => {
    let tx = new Transaction(params)
    expect(tx.hashForSigning.toString('hex')).toBe(
      '97ce0c356b5cd44a63c9357633b022745471c9994de29e15b9d1d21b16a93df1'
    )

    tx = new Transaction(paramsWithChainId)
    expect(tx.hashForSigning.toString('hex')).toBe(
      'a84951a3ffc1212a5770e0ceb921553075265d4a7d7a00361e7fd289c23733e6'
    )
  })
})

describe('sign', () => {
  test('returns signed transaction in RLP format', () => {
    let tx = new Transaction(params)
    expect(tx.sign(privateKey).toString('hex')).toBe(
      'f87a1b8504a817c80082520894c589ac793af309db9690d819abc9aab37d169f6a8814d1120d7b1600008e0deadbeef0cafebabe01234567891ba03cd26b08b246f23f74fceb2c063021955e691cf7d45fba443a2e504a4700dba5a0337b1f8dbf21ef35adf6e2a867d9c7bc836d1b79c8ab40c670385a2d0abca88c'
    )
    // hash changes because v, r, and s have been populated by signing
    expect(tx.hash.toString('hex')).toBe(
      '60e9fc990234b033e8799c43fba36a296a8097f3a77b962d34f62c2b597882eb'
    )

    // when chain ID is set, sign with v = chainId, r = 0, and s = 0
    tx = new Transaction(paramsWithChainId)
    expect(tx.sign(privateKey).toString('hex')).toBe(
      'f87a1b8504a817c80082520894c589ac793af309db9690d819abc9aab37d169f6a8814d1120d7b1600008e0deadbeef0cafebabe012345678925a0fe353f9175fcf4bb3e7b7fca1c1e40f7062db642102ca70db7348e7a7e42a046a02ba7b98c5782fb4d85ca57557306633ae31663145a1ac0355ac3d5e84d87036b'
    )
    // hash changes because v, r, and s have been populated by signing
    expect(tx.hash.toString('hex')).toBe(
      'ae439162935e0e64bfb3f37aa06a0e895fdbd462cdcb00d9f83eb018bded5e97'
    )
  })
})
