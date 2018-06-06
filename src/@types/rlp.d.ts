declare module 'rlp' {
  type Item = Buffer | string | number

  export function encode (input: Item | Item[]): Buffer
}
