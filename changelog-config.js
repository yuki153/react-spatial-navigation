'use strict'
const config = require('conventional-changelog-conventionalcommits')

/**
 * @see https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-conventionalcommits/README.md
 */
module.exports = config({
    types: [
        { type: 'feat', section: 'Features' },
        { type: 'feature', section: 'Features' },
        { type: 'fix', section: 'Bug Fixes' },
        { type: 'perf', section: 'Performance Improvements' },
        { type: 'revert', section: 'Reverts' },
        { type: 'docs', section: 'Documentation', hidden: false },
        { type: 'refactor', section: 'Code Refactoring', hidden: false },
        { type: 'style', section: 'Styles', hidden: true },
        { type: 'chore', section: 'Miscellaneous Chores', hidden: true },
        { type: 'test', section: 'Tests', hidden: true },
        { type: 'build', section: 'Build System', hidden: true },
        { type: 'ci', section: 'Continuous Integration', hidden: true }
    ]
})