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
  index: 0,
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
      const newFactor = R.pipe(
        parseInt,
        R.defaultTo(45),
        R.min(120),
        R.max(1)
      )(parameters);
      currentMapPlan = R.merge(currentMapPlan, { timeFactor: newFactor, controller: name });
      break;
    default:
      return Promise.resolve(templates.badCommand(cmd, name));
  }
  return Promise.resolve('Successfully updated state');
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
