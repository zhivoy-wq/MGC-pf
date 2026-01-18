# MGC PF

This repository shows its **provably fair random number generator** system. The purpose is to show how randomness can be generated in a way that **cannot be tampered with after the fact** so that users can verify that outcomes are fair.

---

## How It Works

1. **Server Seed**  
   - The bot generates a `serverSeed` (32 random bytes) and calculates its SHA256 hash.  
   - The **hash** is publicly shown to users before any games are played.  
   - The seed commits the bot without revealing it yet.

2. **Nonce**  
   - Each time the bot generates a random number (for a game round), it increments a **nonce**.  
   - The nonce ensures that every roll is unique and tied to a specific position in the sequence.

3. **Random Number Generation**  
   - To generate a random number, the system calculates:
     ```
     float = HMAC_SHA256(serverSeed, nonce) → number between 0 and 1
     ```
   - This float is then used by game logic (slots, dice, roulette and so on) to determine outcomes.

4. **Seed Reveal**  
   - When the server seed is revealed (after rotation or periodically), users can:
     - Hash it → confirm it matches the public hash in "/fair".
     - Recompute all past random numbers using the nonce sequence.
     - Verify that all outcomes were determined fairly and could not have been changed.

---

## Why is this fair? 

- **The bot cannot change outcomes** because the seed was committed via hash.  
- **The sequence of rolls is deterministic** meaning that anyone can verify the math once the seed is revealed.  
- **The outcomes are reproducible**.

---

## Usage 

See `demo.js` for an example of how a bot command can use this system.
See `pf.js` for the actual pf.js source code of the MVSD Grand Casino bot.
