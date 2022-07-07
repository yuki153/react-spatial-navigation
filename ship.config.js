module.exports = {
  publishCommand: ({ defaultCommand, tag }) =>
    `${defaultCommand} --access public --tag ${tag}`,
  conventionalChangelogArgs: '-p conventionalcommits -i CHANGELOG.md -s',
};
