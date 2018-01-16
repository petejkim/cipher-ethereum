declare module 'elliptic' {
  import BN from 'bn.js'
  import { Buffer } from 'buffer'

  export class Point {
    x: BN
    y: BN
    mul (k: BN): Point
    add (p: Point): Point
    isInfinity (): boolean
    encode (encoding: 'hex', compact: boolean): string
    encode (encoding: null, compact: boolean): number[]
    encode (): number[]
  }

  export class Signature {
    r: BN
    s: BN
    recoveryParam: number | null
  }

  export class KeyPair {
    priv: Point
    pub: Point
    getPublic (): Point
    getPublic (encoding: 'hex'): string
    getPublic (compact: boolean, encoding: 'hex'): string
    sign (
      msg: string,
      encoding: 'hex',
      options?: { canonical: boolean }
    ): Signature
    sign (msg: Buffer, options?: { canonical: boolean }): Signature
  }

  export class EC {
    n: BN
    g: Point
    constructor (curve: string)
    keyFromPrivate (priv: string, encoding: 'hex'): KeyPair
    keyFromPrivate (priv: Buffer): KeyPair
    keyFromPublic (pub: string, encoding: 'hex'): KeyPair
    keyFromPublic (pub: Buffer | BN): KeyPair
    recoverPubKey (
      msg: Buffer,
      signature: { r: Buffer; s: Buffer },
      recoveryParam: number
    ): Point
  }

  export { EC as ec }
}
