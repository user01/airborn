
/// <reference path="../../typings/references.d.ts" />


import * as R from 'ramda';
import * as moment from 'moment';

// import data from './local.data.tmp';
import colorlist from './color.list';

declare var topojson: any;

export class Utility {
  public static Hash = (str: string) => {
    var hash = 0, i, chr, len;
    if (str.length === 0) return hash;
    for (i = 0, len = str.length; i < len; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  public static ColorFromStr = (str: string) => {
    const num = Utility.Hash(str) % colorlist.length;
    return colorlist[num];
  }
}

// Play from time until reaching present time (or end time), then if cycling set time back to start, otherwise set to real time (1)

// export interface MapPlan {
//   id: number; //indicates which version is latest
//   timeStart: moment.Moment; // when playback should begin
//   timeEnd: moment.Moment; // when playback should end
//   timeFactor: number; //rate factor
//   timeCycle: boolean; // when reaching time end, snap back to timeStart
//   locked: boolean; // prevent further updates until unlock
//   demo: boolean; // don't pull from the server, use the backups
// }


export default Utility;