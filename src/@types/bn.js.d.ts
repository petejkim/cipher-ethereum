declare module 'bn.js' {
  import { Buffer } from 'buffer'

  type Endian = 'le' | 'be'

  type ArrayLike = {
    new (size: number): ArrayLike
  }

  export default class BN {
    constructor (
      value: string | number | Buffer | BN,
      base?: number,
      endian?: Endian
    )
    toArrayLike<T> (
      ArrayLike: { new (size: number): T },
      endian?: Endian,
      length?: number
    ): T
    toArray (endian?: Endian, length?: number): number[]
    add (b: BN): BN
    mod (b: BN): BN
    cmp (b: BN): number
    toNumber (): number
    toString (base?: number, length?: number): string
    isZero (): boolean
    bitLength (): number
    toTwos (width: number): BN

    static isBN (num: any): boolean
  }
}
