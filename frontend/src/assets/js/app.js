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
      newArray[key].id = key;
      newArray[key].Name = newArray[key]["!text"].split('</h1>')[0].replace(/<h1>/g,"");
      newArray[key].description = newArray[key]["!text"].split('</h1>')[1];
      newArray[key].Number = newArray[key].Number.replace(/'/g,"");
      delete newArray[key]["!text"];

      // get subsection values for "In this Section" navigation
      // matches any h2's in the description field
      // removes h2 tags and store value in subSection field
      let str = newArray[key].description;
      let subStr = str.match(/<h2>(.*?)<\/h2>/g)

      if (subStr) {
        subStr = subStr.map(function(val){
          return val.replace(/<\/?h2>/g,'');
        });
      }

      newArray[key].subSection = subStr;

      if (newArray[key].Number.endsWith('.0.0')) {
        newArray[key].Category = newArray[key].Name;
      } else {
        let newKey = key;

        do {
          newKey--;

          if (newArray[newKey].Number.endsWith('.0.0')) {
            newArray[key].Category = newArray[newKey].Name;
          }
        }
        while (!newArray[newKey].Number.endsWith('.0.0'));
      }
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
route.stop();
route.start(true);

let r = route.create();
r('', home)
r('*', detail)
r(home) // `notfound` would be nicer!

function home() {
  let selected = app.model.data.filter(function(d) { return d.Number == '1.1.0'})[0] || {}
  riot.mount('style-guide-sections', 'style-guide-sections', selected);
}

function detail(id) {
  let selected = app.model.data.filter(function(d) { return d.Number == id })[0] || {}
  riot.mount('style-guide-sections', 'style-guide-sections', selected);
}
