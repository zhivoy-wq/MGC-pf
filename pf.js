const crypto = require('crypto');
const storage = require('./storage');

function makeId() {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

async function ensureServerSeed() {
  const pf = await storage.loadJson('pf.json', {});
  if (!pf.seed) {
    const seed = crypto.randomBytes(32).toString('hex');
    const seedHash = crypto.createHash('sha256').update(seed).digest('hex');
    pf.seed = seed;
    pf.seedHash = seedHash;
    pf.nonce = 0;
    await storage.saveJson('pf.json', pf);
    const reveals = await storage.loadJson('pf_reveals.json', {});
    reveals[seedHash] = { seed, revealed: false, createdAt: new Date().toISOString() };
    await storage.saveJson('pf_reveals.json', reveals);
  }
  return pf;
}

function floatFromHmac(seed, nonce) {
  const hmac = crypto.createHmac('sha256', seed).update(String(nonce)).digest('hex');
  // take first 13 hex chars -> 52 bits
  const sliced = hmac.slice(0, 13);
  const integer = parseInt(sliced, 16);
  const max = Math.pow(16, sliced.length);
  return integer / max; // in [0,1)
}

async function nextRandom() {
  const pf = await ensureServerSeed();
  const nonce = pf.nonce || 0;
  const f = floatFromHmac(pf.seed, nonce);
  pf.nonce = nonce + 1;
  await storage.saveJson('pf.json', pf);
  return { float: f, nonce, seedHash: pf.seedHash };
}

// floatfromhmac for tests
module.exports = { ensureServerSeed, nextRandom, revealSeed, getRevealEntry, floatFromHmac };

async function revealSeed(seedHash) {
  const reveals = await storage.loadJson('pf_reveals.json', {});
  const entry = reveals[seedHash];
  if (!entry) return null;
  // mark revealed
  entry.revealed = true;
  entry.revealedAt = new Date().toISOString();
  await storage.saveJson('pf_reveals.json', reveals);
  return entry.seed;
}

async function getRevealEntry(seedHash) {
  const reveals = await storage.loadJson('pf_reveals.json', {});
  return reveals[seedHash] || null;
}

module.exports = { ensureServerSeed, nextRandom, revealSeed, getRevealEntry };
