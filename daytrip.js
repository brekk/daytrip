'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var torpor = require('torpor');
var fluture = require('fluture');
var ramda = require('ramda');
var precinct = require('precinct');
var fg = require('fast-glob');
var path = require('path');
require('xtrace');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var precinct__default = /*#__PURE__*/_interopDefaultLegacy(precinct);
var fg__default = /*#__PURE__*/_interopDefaultLegacy(fg);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);

const glob = input =>
  new fluture.Future((bad, good) => {
    fg__default['default'](input).catch(bad).then(good);
    /* istanbul ignore next */
    return function cancel() {}
  });

const preslash = filepath =>
  ramda.pipe(ramda.indexOf(path__default['default'].sep), ramda.slice(0, ramda.__, filepath))(filepath);

const patharray = ramda.memoizeWith(ramda.identity)(ramda.split(path__default['default'].sep));
ramda.pipe(
  patharray,
  ramda.slice(-2, Infinity),
  ramda.join(path__default['default'].sep)
);

const keysOf = ramda.curry((pr, raw) =>
  ramda.pipe(ramda.propOr({}, pr), ramda.keys)(raw)
);
const getAllDependencies = ramda.pipe(
  ramda.of,
  ramda.ap([
    keysOf('dependencies'),
    keysOf('devDependencies'),
    keysOf('peerDependencies')
  ]),
  ([s, d, p]) => s.concat(d).concat(p)
);

const isDependency = ramda.curry((pkg, dep) =>
  ramda.pipe(
    getAllDependencies,
    ramda.either(ramda.includes(dep), ramda.includes(preslash(dep)))
  )(pkg)
);

/*
const aliases = {
  components: '/Users/brekk/work/charly/superdesk-browser3/src/components',
  layout: '/Users/brekk/work/charly/superdesk-browser3/src/layout',
  api: '/Users/brekk/work/charly/superdesk-browser3/src/api',
  modules: '/Users/brekk/work/charly/superdesk-browser3/src/modules',
  pages: '/Users/brekk/work/charly/superdesk-browser3/src/pages',
  setup: '/Users/brekk/work/charly/superdesk-browser3/src/setup',
  services: '/Users/brekk/work/charly/superdesk-browser3/src/services',
  sharedComponents: '/Users/brekk/work/charly/superdesk-browser3/src/sharedComponents',
  utils: '/Users/brekk/work/charly/superdesk-browser3/src/utils',
  src: '/Users/brekk/work/charly/superdesk-browser3/src',
  assets: '/Users/brekk/work/charly/superdesk-browser3/assets'
}
*/
const getAliasedPathFrom = ramda.curry((aliases, x) => {
  const alias = aliases[preslash(x)] || false;
  if (alias) {
    return path__default['default'].join(alias, x)
  }
  return x
});
const getAliasedPath = ramda.curry((aliases, a, b) => {
  const aliasedName = getAliasedPathFrom(aliases);
  const relativeTo = aliasedName(a);
  const filepath = aliasedName(b);
  if (a !== relativeTo) {
    console.log('aliased a!', a, '->', relativeTo);
  }
  if (b !== filepath) {
    console.log('aliased b!', b, '->', filepath);
  }
  if (filepath.startsWith('.')) {
    return path__default['default'].join(
      path__default['default'].dirname(filepath),
      path__default['default'].parse(filepath).base
    )
  }
  return filepath
});

const daytrip = ramda.curry((aliases, pkg, dir) =>
  ramda.pipe(
    glob,
    ramda.map(
      ramda.map(file =>
        ramda.pipe(
          torpor.readFile(ramda.__, 'utf8'),
          ramda.map(
            ramda.pipe(
              precinct__default['default'],
              ramda.reduce(
                (agg, dep) => {
                  const { modules: m, dependencies: d } = agg;
                  const filepath = getAliasedPath(aliases, file, dep);
                  const isModule = isDependency(pkg, filepath);
                  const dependencies = !isModule ? d.concat(dep) : d;
                  const modules = isModule ? m.concat(dep) : m;
                  return ramda.mergeRight(agg, { modules, dependencies })
                },
                { modules: [], dependencies: [] }
              ),
              ramda.mergeRight({ file })
            )
          )
        )(file)
      )
    ),
    fluture.chain(fluture.parallel(100))
  )(`${dir}/**/*.*`)
);

const fork = ramda.curry((bad, good, future) =>
  fluture.fork(bad)(good)(future)
);
ramda.curry((raw, x) => [raw, x]);

exports.daytrip = daytrip;
exports.fork = fork;
