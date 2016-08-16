"use strict";
const restify = require('restify');
const R = require('ramda');
const fs = require('fs');
const moment = require('moment');
const Promise = require('bluebird');
const Datastore = require('nedb'),
  db = Promise.promisifyAll(new Datastore({
    filename: 'planes.datafile',
    autoload: true
  }));


const token = "184a711d-2a72-4160-afa1-b46c26277184";
const rootUrl = '/airborn/';



const server = restify.createServer();
server.use(restify.CORS());
server.use(restify.bodyParser());
server.use(restify.throttle({
  rate: 0.085 * 40, //~ 5 per minute * 40
  burst: 15,
  ip: true,
  // overrides: {
  //     '127.0.0.1': {
  //         rate: 0, // unlimited
  //         burst: 0
  //     }
  // }
}));

const cleanStr = (str, def) => {
  const deft = def ? def : null;
  if (typeof (str) != 'string') return deft;
  const first = str.split(/\s+/)[0];
  return str.substr(0, 1024);
}

const respondAlive = (req, res, next) => {
  var name = cleanStr(req.params.name);
  var response = `Greetings ${name}, the time is ${(new Date()).toISOString()}`;
  res.send(response);
  next();
}
server.get(rootUrl + 'alive', respondAlive);
server.head(rootUrl + 'alive', respondAlive);
server.get(rootUrl + 'alive/:name', respondAlive);
server.head(rootUrl + 'alive/:name', respondAlive);

const handlePlaneUpdate = (req, res, next) => {
  try {
    var data = ((typeof req.body == 'string') ? JSON.parse(req.body.substr(0, 2048)) : req.body) || {};
    if (!data.token || data.token != token) {
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

  db.insertAsync(planeListIntoDocs(data.planeList, data.time))
    .then((newDocs) => {
      // purge any entries older than 3 days
      return db.removeAsync({
        date: { $lt: moment().add(-3, 'days').toDate() }
      }, { multi: true });
    }).then(() => {
      res.send(200);
      return next();
    });
}

const planeListIntoDocs = (planeList, dateStr) => {
  const date = moment(dateStr).toDate();
  const dateObj = { date };
  return R.map(
    R.merge(dateObj)
  )(planeList);
}

const planeDbDocsToState = (planeDbDocs) => {
  return R.pipe(
    R.groupBy(R.prop('hex')),
    R.map((listForPlane) => {
      const flightNumber = R.pipe(
        R.head,
        R.prop('flight'),
        R.trim
      )(listForPlane);
      const positions = R.map((doc) => {
        return {
          lat: doc.lat,
          lon: doc.lon,
          alt: doc.altitude,
          track: doc.track,
          speed: doc.speed,
          date: moment(doc.date).toISOString()
        };
      })(listForPlane);
      return {
        flightNumber,
        positions
      };
    })
  )(planeDbDocs);
}

const handlePlanes = (req, res, next) => {
  if (req.params.token != token) {
    res.send(400);
    return next();
  }

  db.findAsync({
    date: {
      $lt: moment(req.params.endDate).toDate(),
      $gt: moment(req.params.startDate).toDate()
    }
  }).then((results) => {
    // these results are an array of form:
    //[
    // {"hex":"400e74", "flight":"VIR103M ", "lat":40.684341, "lon":-74.830872, "altitude":40000, "track":231, "speed":455},
    // {"hex":"4cc2a5", "flight":"ICE647  ", "lat":41.054977, "lon":-74.738118, "altitude":33875, "track":208, "speed":417},
    // {"hex":"44ccda", "flight":"", "lat":40.774267, "lon":-75.124574, "altitude":28150, "track":233, "speed":453}
    // ]
    // with _id and date fields
    // const json = planeDbDocsToState(results);
    res.send(results);
    return next();
  });
}


server.post(rootUrl + '/planeupdate', handlePlaneUpdate);
server.get(rootUrl + '/planes/:startDate/:endDate/:token', handlePlanes);


//prevent keep alive
server.pre(restify.pre.userAgentConnection());
server.listen(8082, function () {
  console.log('%s listening at %s on %s', server.name, server.url, moment().toISOString());
});