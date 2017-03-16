/*
 OpenStax Style Guide
*/
'use strict';

import riot from 'riot';
import './tags.js';
import './interactions.js';

class AbstractDataModel {
  constructor(request) {
    riot.observable(this);

    // This request is made asynchronously in the <head>
    // of the main html chunk in order to load JSON data quickly.
    json_request.then((data, xhr) => { this.setModelData(data) },          // success
                      (data, xhr) => { console.error(data, xhr.status) }); // error
  }

  setModelData(data) {
    this.data = data.sort(function(a,b) {
      var va = a['name'].split(',')[0].split('.');
      var vb = b['name'].split(',')[0].split('.');
      for (var i = 0; i < va.length; ++i) {
        va[i] = Number(va[i]);
      }
      for (var i = 0; i < vb.length; ++i) {
        vb[i] = Number(vb[i]);
      }
      if (va[0] > vb[0]) return 1;
      if (va[0] < vb[0]) return -1;
      if (va[1] > vb[1]) return 1;
      if (va[1] < vb[1]) return -1;
      if (va[2] > vb[2]) return 1;
      if (va[2] < vb[2]) return -1;

      return 0;
    });
    this.trigger('updated', data);
  }
  setItem(idx, val) {
    this.data[idx] = val;
  }
  getItem(idx) {
    return this.data[idx];
  }
}

class StyleGuideApp {
  constructor() {
    riot.observable(this);

    this.model = new AbstractDataModel(json_request); // json_request is global.
  }
}

let app = new StyleGuideApp();

// Clean this up.
window.riot = riot;
window.app = app;
