'use strict';

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
    const floatingMenu = document.querySelector('.subsection');
    const body = document.body;
    const html = document.documentElement;
    const height = Math.max(body.scrollHeight, body.offsetHeight,
                   html.clientHeight, html.scrollHeight, html.offsetHeight);

    if (floatingMenu) {
        const footer = document.querySelector('.footer');
        const footerHeight = Math.max(footer.scrollHeight, footer.offsetHeight);
        const floatingMenuHeight = Math.max(floatingMenu.scrollHeight, floatingMenu.offsetHeight)+210;
        const menuOffset = height - footerHeight - floatingMenuHeight;
        const content = document.querySelector('.section>.columns');

        if (window.pageYOffset > getCoords(content).top) {
          addClass(floatingMenu, 'is-fixed');
        } else {
          removeClass(floatingMenu, 'is-fixed');
        }

        if ((window.pageYOffset > menuOffset)) {
            addClass(floatingMenu, 'is-bottom');
        } else {
          removeClass(floatingMenu, 'is-bottom');
        }
    }
}

export const isActive = () => {
  let content = document.getElementsByTagName('raw')[0];
  let headings = content.getElementsByTagName('h2');
  let subSection = document.querySelector('.menu.subsection');
  let menuItems = subSection.getElementsByTagName('a');

  if (headings != undefined) {
    for (var i=0; i < headings.length; i++ ) {
      let el = headings[i];
      let nextEl = headings[i+1];
      let link = menuItems[i];

      if (nextEl != undefined) {
        if ((window.pageYOffset > (getCoords(el).top - 21))  && (window.pageYOffset < getCoords(nextEl).top - 21)) {
          addClass(link, 'is-active');
        } else {
          removeClass(link, 'is-active');
        }
      } else {
        if ((window.pageYOffset > (getCoords(el).top - 21))) {
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
    } else {
      removeClass(document.body, 'fixed');
      removeClass(event.currentTarget, 'is-active');
      removeClass(document.querySelector('.body'), 'is-active');
    }
    event.stopPropagation();
}

export const removeOpenClasses = (event) => {
  removeClass(document.body, 'fixed');
  removeClass(document.querySelector('.nav-toggle'), 'is-active');
  removeClass(document.querySelector('.body'), 'is-active');
}

window.onload = function () {
  toggleFixedClass();
  setWidth();
  isActive();
  document.querySelector('.nav-toggle').addEventListener('click', navClickEventHandler);
  document.querySelector('.side-nav').addEventListener('click', removeOpenClasses);
  window.addEventListener('resize', removeOpenClasses);
  window.addEventListener('scroll', toggleFixedClass);
  window.addEventListener('resize', toggleFixedClass);
  window.addEventListener('scroll', setWidth);
  window.addEventListener('resize', setWidth);
  window.addEventListener('scroll', isActive);
  window.addEventListener('resize', isActive);
}
