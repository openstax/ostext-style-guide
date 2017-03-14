'use strict';

function hasClass(el, className) {
  if (el.classList)
    return el.classList.contains(className)
  else
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

function addClass(el, className) {
  if (el.classList)
    el.classList.add(className)
  else if (!hasClass(el, className)) el.className += " " + className
}

function removeClass(el, className) {
  if (el.classList)
    el.classList.remove(className)
  else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
    el.className=el.className.replace(reg, ' ')
  }
}

var navClickEventHandler = function(event) {
    if (!hasClass(this, 'is-active')) {
      addClass(this, 'is-active');
      addClass(document.querySelector('.body'), 'is-active');
      addClass(document.body, 'fixed');
    } else {
      removeClass(document.body, 'fixed');
      removeClass(this, 'is-active');
      removeClass(document.querySelector('.body'), 'is-active');
    }
    event.stopPropagation();
}

var removeOpenClasses = function(event) {
  removeClass(document.body, 'fixed');
  removeClass(document.querySelector('.nav-toggle'), 'is-active');
  removeClass(document.querySelector('.body'), 'is-active');
}

window.onload = function () {
  document.querySelector('.nav-toggle').addEventListener('click', navClickEventHandler);
  window.addEventListener('resize', removeOpenClasses);
  document.querySelector('.side-nav').addEventListener('click', removeOpenClasses);
}
