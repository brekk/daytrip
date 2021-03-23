module.exports = {
  scripts: {
    build: `rollup -c rollup.config.js`,
    test: {
      script: `jest`,
      snapshots: `nps "test -u"`
    }
  }
}
