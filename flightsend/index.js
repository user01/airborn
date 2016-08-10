// tool to collect the dump1090 results every n seconds
// and post the results to a web service

// Note this script will operate for the day where it started 

const fetch = require('fetch');
const moment = require('moment');
const postjson = require('post-json');

const postURL = "https://alpha.codex10.com/airborn/planeupdate";
const token = "184a711d-2a72-4160-afa1-b46c26277184";

const startTime = moment();
const startDay = startTime.dayOfYear();

const pullPlaneDataAndPost = () => {
  const currentTime = moment();
  if (startDay != currentTime.dayOfYear()) {
    return;
  }
  // don't wait for posts to complete before scheduling
  setTimeout(pullPlaneDataAndPost, 30 * 1000);
  const currentTimeStr = currentTime.format('dddd, MMMM Do YYYY, h:mm:ss a');
  console.log(`Running plane pull for ${currentTimeStr}`);

  // source file is iso-8859-15 but it is converted to utf-8 automatically
  fetch.fetchUrl("http://localhost:8080/data.json", function (error, meta, body) {
    if (error) {
      console.error(`Fetch Error for ${currentTimeStr}`);
      console.error(error);
      return;
    }
    const planeList = JSON.parse(body.toString());
    console.log(`Found ${planeList.length} planes for ${currentTimeStr}`);

    const postPayload = {
      planeList,
      token,
      time: currentTime.toISOString()
    };

    postjson(postURL, postPayload, function (error, result) {
      if (error) {
        console.error(`Fetch Error for ${currentTimeStr}`);
        console.error(error);
        return;
      }
      console.log(`Send complete for ${currentTimeStr}`);
    })
  });

}


//kick off
pullPlaneDataAndPost();
