/*
 OpenStax Style Guide
*/
'use strict';

import riot from 'riot';
import route from 'riot-route';
import scrollToY from './scrollTo.js';
import './tags.js';
import * as interactions from './interactions.js';

class AbstractDataModel {
  constructor(request) {
    riot.observable(this);

    // This request is made asynchronously in the <head>
    // of the main html chunk in order to load JSON data quickly.
    json_request.then((data, xhr) => { this.setModelData(data) },          // success
                      (data, xhr) => { console.error(data, xhr.status) }); // error
  }

  setModelData(data) {
    this.data = data['Section'];
    let newArray = this.data;

    for (var key in newArray) {
      newArray[key].id = key;
      newArray[key].Name = newArray[key]["!text"].split('</h1>')[0].replace(/<h1>/g,"");
      newArray[key].description = newArray[key]["!text"].split('</h1>')[1];
      newArray[key].Number = newArray[key].Number.replace(/'/g,"");
      delete newArray[key]["!text"];

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
    this.trigger('updated', this.data);
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

route.base('/#/');

let r = route.create();
r('', home)
r('*', number)
r('*/*', detail)
r('*/*/#*', heading)
r('/search..', searchPage);

function searchPage() {
  let q = route.query()
  let results = search(q.keyword);
  let buildDescription = '';

  if (results.length > 0) {
    buildDescription = `<div class="search-results menu"><ul class="menu-list">`;

    results.forEach(function(result) {
      buildDescription += `<li class="${result.category.replace(/ +/g, '-').toLowerCase()}"><a href="/#/${result.category.replace(/ +/g, '-').toLowerCase()}/${result.name.replace(/ +/g, '-').toLowerCase()}">${result.name} in ${result.category}</a><p>${result.description}</p></li>`;
    })

    buildDescription += `</div></ul>`;
  } else {
    buildDescription = `<p>Nothing found here.</p>`;
  }

  let selected = {Name:`Search Results for ${q.keyword}` , description: buildDescription, Category: ''};

  document.title = 'Search Results';
  riot.mount('#section','style-guide-sections', selected);
  window.scrollTo(0,0);
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function home() {
  route('/getting-started/background');
  window.scrollTo(0,0);
}

function number(id) {
  if (id.endsWith('.0.0')) {
    let categoryID = id.split('.')[0];
    id = categoryID + '.1.0';
  }

  let selected = app.model.data.filter(function(d) { return d.Number == id })[0] || {};

  if ( isNaN(parseInt(id)) ) {
    goToSection(id, id);
  } else {
    goToSection(selected.Category.replace(/ +/g, '-').toLowerCase(), selected.Name.replace(/ +/g, '-').toLowerCase());
    history.pushState(null, '', `#/${selected.Category.replace(/ +/g, '-').toLowerCase()}/${selected.Name.replace(/ +/g, '-').toLowerCase()}`);
  }
  window.scrollTo(0,0);
}

function goToSection(category, id) {
  if (app.model.data != undefined) {
    if (category == id) {
      let incrementId = app.model.data.filter(function(d) { return (d.Name.replace(/ +/g, '-').toLowerCase() == id) })[0] || {}
      route(incrementId.Number);
    }

    let selected = app.model.data.filter(function(d) { return (d.Name.replace(/ +/g, '-').toLowerCase() == id) && (d.Category.replace(/ +/g, '-').toLowerCase() == category) })[0] || {}
    let newTitle = `${selected.Name} | ${selected.Category} | OpenGuide`;

    if(isEmpty(selected)) {
      let results = search(id);
      let buildDescription = '';

      if (results.length > 0) {
        buildDescription = `<p>Did you mean to visit one of these pages? </p>`;
        buildDescription += `<div class="search-results menu"><ul class="menu-list">`;

        results.forEach(function(result) {
          buildDescription += `<li class="${result.category.replace(/ +/g, '-').toLowerCase()}"><a href="/#/${result.category.replace(/ +/g, '-').toLowerCase()}/${result.name.replace(/ +/g, '-').toLowerCase()}">${result.name} in ${result.category}</a><p>${result.description}</p></li>`;
        })

        buildDescription += `</div></ul>`;
      } else {
        buildDescription = `<p>Nothing found here.</p>`;
      }

      selected = {Name:'Page not found', description: buildDescription, Category: ''};
      newTitle = '404 | Not Found | OpenGuide';
    }

    if (document.title != newTitle) {
      document.title = newTitle;
    }

    riot.mount('#section','style-guide-sections', selected);
  } else {
    app.model.on('updated', function(data) {
      goToSection(category, id);
    });
  }
}

let search = (term) => {
  let result_refs = window.index.search(term);
  let results = [];

  result_refs.map((result_ref) => {
    app.model.data.map((section) => {
      const stringLength = 250;
      let strippedDescription = section['description'].replace(/<(?:.|\n)*?>/gm, '');
      let trimmedDescription = strippedDescription.length > stringLength ?
                    strippedDescription.substring(0, stringLength - 3) + "..." :
                    strippedDescription;

      if ((section['Number'] == result_ref.ref) && (!result_ref.ref.endsWith('.0.0'))) {
        results.push({number: section['Number'],
                           name: section['Name'],
                           description: trimmedDescription,
                           category: section['Category'],
                           urlId: section['id']});
      }
    })
  })
  return results;
}

function detail(category, id) {
  goToSection(category, id);
  window.scrollTo(0,0);
}

function heading(category, id, heading) {
  goToSection(category, id);

  setTimeout(function(){
    let el = document.getElementById(heading);

    if (el) {
      let rect = el.getBoundingClientRect();
      window.scrollTo(0, rect.top + pageYOffset - interactions.offsetValue());
    }
  }, 400);
}

riot.mount('style-guide', app);
route.stop();
route.start(true);
