"use strict";
const restify = require('restify');
const R = require('ramda');
const fs = require('fs');
const moment = require('moment');
const Promise = require('bluebird');
const Datastore = require('nedb');
const templates = require('./templates.js');
const handlePlaneCommand = require('./handle.plane.command.js');
const slackCommandsDb = Promise.promisifyAll(new Datastore({
  filename: 'slack.commands.datafile',
  autoload: true
}));



const validTokens = [
  'U59APMRWFvXoVd4bRv6i9f3w', // msds
  'M4gaVdees0u1l1EV7ctbtpLD'  // sandbox
]

const isNullOrWhitespace = (input) => {
  return !input || !input.trim();
}

const handleSlackCommand = (req, res, next) => {
  try {
    var data = ((typeof req.body == 'string') ? queryString.parse(req.body.substr(0, 2048)) : req.body) || {};
    if (!data.token || validTokens.indexOf(data.token) < 0) {
      console.warn('Feedback - Token missing or wrong ', req.body);
      res.send(400);
      return next();
    }
  } catch (e) {
    console.warn(e);
    console.warn('Feedback - Unable to parse params ', req.body);
    res.send(400);
    return next();
  }

  data['date'] = new Date();
  console.log(`${data.user_name} Posted >>${data.text}<<`);

  slackCommandsDb.insertAsync(data)
    .then((newDoc) => {
      return db.findAsync({
        user_name: data.user_name,
        date: {
          $gt: moment().add(-60, 'seconds').toDate()
        }
      });
    }).then((docs) => {
      // console.log(`Found ${docs.length} documents for this user`);
      if (docs.length > 12) {
        return Promise.resolve(templates.overload(data.user_name, docs.length));
      }

      return handleCommand(data.text, data.user_name, docs.length);
    }).then((responseStr) => {
      res.send(responseStr);
      return next();
    });
}

const parseCommand = /\s*(\w+)\s*(.*)/;
const handleCommand = (text, name) => {
  const match = parseCommand.exec(cmdStr);
  if (isNullOrWhitespace(cmdStr) || !match) {
    return Promise.resolve(templates.empty(name));
  }
  const cmd = match[1].toLowerCase();
  const parameters = match[2];

  switch (cmd) {
    case 'airborn':
      return Promise.resolve(handlePlaneCommand(parameters, name));
    default:
      return Promise.resolve(templates.badCommand(cmd, name));
  }
}



module.exports =
  handleSlackCommand
;
