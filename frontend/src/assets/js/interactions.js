'use strict';

import Headroom from './headroom.js';

export const offsetValue = () => 100;

export const hasClass = (el, className) => {
  if (el.classList)
    return el.classList.contains(className)
  else
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

export const addClass = (el, className) => {
  if (el.classList)
    el.classList.add(className)
  else if (!hasClass(el, className)) el.className += " " + className
}

export const removeClass = (el, className) => {
  if (el.classList)
    el.classList.remove(className)
  else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
    el.className=el.className.replace(reg, ' ')
  }
}

// get document coordinates of the element
export const getCoords = (elem) => {
  let box = elem.getBoundingClientRect();

  return {
    top: box.top + pageYOffset,
    left: box.left + pageXOffset
  };
}

export const toggleFixedClass = () => {
    const floatingMenu = document.querySelector('.menu.subsection');

    if (floatingMenu) {
        const floatingMenuHeight = Math.max(floatingMenu.scrollHeight, floatingMenu.offsetHeight);
        const content = document.querySelector('.section .content');
        const contentHeight = Math.max(content.scrollHeight, content.offsetHeight)
        const contentBottom = contentHeight - getCoords(content).top;
        const floatingMenuBottom = window.pageYOffset + (floatingMenuHeight-304);

        if (window.pageYOffset > getCoords(content).top) {
          addClass(floatingMenu, 'is-fixed');
        } else {
          removeClass(floatingMenu, 'is-fixed');
        }

        if (floatingMenuBottom > contentBottom) {
          addClass(floatingMenu, 'is-bottom');
        } else {
          removeClass(floatingMenu, 'is-bottom');
        }
    }
}

export const isActive = () => {
  let content = document.getElementsByTagName('raw')[0];

  if (content) {
    let headings = content.getElementsByTagName('h2');
    let subSection = document.querySelector('.menu.subsection');
    let menuItems = subSection.getElementsByTagName('a');

    for (var i=0; i < headings.length; i++ ) {
      let el = headings[i];
      let nextEl = headings[i+1];
      let link = menuItems[i];

      if (nextEl != undefined) {
        if ((window.pageYOffset > (getCoords(el).top - (offsetValue() + 1)))  && (window.pageYOffset < getCoords(nextEl).top - (offsetValue() + 1))) {
          addClass(link, 'is-active');
        } else {
          removeClass(link, 'is-active');
        }
      } else {
        if ((window.pageYOffset > (getCoords(el).top - (offsetValue() + 1)))) {
          addClass(link, 'is-active');
        } else {
          removeClass(link, 'is-active');
        }
      }
    }
  }
}

export const setWidth = () => {
  let sideNav = document.querySelector('.menu.subsection');

  if (sideNav) {
    if (hasClass(sideNav, 'is-fixed')) {
      sideNav.setAttribute('style', `width:${sideNav.parentNode.offsetWidth - 24}px;`);
    } else {
      sideNav.removeAttribute('style');
    }
  }
}

export const navClickEventHandler = (event) => {
  if (!hasClass(document.body, 'is-active')) {
    addOpenClasses(event);
  } else {
    removeOpenClasses(event);
  }
}

export const addOpenClasses = (event) => {
  document.body.setAttribute('style', `top:-${window.pageYOffset}px`);
  addClass(document.body, 'fixed');
  addClass(document.body, 'is-active');

  if (window.innerWidth <= 768) {
    setTimeout(function() {
      addClass(document.querySelector('.nav-toggle'), 'is-active');
    }, 400);
  } else {
    addClass(document.querySelector('.nav-toggle'), 'is-active');
    document.querySelector('.main').addEventListener('click', removeOpenClasses);
  }

  if (event.currentTarget == document.querySelector('.nav-toggle')) {
    addClass(document.body, 'nav--open');
  }

  if (event.currentTarget == document.querySelector('.search--icon')) {
    addClass(document.body, 'search--icon');
  }
}

export const removeOpenClasses = (event) => {
  if ((window.windowWidth != window.innerWidth) || (event.currentTarget != window)) {
    window.windowWidth = window.innerWidth;
    removeClass(document.body, 'fixed');

    if (document.body.hasAttribute('style')) {
      window.scrollTo(0, document.body.getAttribute('style').split('-')[1].split('px')[0]);
      document.body.removeAttribute('style');
    }

    removeClass(document.body, 'is-active');
    removeClass(document.querySelector('.nav-toggle'), 'is-active');
    removeClass(document.body, 'search--icon');
    removeClass(document.body, 'nav--open');
    document.querySelector('.main').removeEventListener('click', removeOpenClasses);
  }
}

let myElement = document.querySelector('.header .nav');

// construct an instance of Headroom, passing the element
let headroom  = new Headroom(myElement, {
  offset: 100,
  tolerance : {
    up : 5,
    down : 0
  },

  // css classes to apply
  classes : {
    // when element is initialised
    initial : "sticky",
    // when scrolling up
    pinned : "sticky--pinned",
    // when scrolling down
    unpinned : "sticky--unpinned",
    // when above offset
    top : "sticky--top",
    // when below offset
    notTop : "sticky--not-top",
    // when at bottom of scoll area
    bottom : "sticky--bottom",
    // when not at bottom of scroll area
    notBottom : "sticky--not-bottom"
  },

  // callback when pinned, `this` is headroom object
  onPin : function() {
    window.isPinned = true;
    addClass(document.querySelector('.body'), 'is-pinned');
  },

  // callback when unpinned, `this` is headroom object
  onUnpin : function() {
    window.isPinned = false;
    removeClass(document.querySelector('.body'), 'is-pinned');
  },
});
// initialise
headroom.init();

window.onload = function () {
  window.windowWidth = window.innerWidth;
  toggleFixedClass();
  setWidth();
  isActive();
  document.querySelector('.nav-toggle').addEventListener('click', navClickEventHandler);
  document.querySelector('.search--icon').addEventListener('click', navClickEventHandler);
  document.querySelector('.logo').addEventListener('click', removeOpenClasses);
  window.addEventListener('resize', removeOpenClasses);
  window.addEventListener('scroll', toggleFixedClass);
  window.addEventListener('resize', toggleFixedClass);
  window.addEventListener('scroll', setWidth);
  window.addEventListener('resize', setWidth);
  window.addEventListener('scroll', isActive);
  window.addEventListener('resize', isActive);
}
