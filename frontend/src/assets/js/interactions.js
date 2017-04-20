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
        const floatingMenuBottom = window.pageYOffset + (floatingMenuHeight-208);

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
    if (hasClass(sideNav, 'is-fixed') && !(hasClass(sideNav, 'is-bottom'))) {
      sideNav.setAttribute('style', `width:${sideNav.parentNode.offsetWidth - 24}px;`);
    }
  }
}

export const navClickEventHandler = (event) => {
    if (!hasClass(event.currentTarget, 'is-active')) {
      addClass(event.currentTarget, 'is-active');
      addClass(document.querySelector('.body'), 'is-active');
      addClass(document.body, 'fixed');
      document.querySelector('.main').addEventListener('click', removeOpenClasses);
    } else {
      removeClass(document.body, 'fixed');
      removeClass(event.currentTarget, 'is-active');
      removeClass(document.querySelector('.body'), 'is-active');
      document.querySelector('.main').removeEventListener('click', removeOpenClasses);
    }
    event.stopPropagation();
}

export const removeOpenClasses = (event) => {
  removeClass(document.body, 'fixed');
  removeClass(document.querySelector('.nav-toggle'), 'is-active');
  removeClass(document.querySelector('.body'), 'is-active');
  document.querySelector('.main').removeEventListener('click', removeOpenClasses);
}

let myElement = document.querySelector("header");

// construct an instance of Headroom, passing the element
let headroom  = new Headroom(myElement, {
  offset: 80,
  tolerance : {
    up : 10,
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
  toggleFixedClass();
  setWidth();
  isActive();
  document.querySelector('.nav-toggle').addEventListener('click', navClickEventHandler);
  document.querySelector('.logo').addEventListener('click', removeOpenClasses);
  window.addEventListener('resize', removeOpenClasses);
  window.addEventListener('scroll', toggleFixedClass);
  window.addEventListener('resize', toggleFixedClass);
  window.addEventListener('scroll', setWidth);
  window.addEventListener('resize', setWidth);
  window.addEventListener('scroll', isActive);
  window.addEventListener('resize', isActive);
}
