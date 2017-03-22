/*
 OpenStax Style Guide
*/
'use strict';

import riot from 'riot';
import route from 'riot-route';
import './tags.js';
import './interactions.js';

class AbstractDataModel {
  constructor(request) {
    riot.observable(this);

    // This request is made asynchronously in the <head>
    // of the main html chunk in order to load JSON data quickly.
    json_request.then((data, xhr) => { this.setModelData(data['Section']) },          // success
                      (data, xhr) => { console.error(data, xhr.status) }); // error
  }

  setModelData(data) {
    this.data = data;
    let newArray = this.data;

    for (var key in newArray) {
      newArray[key].description = newArray[key]["!text"];
      newArray[key].Number = newArray[key].Number.replace(/'/g,"");
      delete newArray[key]["!text"];
    }

    this.data = newArray;
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

riot.mount('*', app);

route(function() {
  riot.mount('style-guide-sections', 'style-guide-sections', app.model.data[1]);
})

route.stop();
route.start(true);

route.base('#/');

route('/section/*', function(id) {
  riot.mount('style-guide-sections', 'style-guide-sections', app.model.data[id]);
});
