// Demo command to showcase how MVSD Grand Casino uses rng to decide outcome.
const { SlashCommandBuilder } = require('@discordjs/builders');
const { nextRandom } = require('./pf');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gamble')
    .setDescription('A simple pf gamble command'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const { float, nonce, seedHash } = await nextRandom();
    const result = float < 0.5 ? 'WIN' : 'LOSE';

    await interaction.editReply({
      content: `Roll: ${float.toFixed(4)}\nResult: **${result}**\nSeed hash: \`${seedHash}\`\nNonce: ${nonce}`
    });
  }
};
