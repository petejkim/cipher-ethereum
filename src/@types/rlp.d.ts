declare module 'rlp' {
  type Item = Buffer | string | number

  declare function encode (input: Item | Item[]): Buffer

  exports.encode = encode
}
