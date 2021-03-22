'use strict';

var fg = require('fast-glob');
var torpor = require('torpor');
var fluture = require('fluture');
require('xtrace');
var ramda = require('ramda');
var precinct = require('precinct');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fg__default = /*#__PURE__*/_interopDefaultLegacy(fg);
var precinct__default = /*#__PURE__*/_interopDefaultLegacy(precinct);

const glob = dir =>
  new fluture.Future((bad, good) => {
    fg__default['default'](`${dir}/**/*.*`).catch(bad).then(good);
    return function cancel() {}
  });

ramda.curry((raw, x) => [raw, x]);

const keysOf = ramda.curry((pr, raw) => ramda.pipe(ramda.propOr({}, pr), ramda.keys)(raw));

const getAllDependencies = ramda.pipe(
  ramda.of,
  ramda.ap([
    keysOf('dependencies'),
    keysOf('devDependencies'),
    keysOf('peerDependencies')
  ]),
  ([s, d, p]) => s.concat(d).concat(p)
);

const preslash = filepath =>
  ramda.pipe(ramda.indexOf('/'), ramda.slice(0, ramda.__, filepath))(filepath);

const isDependency = ramda.curry((pkg, dep) =>
  ramda.pipe(
    getAllDependencies,
    ramda.either(ramda.includes(dep), ramda.includes(preslash(dep)))
  )(pkg)
);

const mosey = ramda.curry((aliases, pkg, dir) =>
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
                  const isModule = isDependency(pkg, dep);
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
    fluture.chain(fluture.parallel(100)),
    fluture.fork(console.warn)(console.log)
  )(dir)
);

module.exports = mosey;
