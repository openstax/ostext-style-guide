'use strict';

import riot from 'riot';
import route from 'riot-route';
import scrollToY from './scrollTo.js';
import lunr from 'lunr';
import * as interactions from './interactions.js';

riot.tag('raw',
  ``,
  function(opts) {
    this.root.innerHTML = opts.content;
  }
);

riot.tag('style-guide-navigation',
  `
  <div class="menu">
      <p class="changelog">v0.0.2 <a href="https://github.com/openstax/ostext-style-guide/releases" target="_blank">(Changelog)</a></p>
    </ul>
  </div>
  <div each="{category, i in sections}" class="menu">
  <p>{category.category}</p>
  <ul class="menu-list">
    <li each="{el, i in category.sections}" class="{el.number}">
      <a href="{el.url}" class="{is-active: parent.selectedUrl === el.url}">{el.name}</a>
    </li>
   </ul>
   </div>`,
   function(opts) {
    var self = this;
    this.sections = [];

    this.setSections = function() {
      this.sections = [];

      opts.sections.map(function(section) {
        this.sections.push({number: section['Number'],
                            name: section['Name'],
                            category: section['Category']});
      }.bind(this));

      let groups = {};

      for (var i = 0; i < this.sections.length; i++) {
        let groupName = this.sections[i].category;
          if (!groups[groupName]) {
            groups[groupName] = [];
          }
          if (this.sections[i].number.endsWith('.0.0')) {
            continue;
          }

        groups[groupName].push({name: this.sections[i].name,
                              number:this.sections[i].number,
                              url: `/#/${this.sections[i].category.replace(/ +/g, '-').toLowerCase()}/${this.sections[i].name.replace(/ +/g, '-').toLowerCase()}`});
      }

      this.sections = [];

      for (var groupName in groups) {
        this.sections.push({category: groupName, sections: groups[groupName]});
      }
    }.bind(this)

    let subRoute = route.create();
    subRoute(highlightCurrent);

    function highlightCurrent(category, id) {
      self.selectedUrl = `/#/${category}/${id}`;
      self.update();
    }

    this.on('sections-updated', function() {
      this.setSections();
      this.update();
    });
  }
);

riot.tag('style-guide-search',
  `<div class="control is-grouped">
    <p class="control is-expanded has-icon">
      <input class="input" ref="input" type="text" onclick="{addClass}" onkeyup="{search}" placeholder="Search for content, elements, layout, typography...">
      <span class="icon is-medium">
        <i class="fa fa-search"></i>
      </span>
    </p>
  </div>

  <div class="search-results menu">
    <ul class="menu-list sg-search-result">
     <li each={results} onclick="{reset}"><a href="/#/{category.replace(/ +/g, '-').toLowerCase()}/{name.replace(/ +/g, '-').toLowerCase()}"><span>in {category}</span>{name}</a></li>
     <virtual if="{results.length == 4}">
      <li><a class="view-more" href="/#/search?keyword={refs.input.value}"><span>in search</span>View more results</a></li>
     </virtual>
    </ul>
  </div>`,
  function(opts) {
    this.results = [];

    this.search = (e) => {
      this.result_refs = opts.index.search(e.target.value);
      this.results = [];

      this.result_refs.slice(0, 4).map((result_ref) => {
        opts.sections.map((section) => {

          if (section['Number'] == result_ref.ref) {
            this.results.push({number: section['Number'],
                               name: section['Name'],
                               category: section['Category'],
                               urlId: section['id']});
          }
        })
      })
      this.update();
    }

    this.reset = (e) => {
      let category = e.currentTarget.childNodes[0].firstChild.textContent;
      let section = e.currentTarget.childNodes[0].lastChild.textContent;

      this.result = section + ' ' + category;
      this.results = [];
      this.refs.input.value = this.result;
      this.update();
    }

    this.addClass = (e) => {
      let search = document.querySelector('.search');
      let inputSelected = e.currentTarget;

      if (!interactions.hasClass(search, 'is-focus')) {
        interactions.addClass(search, 'is-focus');
        interactions.addClass(document.querySelector('.search-results'), 'is-visible');
      }

      document.addEventListener('click', function(e) {
        if (e.target != inputSelected) {
          interactions.removeClass(search, 'is-focus');
          interactions.removeClass(document.querySelector('.search-results'), 'is-visible');
        }
      });
      this.update();
    }
  }
);

riot.tag('style-guide',
  `<nav class="side-nav menu">
    <!-- Left-side navigation of Style Guide sections -->
    <style-guide-navigation class="sg-navigation" sections={sections}></style-guide-navigation>
  </nav>
  <main class="main section">
    <div class="container">
      <!-- Search elements -->
      <style-guide-search class="search" index={index} sections={sections}></style-guide-search>
      <div id="section" sections={sections}></div>
    </div>
  </main>`,
  function(opts) {
    this.sections = [];

    this.resetSearchIndex = function() {
      this.index = lunr(function() {
        this.field('name', {boost:10});
        this.field('category', {boost:6});
        this.ref('number');
      });
      window.index = this.index;
    }.bind(this)

    this.setSections = function(data) {

      this.sections = data;

      this.resetSearchIndex();

      this.sections.map(function(section) {
        this.index.add({
          description: section['description'],
          name: section['Name'],
          id: section['Id'],
          markup: section['Markup'],
          number: section['Number'],
          category: section['Category']
        });
      }.bind(this));
      this.update();
      this.tags['style-guide-navigation'].trigger('sections-updated');
    }.bind(this)

    opts.model.on('updated', function(data) {
      this.setSections(data);
    }.bind(this));
  }
);

riot.tag('style-guide-sections',
  `
  <section>
    <p class="title h1">Textbook Design Guide</p>
  </section>
  <!-- Style Guide section data -->
  <section id="{opts.Number}" class="section">
    <div class="columns">
      <div class="column {is-three-quarters-desktop: hasSubSection} is-12-tablet">
        <div class="content">
          <h1 class="title">{ opts.Name }</h1>
          <raw content="{ opts.description }"/>
          <div class="sg-html-example"><p>Raw HMTL</p>{raw_html}</div>
          <div class="sg-html-example"><p>Cooked HTML</p>{cooked_html}</div>
          <div class="sg-css-example"><p>Rule Set CSS</p>{rule_set}</div>
        </div>
      </div>
      <div class="column is-hidden-touch {is-hidden-desktop: !hasSubSection}">
        <div class="menu subsection">
          <h3>In this section</h3>
          <ul class="menu-list">
            <li each={subSection}><a href="/#/{parent.opts.Category.replace(/ +/g, '-').toLowerCase()}/{parent.opts.Name.replace(/ +/g, '-').toLowerCase()}/#{headingID}" onclick="{goToSection}">{title}</a></li>
          </ul>
          <virtual if={hasSubSection}>
            <a href="/#/{opts.Category.replace(/ +/g, '-').toLowerCase()}/{opts.Name.replace(/ +/g, '-').toLowerCase()}/#top" class="back-to-top" onclick="{goToSection}">
              <span class="icon is-large">
                <i class="fa fa-arrow-circle-o-up"></i>
              </span>
            </a>
          </virtual>
        </div>
      </div>
    </div>
  </section>`,
  function(opts) {
    this.subSection = [];
    this.hasSubSection = false;

    this.setSubSection = function() {
      this.subSection = [];

      for (var i=0; i < this.root.getElementsByTagName('h2').length; i++ ) {
        let title = this.root.getElementsByTagName('h2')[i];
        let titleContent = title.innerText;
        let headingID = titleContent.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g,"").replace(/ +/g, '-').toLowerCase();

        this.subSection.push({ title: titleContent,
                               headingID: headingID});
      }

      if (this.subSection.length) {
        this.hasSubSection = true;
      }
    }.bind(this)

    this.setHeadingId = () => {
      let headings = this.root.querySelectorAll('.content h1,.content h2,.content h3');

      for (var i=0; i < headings.length; i++ ) {
        let title = headings[i];
        let titleContent = title.textContent;
        let headingID = titleContent.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g,"").replace(/ +/g, '-').toLowerCase();

        title.id = headingID;

        if (document.querySelectorAll(`#${title.id}`).length > 1) {
          headingID = headingID + i;
          title.id = headingID;
        }

        title.innerHTML = `${titleContent}<a class="heading-link" href="/#/${opts.Category.replace(/ +/g, '-').toLowerCase()}/${opts.Name.replace(/ +/g, '-').toLowerCase()}/#${headingID}">
                              <span class="icon is-small">
                                <i class="fa fa-link"></i>
                              </span>
                            </a>`;
        title.querySelector('.heading-link').addEventListener('click', this.goToSection);
      }
    };

    this.on('mount', function() {
      this.setHeadingId();
      this.setSubSection();
      this.update();

      if (window.MathJax) {
       //queue MathJax to load MathML after tag mount
       window.MathJax.Hub.Queue(["Typeset",window.MathJax.Hub]);
      }
    });

    this.goToSection = (e) => {
      e.preventDefault();
      let url = e.currentTarget.href.split('#')[1];
      let heading = e.currentTarget.href.split('#')[2];
      let el = document.getElementById(heading);

      if (el) {
        let rect = el.getBoundingClientRect();

        if (heading != 'top') {
          scrollToY(rect.top + pageYOffset - 20, 2000, 'easeInOutSine');
        } else {
          window.scrollTo(0, rect.top + pageYOffset);
        }
      }

      history.pushState(null, '', `#${url}#${heading}`);
    }
  }
);
