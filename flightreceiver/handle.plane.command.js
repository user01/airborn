"use strict";
const restify = require('restify');
const R = require('ramda');
const fs = require('fs');
const moment = require('moment');
const Promise = require('bluebird');
// const Datastore = require('nedb');
const templates = require('./templates.js');
// const planeCommandsDb = Promise.promisifyAll(new Datastore({
//   filename: 'plane.commands.datafile',
//   autoload: true
// }));



let currentMapPlan = {
  index: moment().toISOString(),
  timeFactor: 45,
  loop: true,
  locked: false,
  controller: ''
};
const parseCommand = /\s*(\w+)\s*(.*)/;

const isNullOrWhitespace = (input) => {
  return !input || !input.trim();
}

const handlePlaneCommand = (cmdStr, name) => {
  // this maintains 2 basic things: a running set of all accepted commands and the current full command
  //
  const match = parseCommand.exec(cmdStr);
  if (isNullOrWhitespace(cmdStr) || !match) {
    return Promise.resolve(templates.empty(name));
  }
  const cmd = match[1].toLowerCase();
  const parameters = match[2];

  switch (cmd) {
    case 'speed':
    case 'factor':
      const timeFactor = R.pipe(
        parseInt,
        R.defaultTo(45),
        R.min(360),
        R.max(1)
      )(parameters);
      currentMapPlan = R.merge(currentMapPlan, { timeFactor });
      break;
    case 'loop':
      const loop = R.pipe(
        R.trim,
        R.toLower,
        R.equals('true')
      )(parameters);
      currentMapPlan = R.merge(currentMapPlan, { loop });
      break;
    default:
      return Promise.resolve(templates.badCommand(cmd, name));
  }
  currentMapPlan = R.merge(currentMapPlan,
    {
      index: moment().toISOString(),
      id: currentMapPlan.id + 1,
      controller: name != 'erik' ? name : ''
    }
  );
  return Promise.resolve(
    `Successfully updated state. Now at ${currentMapPlan.timeFactor}x and will ${currentMapPlan.loop ? '' : 'not '}loop.`);
}

const currentMapState = (req, res, next) => {
  res.send(currentMapPlan);
  return next();
}


module.exports =
  {
    handlePlaneCommand,
    currentMapState
  };
