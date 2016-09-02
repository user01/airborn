"use strict";
const restify = require('restify');
const R = require('ramda');
const fs = require('fs');
const moment = require('moment');
const Promise = require('bluebird');
const Datastore = require('nedb');
const templates = require('./templates.js');
const planeCommandsDb = Promise.promisifyAll(new Datastore({
  filename: 'plane.commands.datafile',
  autoload: true
}));


// export interface MapPlan {
//   id: number; //indicates which version is latest
//   timeStart: moment.Moment; // when playback should begin
//   timeEnd: moment.Moment; // when playback should end
//   timeFactor: number; //rate factor
//   timeCurrent: moment.Moment;
//   timeCycle: boolean; // when reaching time end, snap back to timeStart
//   timeRun: boolean; // should progress time
//   locked: boolean; // prevent further updates until unlock
//   demo: boolean; // don't pull from the server, use the backups
// }

const baselineMapPlan = {
  id: 0,
  timeStart: moment("2016-08-15T00:00:00.000Z").toDate(),
  timeEnd: moment("2016-08-16T00:00:00.000Z").toDate(),
  timeFactor: 20,
  timeCurrent: moment("2016-08-15T00:00:00.000Z").toDate(),
  timeCycle: false,
  timeRun: true,
  locked: false,
  demo: true
};
const parseCommand = /\s*(\w+)\s*(.*)/;

export const handlePlaneCommand = (cmdStr, name) => {
  // this maintains 2 basic things: a running set of all accepted commands and the current full command
  //
  const match = parseCommand.exec(cmdStr);
  if (isNullOrWhitespace(cmdStr) || !match) {
    return Promise.resolve(templates.empty(name));
  }
  const cmd = match[1].toLowerCase();
  const parameters = match[2];

  switch (cmd) {
    case 'pause':
      return Promise.resolve('');
    default:
      return Promise.resolve(templates.badCommand(cmd, name));
  }
}

export const returnCurrentPlaneState = () => {

}


export default handlePlaneCommand;