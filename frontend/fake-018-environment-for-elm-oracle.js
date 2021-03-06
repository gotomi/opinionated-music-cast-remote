/*

Fakes a 0.18 Elm world so that elm-oracle can extract some information when 
using 0.19. 

Useful for editor plugins to get some auto complete.

 */

const fs = require('fs');
const elmJson = require('./elm.json');

console.log('Creating elm-package.json');

const elmPackage = {
  version: '1.0.0',
  summary: 'Fake Elm 0.18 env for elm-oracle',
  repository: 'https://github.com/xyz/zyx.git',
  license: 'BSD-3-Clause',
  'source-directories': elmJson['source-directories'],
  'exposed-modules': [],
  dependencies: elmJson.dependencies.direct,
  'elm-version': '0.18.0 <= v < 0.19.0'
};

fs.writeFileSync(
  './elm-package.json',
  JSON.stringify(elmPackage, null, 4),
  'utf8'
);

if (!fs.existsSync('./elm-stuff')) {
  fs.mkdirSync('./elm-stuff');
}

console.log('Creating elm-stuff/exact-dependencies.json');

const exactDependencies = {
  ...elmJson.dependencies.direct,
  ...elmJson.dependencies.indirect
};

fs.writeFileSync(
  './elm-stuff/exact-dependencies.json',
  JSON.stringify(exactDependencies, null, 4),
  'utf8'
);

// Create sub-folders under packages
console.log('Creating sub-folders under elm-stuff/packages');

Object.entries(exactDependencies).forEach(entry => {
  ('packages/' + entry[0] + '/' + entry[1])
    .split('/')
    .reduce((basePath, part) => {
      const nextPath = basePath + '/' + part;

      if (!fs.existsSync(nextPath)) {
        fs.mkdirSync(nextPath);
      }

      return nextPath;
    }, 'elm-stuff');
});

// Copy 0.19 docs to elm-stuff/packages
console.log('Copying docs for the following packages:\n', exactDependencies);

const homedir = require('os').homedir();

Object.entries(exactDependencies).forEach(entry => {
  const src =
    homedir +
    '/.elm/0.19.0/package/' +
    entry[0] +
    '/' +
    entry[1] +
    '/documentation.json';

  const body = JSON.parse(fs.readFileSync(src, 'utf8').toString());

  // Rename back from 'unions' to 'types'
  body.forEach(docPart => {
    docPart.types = docPart.unions;
    delete docPart.unions;
  });

  fs.writeFileSync(
    'elm-stuff/packages/' + entry[0] + '/' + entry[1] + '/documentation.json',
    JSON.stringify(body),
    'utf8'
  );
});
