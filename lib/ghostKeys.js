// Key derivation for ghost wallets. Standard BIP39 phrase + the same derivation paths
// Trust Wallet, Ledger and most multi-coin wallets use, so the phrase imports anywhere.
import { HDNodeWallet, Mnemonic, randomBytes, sha256, ripemd160, keccak256, getBytes, hexlify, concat, SigningKey } from 'ethers';

export const PATHS = {
  evm: "m/44'/60'/0'/0/0",
  btc: "m/84'/0'/0'/0/0", // Native SegWit (bc1q…)
  ltc: "m/84'/2'/0'/0/0", // Native SegWit (ltc1q…)
  doge: "m/44'/3'/0'/0/0", // Legacy (D…)
  xrp: "m/44'/144'/0'/0/0",
  tron: "m/44'/195'/0'/0/0",
};

const BTC_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const XRP_ALPHABET = 'rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz';

function base58(bytes, alphabet = BTC_ALPHABET) {
  let n = BigInt(hexlify(bytes) === '0x' ? 0 : hexlify(bytes));
  let out = '';
  while (n > 0n) {
    out = alphabet[Number(n % 58n)] + out;
    n /= 58n;
  }
  for (const b of bytes) {
    if (b !== 0) break;
    out = alphabet[0] + out;
  }
  return out;
}

function base58check(payload, alphabet) {
  const check = getBytes(sha256(sha256(payload))).slice(0, 4);
  return base58(getBytes(concat([payload, check])), alphabet);
}

const hash160 = (pub) => getBytes(ripemd160(sha256(pub)));

// BIP173 bech32 (segwit v0)
const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
function polymod(values) {
  const G = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) if ((top >> i) & 1) chk ^= G[i];
  }
  return chk;
}
function convertBits(data, from, to) {
  let acc = 0, bits = 0;
  const out = [];
  for (const v of data) {
    acc = (acc << from) | v;
    bits += from;
    while (bits >= to) {
      bits -= to;
      out.push((acc >> bits) & ((1 << to) - 1));
    }
  }
  if (bits > 0) out.push((acc << (to - bits)) & ((1 << to) - 1));
  return out;
}
function segwitV0(hrp, program) {
  const data = [0, ...convertBits(program, 8, 5)];
  const expand = [...[...hrp].map((c) => c.charCodeAt(0) >> 5), 0, ...[...hrp].map((c) => c.charCodeAt(0) & 31)];
  const mod = polymod([...expand, ...data, 0, 0, 0, 0, 0, 0]) ^ 1;
  const checksum = [0, 1, 2, 3, 4, 5].map((i) => (mod >> (5 * (5 - i))) & 31);
  return hrp + '1' + [...data, ...checksum].map((d) => CHARSET[d]).join('');
}

function wif(privHex, version) {
  return base58check(concat([new Uint8Array([version]), privHex, new Uint8Array([1])]));
}

export function newPhrase() {
  return Mnemonic.fromEntropy(randomBytes(16)).phrase; // 12 words
}

// Returns { address, privateKey (in the format that chain's wallets import) }
export function deriveFromPhrase(kind, phrase) {
  const node = HDNodeWallet.fromPhrase(phrase, undefined, PATHS[kind]);
  const pub = getBytes(node.publicKey); // compressed, 33 bytes
  switch (kind) {
    case 'evm':
      return { address: node.address, privateKey: node.privateKey };
    case 'btc':
      return { address: segwitV0('bc', hash160(pub)), privateKey: wif(node.privateKey, 0x80) };
    case 'ltc':
      return { address: segwitV0('ltc', hash160(pub)), privateKey: wif(node.privateKey, 0xb0) };
    case 'doge':
      return { address: base58check(concat([new Uint8Array([0x1e]), hash160(pub)])), privateKey: wif(node.privateKey, 0x9e) };
    case 'xrp':
      return { address: base58check(concat([new Uint8Array([0x00]), hash160(pub)]), XRP_ALPHABET), privateKey: node.privateKey.slice(2).toUpperCase() };
    case 'tron': {
      const uncompressed = getBytes(SigningKey.computePublicKey(node.publicKey, false)).slice(1);
      const body = getBytes(keccak256(uncompressed)).slice(-20);
      return { address: base58check(concat([new Uint8Array([0x41]), body])), privateKey: node.privateKey.slice(2) };
    }
    default:
      throw new Error('Unsupported wallet type');
  }
}
