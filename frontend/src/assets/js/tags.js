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
  <div each="{category, i in sections}" class="menu">
  <p>{category.category}</p>
  <ul class="menu-list">
    <li each="{el, i in category.sections}" class="{el.number}">
      <a href="{el.url}" class="{is-active: parent.selectedUrl === el.url}" onclick="{removeOpenClasses}">{el.name}</a>
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

    this.removeOpenClasses = (e) => interactions.removeOpenClasses(e);

    this.on('sections-updated', function() {
      this.setSections();
      this.update();
    });
  }
);

riot.tag('style-guide-search',
  `<div class="control is-grouped">
    <p class="control is-expanded has-icon">
      <input class="input" ref="input" type="text" onclick="{addClass}" onkeyup="{onSearch}" placeholder="Search for content, elements, layout, typography...">
      <span class="icon is-medium">
        <i class="fa fa-search"></i>
      </span>
    </p>
  </div>

  <div class="search-results menu">
    <ul class="menu-list sg-search-result">
     <li each={results} onclick="{reset}" class="{category.replace(/ +/g, '-').toLowerCase()}"><a href="/#/{category.replace(/ +/g, '-').toLowerCase()}/{name.replace(/ +/g, '-').toLowerCase()}"><span>in {category}</span>{name}</a></li>
     <virtual if="{results.length == 0 && refs.input.value != ''}">
      <li class="no-results">Nothing found for <strong><i>{refs.input.value}</i></strong></li>
     </virtual>
     <virtual if="{results.length == 4}">
      <li onclick="{removeOpenClasses}"><a class="view-more" href="/#/search?keyword={refs.input.value}">See all results for {refs.input.value}
      <span class="icon">
        <i class="fa fa-chevron-right"></i>
      </span>
      </a></li>
     </virtual>
    </ul>
  </div>`,
  function(opts) {
    this.removeOpenClasses = (e) => interactions.removeOpenClasses(e);
    this.results = [];

    this.search = (term) => {
      this.result_refs = opts.index.search(term);
      this.results = [];

      this.result_refs.slice(0, 4).map((result_ref) => {
        opts.sections.map((section) => {

          if ((section['Number'] == result_ref.ref) && (!result_ref.ref.endsWith('.0.0'))) {
            this.results.push({number: section['Number'],
                               name: section['Name'],
                               category: section['Category'],
                               urlId: section['id']});
          }
        })
      })
      this.update();
    }

    this.onSearch = (e) => {
      this.search(e.target.value);
    }

    this.reset = (e) => {
      let category = e.currentTarget.childNodes[0].firstChild.textContent;
      let section = e.currentTarget.childNodes[0].lastChild.textContent;

      this.result = section + ' ' + category;
      this.results = [];
      this.refs.input.value = this.result;
      this.search(this.refs.input.value);
      interactions.removeOpenClasses(e);
      this.update();
    }

    this.addClass = (e) => {
      let search = this.root;
      let inputSelected = e.currentTarget;
      let results = this.root.querySelector('.search-results');
      let input = this.root.querySelector('.input');
      let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      let scrollWindowDown = lastScrollTop + 300;
      let scrollWindowUp = lastScrollTop - 300;

      if (!interactions.hasClass(search, 'is-focus')) {
        interactions.addClass(search, 'is-focus');
        interactions.addClass(results, 'is-visible');
      }

      document.addEventListener('click', function(e) {
        if (e.target != inputSelected) {
          interactions.removeClass(search, 'is-focus');
          interactions.removeClass(results, 'is-visible');
          document.removeEventListener('click', this);
          document.removeEventListener('scroll', closeSearchOnScroll);
        }
      });

      // prevent scrolling of search overlay background on mobile when overlay is open
      // fixes bug where overlay would close when touch scrolling
      // document.querySelector('.nav .nav-center').addEventListener('touchmove', function(e) {
      //   e.preventDefault();
      // });

      let closeSearchOnScroll = (e) => {
        let st = window.pageYOffset || document.documentElement.scrollTop;

        if (st > lastScrollTop) {
          // downscroll code
          if (st > scrollWindowDown) {
            document.querySelector('.main').click();
            input.blur();
          }
        } else {
          // upscroll code
         if (st < scrollWindowUp) {
           document.querySelector('.main').click();
           input.blur();
         }
        }
        lastScrollTop = st;
      }
      document.addEventListener('scroll', closeSearchOnScroll);
      this.update();
    }
  }
);

riot.tag('style-guide',
  `<nav class="side-nav menu">
    <!-- Left-side navigation of Style Guide sections -->
    <style-guide-navigation class="sg-navigation" sections={sections}></style-guide-navigation>
  </nav>
  <main class="main section" id="top">
    <div class="container">
      <div id="section" sections={sections}></div>
    </div>
    <footer class="footer">
      <div class="container">
        <div class="columns is-vcentered is-gapless is-mobile">
          <div class="column is-7">
            <div class="meta">
              <a href="http://www.openstax.org/about" target="_blank">About</a>
              <a href="http://www.openstax.org/blog" target="_blank">Blog</a>
              <a href="http://www.openstax.org/contact" target="_blank">Contact</a>
            </div>
            <p>
              &copy; 1996 - ${new Date().getFullYear()} <a href="http://www.openstax.org" target="_blank">OpenStax</a>.
            </p>
            <p>
              All Rights Reserved.
            </p>
          </div>
          <div class="column has-text-right">
            <a class="icon is-medium" href="https://github.com/openstax/ostext-style-guide" target="_blank">
              <i class="fa fa-github-alt"></i>
            </a>
            <a class="icon is-medium" href="https://www.facebook.com/openstax" target="_blank">
              <i class="fa fa-facebook"></i>
            </a>
            <a class="icon is-medium" href="https://twitter.com/openstax" target="_blank">
              <i class="fa fa-twitter"></i>
            </a>
            <a class="icon is-medium" href="https://www.linkedin.com/company/openstax" target="_blank">
              <i class="fa fa-linkedin"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </main>`,
  function(opts) {
    this.sections = [];

    this.resetSearchIndex = function() {
      this.index = lunr(function() {
        this.field('name', {boost:10});
        this.field('description', {boost:8});
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
          number: section['Number'],
          category: section['Category']
        });
      }.bind(this));
      this.update();
      riot.mount('style-guide-search', {index:this.index, sections: this.sections});
      this.tags['style-guide-navigation'].trigger('sections-updated');
    }.bind(this)

    opts.model.on('updated', function(data) {
      this.setSections(data);
    }.bind(this));
  }
);

riot.tag('style-guide-sections',
  `
  <!-- Style Guide section data -->
  <section id="{opts.Number}" class="section">
    <div class="columns">
      <div class="column is-three-quarters-widescreen is-12-tablet">
        <nav class="nav github-bar">
          <div class="nav-left">
            <div class="nav-item">
              <p>OpenGuide <span>v1.0.0</span></p>
            </div>
          </div>
          <div class="nav-right">
            <div class="nav-item is-hidden-mobile">
              <a href="https://github.com/openstax/ostext-style-guide/releases" target="_blank" class="changelog">Changelog</a>
            </div>
            <div class="nav-item">
              <a href="https://github.com/openstax/ostext-style-guide/issues/" target="_blank" class="github-issues">
              <span class="icon">
                <i class="fa fa-github-alt"></i>
              </span>
              Submit an issue</a>
            </div>
          </div>
        </nav>
        <div class="content">
          <h1 class="title">{ opts.Name }</h1>
          <raw content="{ opts.description }"/>
        </div>
      </div>
      <div class="column is-hidden-touch is-hidden-desktop-only {is-hidden-desktop: !hasSubSection}">
        <div class="menu subsection">
          <h3>In this section</h3>
          <ul class="menu-list">
            <li each={subSection}><a href="/#/{parent.opts.Category.replace(/ +/g, '-').toLowerCase()}/{parent.opts.Name.replace(/ +/g, '-').toLowerCase()}/#{headingID}" onclick="{goToSection}">{title}</a></li>
          </ul>
        </div>
        <virtual if={hasSubSection}>
          <a href="/#/{opts.Category.replace(/ +/g, '-').toLowerCase()}/{opts.Name.replace(/ +/g, '-').toLowerCase()}/#top" class="back-to-top" onclick="{goToSection}">
            <span class="icon is-small">
              <i class="fa fa-chevron-up"></i>
            </span>
            <span class="icon is-large">
              <img src="assets/img/svg/back-to-top.svg" />
            </span>
            <span class="tooltiptext">Back to top</span>
          </a>
        </virtual>
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
          scrollToY(rect.top + pageYOffset - interactions.offsetValue(), 2000, 'easeInOutSine');
        } else {
          scrollToY(rect.top + pageYOffset - interactions.offsetValue(), 14000, 'easeInOutSine');
        }
      }

      history.pushState(null, '', `#${url}#${heading}`);
    }
  }
);
