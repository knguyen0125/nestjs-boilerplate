import bcrypt from 'bcrypt';

const hashers = [
  {
    id: 'bcrypt',
    hash: async (plaintext: string) => {
      return await bcrypt.hash(plaintext, 10);
    },
    compare: async (plaintext: string, hash: string) => {
      return await bcrypt.compare(plaintext, hash);
    },
  },
  {
    id: 'dummy',
    hash: async (plaintext: string) => {
      return plaintext;
    },
    compare: async (plaintext: string, hash: string) => {
      return plaintext === hash;
    },
  },
];

export async function hash(plaintext: string) {
  const primaryHasher = hashers[0];
  return `{${primaryHasher.id}}` + (await primaryHasher.hash(plaintext));
}

export async function compare(plaintext: string, hash: string) {
  const passwordHasher = hashers.find((h) => hash.startsWith(`{${h.id}}`));
  if (!passwordHasher) {
    throw new Error('Unknown hasher');
  }

  // Remove the prefix
  const realHash = hash.slice(`{${passwordHasher.id}}`.length);

  // Always calculate the newest hash, in case the primary hasher has changed to prevent timing attacks
  const newHash = await hashers[0].hash(plaintext);

  const isVerified = await passwordHasher.compare(plaintext, realHash);

  return {
    verified: isVerified,
    needsRehash: passwordHasher.id !== hashers[0].id,
    newHash,
  };
}
