import { Message } from './Message'

const privateKey = Buffer.from(
  '18aed7b31dea5e7d7e50c868b72efcb10e4e5b8060e9bb3cf30b6e2ca6b8471c',
  'hex'
) // publicKey: 03c2cf95f0cce3e633427a7c26037ad3b028a91d6d7da52799adcaea18c13b9d7d

const address = '0x3411cd4C838A3FEda31f0d24A958C801C4dB7d36'

describe('hash', () => {
  test('works', () => {
    let message = new Message(Buffer.from('hello world', 'utf8'))
    expect(message.hash.toString('hex')).toBe(
      'd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68'
    )
    message = new Message(Buffer.from('deadbeefcafebabe0123456789', 'hex'))
    expect(message.hash.toString('hex')).toBe(
      'aba82ee9ad6afdb9c75e1808cd351fc1e3a051079908d8106714e2a48c3e82a3'
    )
  })
})

describe('signMessage', () => {
  test('signs a message', () => {
    let message = new Message(Buffer.from('hello world', 'utf8'))
    expect(message.sign(privateKey).toString('hex')).toBe(
      '8bdf11df0aac429a57fcb7595d3f43ff1cd8063a3f93e76594273d728e7b2fc229e9b08ea19fdded04a2d8776a8901dd493437eeb35ea6239d4da0884bf1b2ef1c'
    )
    message = new Message(Buffer.from('deadbeefcafebabe0123456789', 'hex'))
    expect(message.sign(privateKey).toString('hex')).toBe(
      'c7660c7905ecb6202b30aaf6884bba78739f0c01b19365674ee6a80367e0cb8858c1931958132c24101c3e9d0d408fd26bb0cb03b2904712ba8d94c33eab36d91c'
    )
  })
})

describe('ecRecover', () => {
  test('returns the address associated with the private key used for signing', () => {
    let message = new Message(Buffer.from('hello world', 'utf8'))
    expect(
      message.ecRecover(
        Buffer.from(
          '8bdf11df0aac429a57fcb7595d3f43ff1cd8063a3f93e76594273d728e7b2fc229e9b08ea19fdded04a2d8776a8901dd493437eeb35ea6239d4da0884bf1b2ef1c',
          'hex'
        )
      )
    ).toBe(address)

    message = new Message(Buffer.from('deadbeefcafebabe0123456789', 'hex'))
    expect(
      message.ecRecover(
        Buffer.from(
          'c7660c7905ecb6202b30aaf6884bba78739f0c01b19365674ee6a80367e0cb8858c1931958132c24101c3e9d0d408fd26bb0cb03b2904712ba8d94c33eab36d91c',
          'hex'
        )
      )
    ).toBe(address)
  })
})
