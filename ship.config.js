module.exports = {
  publishCommand: ({ defaultCommand, tag }) =>
    `${defaultCommand} --access public --tag ${tag}`,
  conventionalChangelogArgs: () => '-r 0 --config changelog-config.json',
};
