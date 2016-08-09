
/// <reference path="../../typings/references.d.ts" />

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';



/** Main Map Element
*/
export class Map {
  

  constructor(private rootElement: HTMLElement) {
    this.render();
  }

  private render = () => {
    const isWaiting =
      ReactDOM.render(
        (<div>
          <p>Map will be here</p>
        </div>), this.rootElement);
  }

}


export default Map;