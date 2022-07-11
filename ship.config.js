module.exports = {
  publishCommand: ({ defaultCommand, tag }) =>
    `${defaultCommand} --access public --tag ${tag}`,
  conventionalChangelogArgs: '-i CHANGELOG.md -s -n changelog-config.js',
};
