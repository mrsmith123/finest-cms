// Utility function
function Util () {};

/* 
	class manipulation functions
*/
Util.hasClass = function(el, className) {
	if (el.classList) return el.classList.contains(className);
	else return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
};

Util.addClass = function(el, className) {
	var classList = className.split(' ');
 	if (el.classList) el.classList.add(classList[0]);
 	else if (!Util.hasClass(el, classList[0])) el.className += " " + classList[0];
 	if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
	var classList = className.split(' ');
	if (el.classList) el.classList.remove(classList[0]);	
	else if(Util.hasClass(el, classList[0])) {
		var reg = new RegExp('(\\s|^)' + classList[0] + '(\\s|$)');
		el.className=el.className.replace(reg, ' ');
	}
	if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
	if(bool) Util.addClass(el, className);
	else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

/* 
  DOM manipulation
*/
Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < el.children.length; i++) {
    if (Util.hasClass(el.children[i], className)) childrenByClass.push(el.children[i]);
  }
  return childrenByClass;
};

Util.is = function(elem, selector) {
  if(selector.nodeType){
    return elem === selector;
  }

  var qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector),
    length = qa.length,
    returnArr = [];

  while(length--){
    if(qa[length] === elem){
      return true;
    }
  }

  return false;
};

/* 
	Animate height of an element
*/
Util.setHeight = function(start, to, element, duration, cb) {
	var change = to - start,
	    currentTime = null;

  var animateHeight = function(timestamp){  
    if (!currentTime) currentTime = timestamp;         
    var progress = timestamp - currentTime;
    var val = parseInt((progress/duration)*change + start);
    element.style.height = val+"px";
    if(progress < duration) {
        window.requestAnimationFrame(animateHeight);
    } else {
    	cb();
    }
  };
  
  //set the height of the element before starting animation -> fix bug on Safari
  element.style.height = start+"px";
  window.requestAnimationFrame(animateHeight);
};

/* 
	Smooth Scroll
*/

Util.scrollTo = function(final, duration, cb, scrollEl) {
  var element = scrollEl || window;
  var start = element.scrollTop || document.documentElement.scrollTop,
    currentTime = null;

  if(!scrollEl) start = window.scrollY || document.documentElement.scrollTop;
      
  var animateScroll = function(timestamp){
  	if (!currentTime) currentTime = timestamp;        
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final-start, duration);
    element.scrollTo(0, val);
    if(progress < duration) {
        window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

/* 
  Focus utility classes
*/

//Move focus to an element
Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName("body")[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

/* 
  Misc
*/

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
  if('CSS' in window) {
    return CSS.supports(property, value);
  } else {
    var jsProperty = property.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase();});
    return jsProperty in document.body.style;
  }
};

// merge a set of user options into plugin defaults
// https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
Util.extend = function() {
  // Variables
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  // Check if a deep merge
  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  // Merge the object into the extended object
  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        // If deep merge and property is an object, merge properties
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// Check if Reduced Motion is enabled
Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; // return false if not supported
}; 

/* 
	Polyfills
*/
//Closest() method
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function(s) {
		var el = this;
		if (!document.documentElement.contains(el)) return null;
		do {
			if (el.matches(s)) return el;
			el = el.parentElement || el.parentNode;
		} while (el !== null && el.nodeType === 1); 
		return null;
	};
}

//Custom Event() constructor
if ( typeof window.CustomEvent !== "function" ) {

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
}

/* 
	Animation curves
*/
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

Math.easeInQuart = function (t, b, c, d) {
	t /= d;
	return c*t*t*t*t + b;
};

Math.easeOutQuart = function (t, b, c, d) { 
  t /= d;
	t--;
	return -c * (t*t*t*t - 1) + b;
};

Math.easeInOutQuart = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t*t + b;
	t -= 2;
	return -c/2 * (t*t*t*t - 2) + b;
};


/* JS Utility Classes */
(function() {
  // make focus ring visible only for keyboard navigation (i.e., tab key) 
  var focusTab = document.getElementsByClassName('js-tab-focus');
  function detectClick() {
    if(focusTab.length > 0) {
      resetFocusTabs(false);
      window.addEventListener('keydown', detectTab);
    }
    window.removeEventListener('mousedown', detectClick);
  };

  function detectTab(event) {
    if(event.keyCode !== 9) return;
    resetFocusTabs(true);
    window.removeEventListener('keydown', detectTab);
    window.addEventListener('mousedown', detectClick);
  };

  function resetFocusTabs(bool) {
    var outlineStyle = bool ? '' : 'none';
    for(var i = 0; i < focusTab.length; i++) {
      focusTab[i].style.setProperty('outline', outlineStyle);
    }
  };
  window.addEventListener('mousedown', detectClick);
}());
// File#: _1_adaptive-navigation
// Usage: codyhouse.co/license
(function() {
  var AdaptNav = function(element) {
    this.element = element;
    this.list = this.element.getElementsByClassName('js-adapt-nav__list')[0];
    this.items = this.element.getElementsByClassName('js-adapt-nav__item');
    this.moreBtn = this.element.getElementsByClassName('js-adapt-nav__item--more')[0];
    this.dropdown = this.moreBtn.getElementsByTagName('ul')[0];
    this.dropdownItems = this.dropdown.getElementsByTagName('a');
    this.dropdownClass = 'adapt-nav__dropdown--is-visible';
    this.resizing = false;
    // check if items already outrun nav
    this.outrunIndex = this.items.length;
    initAdaptNav(this);
  };

  function initAdaptNav(nav) {
    nav.resizing = true;
    resetAdaptNav.bind(nav)();

    // listen to resize
    window.addEventListener('resize', function(event){
      if(nav.resizing) return;
      nav.resizing = true;
      window.requestAnimationFrame(resetAdaptNav.bind(nav));
    });

    /* dropdown behaviour */
    // init aria-labels
		Util.setAttributes(nav.moreBtn, {'aria-expanded': 'false', 'aria-haspopup': 'true', 'aria-controls': nav.dropdown.getAttribute('id')});
    
    // toggle dropdown on click
    nav.moreBtn.addEventListener('click', function(event){
      if( nav.dropdown.contains(event.target) ) return;
			event.preventDefault();
			toggleMoreDropdown(nav, !Util.hasClass(nav.dropdown, nav.dropdownClass), true);
    });

    // keyboard events 
		nav.dropdown.addEventListener('keydown', function(event) {
			// use up/down arrow to navigate list of menu items
			if( (event.keyCode && event.keyCode == 40) || (event.key && event.key.toLowerCase() == 'arrowdown') ) {
				navigateItems(nav, event, 'next');
			} else if( (event.keyCode && event.keyCode == 38) || (event.key && event.key.toLowerCase() == 'arrowup') ) {
				navigateItems(nav, event, 'prev');
			}
    });

		window.addEventListener('keyup', function(event){
      if( event.keyCode && event.keyCode == 9 || event.key && event.key.toLowerCase() == 'tab' ) { //close dropdown if focus is outside dropdown element
				if (!nav.moreBtn.contains(document.activeElement)) toggleMoreDropdown(nav, false, false);
			} else if( event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape' ) {// close menu on 'Esc'
        toggleMoreDropdown(nav, false, false);
			} 
		});
    
    // close menu when clicking outside it
		window.addEventListener('click', function(event){
			if( !nav.moreBtn.contains(event.target)) toggleMoreDropdown(nav, false);
		});
  };

  function resetAdaptNav() { // reset nav appearance
    var totalWidth = getListWidth(this.list),
      moreWidth = getFullWidth(this.moreBtn),
      maxPosition = totalWidth - moreWidth,
      cloneList = '',
      hideAll = false;

    cloneList = resetOutrun(this, cloneList);
    // loop through items -> create clone (if required) and append to dropdown
    for(var i = 0; i < this.outrunIndex; i++) {
      if( Util.hasClass(this.items[i], 'is-hidden')) {
        Util.addClass(this.items[i], 'adapt-nav__item--hidden');
        Util.removeClass(this.items[i], 'is-hidden');
      }
      var right = this.items[i].offsetWidth + this.items[i].offsetLeft + parseFloat(window.getComputedStyle(this.items[i]).getPropertyValue("margin-right"));
      if(right >= maxPosition || hideAll) {
        var clone = this.items[i].cloneNode(true);
        Util.removeClass(clone, 'js-adapt-nav__item is-hidden adapt-nav__item--hidden');
        cloneList = cloneList + clone.outerHTML;
        Util.addClass(this.items[i], 'is-hidden');
        hideAll = true;
      } else {
        Util.removeClass(this.items[i], 'is-hidden');
      }
      Util.removeClass(this.items[i], 'adapt-nav__item--hidden');
    }

    Util.toggleClass(this.moreBtn, 'adapt-nav__item--hidden', (cloneList == ''));
    this.dropdown.innerHTML = cloneList;
    Util.addClass(this.element, 'adapt-nav--is-visible');
    this.outrunIndex = this.items.length;
    this.resizing = false;
  };

  function resetOutrun(nav, cloneList) {
    if(nav.items[0].offsetLeft < 0) {
      nav.outrunIndex = nav.outrunIndex - 1;
      var clone = nav.items[nav.outrunIndex].cloneNode(true);
      Util.removeClass(clone, 'js-adapt-nav__item is-hidden adapt-nav__item--hidden');
      Util.addClass(nav.items[nav.outrunIndex], 'is-hidden');
      cloneList = clone.outerHTML + cloneList;
      return resetOutrun(nav, cloneList);
    } else {
      return cloneList;
    }
  };

  function getListWidth(list) { // get total width of container minus right padding
    var style = window.getComputedStyle(list);
    return parseFloat(style.getPropertyValue("width")) - parseFloat(style.getPropertyValue("padding-right"));
  };

  function getFullWidth(item) { // get width of 'More Links' button
    return parseFloat(window.getComputedStyle(item).getPropertyValue("width"));
  };

  function toggleMoreDropdown(nav, bool, moveFocus) { // toggle menu visibility
		Util.toggleClass(nav.dropdown, nav.dropdownClass, bool);
		if(bool) {
			nav.moreBtn.setAttribute('aria-expanded', 'true');
			Util.moveFocus(nav.dropdownItems[0]);
			nav.dropdown.addEventListener("transitionend", function(event) {Util.moveFocus(nav.dropdownItems[0]);}, {once: true});
		} else {
			nav.moreBtn.setAttribute('aria-expanded', 'false');
			if(moveFocus) Util.moveFocus(nav.moreBtn.getElementsByTagName('button')[0]);
		}
  };

  function navigateItems(nav, event, direction) { // navigate through dropdown items
    event.preventDefault();
		var index = Util.getIndexInArray(nav.dropdownItems, event.target),
			nextIndex = direction == 'next' ? index + 1 : index - 1;
		if(nextIndex < 0) nextIndex = nav.dropdownItems.length - 1;
		if(nextIndex > nav.dropdownItems.length - 1) nextIndex = 0;
		Util.moveFocus(nav.dropdownItems[nextIndex]);
	};

  //initialize the AdaptNav objects
  var adaptNavs = document.getElementsByClassName('js-adapt-nav'),
    flexSupported = Util.cssSupports('align-items', 'stretch');
	if( adaptNavs.length > 0) {
		for( var i = 0; i < adaptNavs.length; i++) {(function(i){
      if(flexSupported) new AdaptNav(adaptNavs[i]);
      else Util.addClass(adaptNavs[i], 'adapt-nav--is-visible');
    })(i);}
	}
}());
// File#: _1_anim-menu-btn
// Usage: codyhouse.co/license
(function() {
  var menuBtns = document.getElementsByClassName('js-anim-menu-btn');
  if( menuBtns.length > 0 ) {
    for(var i = 0; i < menuBtns.length; i++) {(function(i){
      initMenuBtn(menuBtns[i]);
    })(i);}

    function initMenuBtn(btn) {
      btn.addEventListener('click', function(event){	
        event.preventDefault();
        var status = !Util.hasClass(btn, 'anim-menu-btn--state-b');
        Util.toggleClass(btn, 'anim-menu-btn--state-b', status);
        // emit custom event
        var event = new CustomEvent('anim-menu-btn-clicked', {detail: status});
        btn.dispatchEvent(event);
      });
    };
  }
}());
// File#: _1_swipe-content
(function() {
	var SwipeContent = function(element) {
		this.element = element;
		this.delta = [false, false];
		this.dragging = false;
		this.intervalId = false;
		initSwipeContent(this);
	};

	function initSwipeContent(content) {
		content.element.addEventListener('mousedown', handleEvent.bind(content));
		content.element.addEventListener('touchstart', handleEvent.bind(content));
	};

	function initDragging(content) {
		//add event listeners
		content.element.addEventListener('mousemove', handleEvent.bind(content));
		content.element.addEventListener('touchmove', handleEvent.bind(content));
		content.element.addEventListener('mouseup', handleEvent.bind(content));
		content.element.addEventListener('mouseleave', handleEvent.bind(content));
		content.element.addEventListener('touchend', handleEvent.bind(content));
	};

	function cancelDragging(content) {
		//remove event listeners
		if(content.intervalId) {
			(!window.requestAnimationFrame) ? clearInterval(content.intervalId) : window.cancelAnimationFrame(content.intervalId);
			content.intervalId = false;
		}
		content.element.removeEventListener('mousemove', handleEvent.bind(content));
		content.element.removeEventListener('touchmove', handleEvent.bind(content));
		content.element.removeEventListener('mouseup', handleEvent.bind(content));
		content.element.removeEventListener('mouseleave', handleEvent.bind(content));
		content.element.removeEventListener('touchend', handleEvent.bind(content));
	};

	function handleEvent(event) {
		switch(event.type) {
			case 'mousedown':
			case 'touchstart':
				startDrag(this, event);
				break;
			case 'mousemove':
			case 'touchmove':
				drag(this, event);
				break;
			case 'mouseup':
			case 'mouseleave':
			case 'touchend':
				endDrag(this, event);
				break;
		}
	};

	function startDrag(content, event) {
		content.dragging = true;
		// listen to drag movements
		initDragging(content);
		content.delta = [parseInt(unify(event).clientX), parseInt(unify(event).clientY)];
		// emit drag start event
		emitSwipeEvents(content, 'dragStart', content.delta, event.target);
	};

	function endDrag(content, event) {
		cancelDragging(content);
		// credits: https://css-tricks.com/simple-swipe-with-vanilla-javascript/
		var dx = parseInt(unify(event).clientX), 
	    dy = parseInt(unify(event).clientY);
	  
	  // check if there was a left/right swipe
		if(content.delta && (content.delta[0] || content.delta[0] === 0)) {
	    var s = getSign(dx - content.delta[0]);
			
			if(Math.abs(dx - content.delta[0]) > 30) {
				(s < 0) ? emitSwipeEvents(content, 'swipeLeft', [dx, dy]) : emitSwipeEvents(content, 'swipeRight', [dx, dy]);	
			}
	    
	    content.delta[0] = false;
	  }
		// check if there was a top/bottom swipe
	  if(content.delta && (content.delta[1] || content.delta[1] === 0)) {
	  	var y = getSign(dy - content.delta[1]);

	  	if(Math.abs(dy - content.delta[1]) > 30) {
	    	(y < 0) ? emitSwipeEvents(content, 'swipeUp', [dx, dy]) : emitSwipeEvents(content, 'swipeDown', [dx, dy]);
	    }

	    content.delta[1] = false;
	  }
		// emit drag end event
	  emitSwipeEvents(content, 'dragEnd', [dx, dy]);
	  content.dragging = false;
	};

	function drag(content, event) {
		if(!content.dragging) return;
		// emit dragging event with coordinates
		(!window.requestAnimationFrame) 
			? content.intervalId = setTimeout(function(){emitDrag.bind(content, event);}, 250) 
			: content.intervalId = window.requestAnimationFrame(emitDrag.bind(content, event));
	};

	function emitDrag(event) {
		emitSwipeEvents(this, 'dragging', [parseInt(unify(event).clientX), parseInt(unify(event).clientY)]);
	};

	function unify(event) { 
		// unify mouse and touch events
		return event.changedTouches ? event.changedTouches[0] : event; 
	};

	function emitSwipeEvents(content, eventName, detail, el) {
		var trigger = false;
		if(el) trigger = el;
		// emit event with coordinates
		var event = new CustomEvent(eventName, {detail: {x: detail[0], y: detail[1], origin: trigger}});
		content.element.dispatchEvent(event);
	};

	function getSign(x) {
		if(!Math.sign) {
			return ((x > 0) - (x < 0)) || +x;
		} else {
			return Math.sign(x);
		}
	};

	window.SwipeContent = SwipeContent;
	
	//initialize the SwipeContent objects
	var swipe = document.getElementsByClassName('js-swipe-content');
	if( swipe.length > 0 ) {
		for( var i = 0; i < swipe.length; i++) {
			(function(i){new SwipeContent(swipe[i]);})(i);
		}
	}
}());
// File#: _2_draggable-img-gallery
// Usage: codyhouse.co/license
(function() {
  var DragGallery = function(element) {
    this.element = element;
    this.list = this.element.getElementsByTagName('ul')[0];
    this.imgs = this.list.children;
    this.gestureHint = this.element.getElementsByClassName('drag-gallery__gesture-hint');// drag gesture hint
    this.galleryWidth = getGalleryWidth(this); 
    this.translate = 0; // store container translate value
    this.dragStart = false; // start dragging position
    // drag momentum option
    this.dragMStart = false;
    this.dragTimeMStart = false;
    this.dragTimeMEnd = false;
    this.dragMSpeed = false;
    this.dragAnimId = false;
    initDragGalleryEvents(this); 
  };

  function initDragGalleryEvents(gallery) {
    initDragging(gallery); // init dragging

    gallery.element.addEventListener('update-gallery-width', function(event){ // window resize
      gallery.galleryWidth = getGalleryWidth(gallery); 
      // reset translate value if not acceptable
      checkTranslateValue(gallery);
      setTranslate(gallery);
    });
     
    if(intersectionObsSupported) initOpacityAnim(gallery); // init image animation

    if(!reducedMotion && gallery.gestureHint.length > 0) initHintGesture(gallery); // init hint gesture element animation

    initKeyBoardNav(gallery);
  };

  function getGalleryWidth(gallery) {
    return gallery.list.scrollWidth - gallery.list.offsetWidth;
  };

  function initDragging(gallery) { // gallery drag
    new SwipeContent(gallery.element);
    gallery.element.addEventListener('dragStart', function(event){
      window.cancelAnimationFrame(gallery.dragAnimId);
      Util.addClass(gallery.element, 'drag-gallery--is-dragging'); 
      gallery.dragStart = event.detail.x;
      gallery.dragMStart = event.detail.x;
      gallery.dragTimeMStart = new Date().getTime();
      gallery.dragTimeMEnd = false;
      gallery.dragMSpeed = false;
      initDragEnd(gallery);
    });

    gallery.element.addEventListener('dragging', function(event){
      if(!gallery.dragStart) return;
      if(Math.abs(event.detail.x - gallery.dragStart) < 5) return;
      gallery.translate = Math.round(event.detail.x - gallery.dragStart + gallery.translate);
      gallery.dragStart = event.detail.x;
      checkTranslateValue(gallery);
      setTranslate(gallery);
    });
  };

  function initDragEnd(gallery) {
    gallery.element.addEventListener('dragEnd', function cb(event){
      gallery.element.removeEventListener('dragEnd', cb);
      Util.removeClass(gallery.element, 'drag-gallery--is-dragging');
      initMomentumDrag(gallery); // drag momentum
      gallery.dragStart = false;
    });
  };

  function initKeyBoardNav(gallery) {
    gallery.element.setAttribute('tabindex', 0);
    // navigate gallery using right/left arrows
    gallery.element.addEventListener('keyup', function(event){
      if( event.keyCode && event.keyCode == 39 || event.key && event.key.toLowerCase() == 'arrowright' ) {
        keyboardNav(gallery, 'right');
      } else if(event.keyCode && event.keyCode == 37 || event.key && event.key.toLowerCase() == 'arrowleft') {
        keyboardNav(gallery, 'left');
      }
    });
  };

  function keyboardNav(gallery, direction) {
    var delta = parseFloat(window.getComputedStyle(gallery.imgs[0]).marginRight) + gallery.imgs[0].offsetWidth;
    gallery.translate = (direction == 'right') ? gallery.translate - delta : gallery.translate + delta;
    checkTranslateValue(gallery);
    setTranslate(gallery);
  };

  function checkTranslateValue(gallery) { // make sure translate is in the right interval
    if(gallery.translate > 0) {
      gallery.translate = 0;
      gallery.dragMSpeed = 0;
    }
    if(Math.abs(gallery.translate) > gallery.galleryWidth) {
      gallery.translate = gallery.galleryWidth*-1;
      gallery.dragMSpeed = 0;
    }
  };

  function setTranslate(gallery) {
    gallery.list.style.transform = 'translateX('+gallery.translate+'px)';
    gallery.list.style.msTransform = 'translateX('+gallery.translate+'px)';
  };

  function initOpacityAnim(gallery) { // animate img opacities on drag
    for(var i = 0; i < gallery.imgs.length; i++) {
      var observer = new IntersectionObserver(opacityCallback.bind(gallery.imgs[i]), { threshold: [0, 0.1] });
		  observer.observe(gallery.imgs[i]);
    }
  };

  function opacityCallback(entries, observer) { // reveal images when they enter the viewport
    var threshold = entries[0].intersectionRatio.toFixed(1);
		if(threshold > 0) {
      Util.addClass(this, 'drag-gallery__item--visible');
      observer.unobserve(this);
    }
  };

  function initMomentumDrag(gallery) {
    // momentum effect when drag is over
    if(reducedMotion) return;
    var timeNow = new Date().getTime();
    gallery.dragMSpeed = 0.95*(gallery.dragStart - gallery.dragMStart)/(timeNow - gallery.dragTimeMStart);

    var currentTime = false;

    function animMomentumDrag(timestamp) {
      if (!currentTime) currentTime = timestamp;         
      var progress = timestamp - currentTime;
      currentTime = timestamp;
      if(Math.abs(gallery.dragMSpeed) < 0.01) {
        gallery.dragAnimId = false;
        return;
      } else {
        gallery.translate = Math.round(gallery.translate + (gallery.dragMSpeed*progress));
        checkTranslateValue(gallery);
        setTranslate(gallery);
        gallery.dragMSpeed = gallery.dragMSpeed*0.95;
        gallery.dragAnimId = window.requestAnimationFrame(animMomentumDrag);
      }
    };

    gallery.dragAnimId = window.requestAnimationFrame(animMomentumDrag);
  };

  function initHintGesture(gallery) { // show user a hint about gallery dragging
    var observer = new IntersectionObserver(hintGestureCallback.bind(gallery.gestureHint[0]), { threshold: [0, 1] });
		observer.observe(gallery.gestureHint[0]);
  };

  function hintGestureCallback(entries, observer) {
    var threshold = entries[0].intersectionRatio.toFixed(1);
		if(threshold > 0) {
      Util.addClass(this, 'drag-gallery__gesture-hint--animate');
      observer.unobserve(this);
    }
  };

  //initialize the DragGallery objects
  var dragGallery = document.getElementsByClassName('js-drag-gallery'),
    intersectionObsSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype),
    reducedMotion = Util.osHasReducedMotion();

  if( dragGallery.length > 0 ) {
    var dragGalleryArray = [];
    for( var i = 0; i < dragGallery.length; i++) {
      (function(i){ 
        if(!intersectionObsSupported || reducedMotion) Util.addClass(dragGallery[i], 'drag-gallery--anim-off');
        dragGalleryArray.push(new DragGallery(dragGallery[i]));
      })(i);
    }

    // resize event
    var resizingId = false,
      customEvent = new CustomEvent('update-gallery-width');
    
    window.addEventListener('resize', function() {
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 500);
    });

    function doneResizing() {
      for( var i = 0; i < dragGalleryArray.length; i++) {
        (function(i){dragGalleryArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };
  }
}());
// File#: _2_flexi-header
// Usage: codyhouse.co/license
(function() {
  var flexHeader = document.getElementsByClassName('js-f-header');
	if(flexHeader.length > 0) {
		var menuTrigger = flexHeader[0].getElementsByClassName('js-anim-menu-btn')[0],
			firstFocusableElement = getMenuFirstFocusable();

		// we'll use these to store the node that needs to receive focus when the mobile menu is closed 
		var focusMenu = false;

		menuTrigger.addEventListener('anim-menu-btn-clicked', function(event){ // toggle menu visibility an small devices
			Util.toggleClass(document.getElementsByClassName('f-header__nav')[0], 'f-header__nav--is-visible', event.detail);
			menuTrigger.setAttribute('aria-expanded', event.detail);
			if(event.detail) firstFocusableElement.focus(); // move focus to first focusable element
			else if(focusMenu) {
				focusMenu.focus();
				focusMenu = false;
			}
		});

		// listen for key events
		window.addEventListener('keyup', function(event){
			// listen for esc key
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
				// close navigation on mobile if open
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger)) {
					focusMenu = menuTrigger; // move focus to menu trigger when menu is close
					menuTrigger.click();
				}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
				// close navigation on mobile if open when nav loses focus
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger) && !document.activeElement.closest('.js-f-header')) menuTrigger.click();
			}
		});

		function getMenuFirstFocusable() {
			var focusableEle = flexHeader[0].getElementsByClassName('f-header__nav')[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
				firstFocusable = false;
			for(var i = 0; i < focusableEle.length; i++) {
				if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
					firstFocusable = focusableEle[i];
					break;
				}
			}

			return firstFocusable;
    };
    
    function isVisible(element) {
      return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    };
	}
}());
// File#: _2_hiding-nav
// Usage: codyhouse.co/license
(function() {
  var hidingNav = document.getElementsByClassName('js-hide-nav');
  if(hidingNav.length > 0 && window.requestAnimationFrame) {
    var mainNav = Array.prototype.filter.call(hidingNav, function(element) {
      return Util.hasClass(element, 'js-hide-nav--main');
    }),
    subNav = Array.prototype.filter.call(hidingNav, function(element) {
      return Util.hasClass(element, 'js-hide-nav--sub');
    });
    
    var scrolling = false,
      previousTop = window.scrollY,
      currentTop = window.scrollY,
      scrollDelta = 10,
      scrollOffset = 150, // scrollY needs to be bigger than scrollOffset to hide navigation
      headerHeight = 0; 

    var navIsFixed = false; // check if main navigation is fixed
    if(mainNav.length > 0 && Util.hasClass(mainNav[0], 'hide-nav--fixed')) navIsFixed = true;

    // store button that triggers navigation on mobile
    var triggerMobile = getTriggerMobileMenu();
    
    // init navigation and listen to window scroll event
    initSecondaryNav();
    resetHideNav();
    window.addEventListener('scroll', function(event){
      if(scrolling) return;
      scrolling = true;
      window.requestAnimationFrame(resetHideNav);
    });

    window.addEventListener('resize', function(event){
      if(scrolling) return;
      scrolling = true;
      window.requestAnimationFrame(function(){
        if(headerHeight > 0 && subNav.length > 0) {
          headerHeight = mainNav[0].offsetHeight;
          subNav[0].style.top = headerHeight+'px';
        }
        // reset both navigation
        hideNavScrollUp();

        scrolling = false;
      });
    });

    function initSecondaryNav() { // if there's a secondary nav, set its top equal to the header height
      if(subNav.length < 1 || mainNav.length < 1) return;
      headerHeight = mainNav[0].offsetHeight;
      subNav[0].style.top = headerHeight+'px';
    };

    function resetHideNav() { // check if navs need to be hidden/revealed
      currentTop = window.scrollY;
      if(currentTop - previousTop > scrollDelta && currentTop > scrollOffset) {
        hideNavScrollDown();
      } else if( previousTop - currentTop > scrollDelta || (previousTop - currentTop > 0 && currentTop < scrollOffset) ) {
        hideNavScrollUp();
      } else if( previousTop - currentTop > 0 && subNav.length > 0 && subNav[0].getBoundingClientRect().top > 0) {
        setTranslate(subNav[0], '0%');
      }
      // if primary nav is fixed -> toggle bg class
      if(navIsFixed) {
        var scrollTop = window.scrollY || window.pageYOffset;
        Util.toggleClass(mainNav[0], 'hide-nav--has-bg', (scrollTop > headerHeight));
      }
      previousTop = currentTop;
      scrolling = false;
    };

    function hideNavScrollDown() {
      // if there's a secondary nav -> it has to reach the top before hiding nav
      if( subNav.length  > 0 && subNav[0].getBoundingClientRect().top > headerHeight) return;
      // on mobile -> hide navigation only if dropdown is not open
      if(triggerMobile && triggerMobile.getAttribute('aria-expanded') == "true") return;
      if( mainNav.length > 0 ) {
        setTranslate(mainNav[0], '-100%'); 
        mainNav[0].addEventListener('transitionend', addOffCanvasClass);

      }
      if( subNav.length  > 0 ) setTranslate(subNav[0], '-'+headerHeight+'px');
    };

    function hideNavScrollUp() {
      if( mainNav.length > 0 ) {setTranslate(mainNav[0], '0%'); Util.removeClass(mainNav[0], 'hide-nav--off-canvas');mainNav[0].removeEventListener('transitionend', addOffCanvasClass);}
      if( subNav.length  > 0 ) setTranslate(subNav[0], '0%');
    };

    function addOffCanvasClass() {
      mainNav[0].removeEventListener('transitionend', addOffCanvasClass);
      Util.addClass(mainNav[0], 'hide-nav--off-canvas');
    };

    function setTranslate(element, val) {
      element.style.transform = 'translateY('+val+')';
    };

    function getTriggerMobileMenu() {
      // store trigger that toggle mobile navigation dropdown
      var triggerMobileClass = hidingNav[0].getAttribute('data-mobile-trigger');
      if(!triggerMobileClass) return false;
      var trigger = hidingNav[0].getElementsByClassName(triggerMobileClass);
      if(trigger.length > 0) return trigger[0];
      return false;
    };
    
  } else {
    // if window requestAnimationFrame is not supported -> add bg class to fixed header
    var mainNav = document.getElementsByClassName('js-hide-nav--main');
    if(mainNav.length < 1) return;
    if(Util.hasClass(mainNav[0], 'hide-nav--fixed')) Util.addClass(mainNav[0], 'hide-nav--has-bg');
  }
}());
// File#: _2_hiding-nav
// Usage: codyhouse.co/license
(function() {
  var hidingNav = document.getElementsByClassName('js-hide-nav');
  if(hidingNav.length > 0 && window.requestAnimationFrame) {
    var mainNav = Array.prototype.filter.call(hidingNav, function(element) {
      return Util.hasClass(element, 'js-hide-nav--main');
    }),
    subNav = Array.prototype.filter.call(hidingNav, function(element) {
      return Util.hasClass(element, 'js-hide-nav--sub');
    });
    
    var scrolling = false,
      previousTop = window.scrollY,
      currentTop = window.scrollY,
      scrollDelta = 10,
      scrollOffset = 150, // scrollY needs to be bigger than scrollOffset to hide navigation
      headerHeight = 0; 

    var navIsFixed = false; // check if main navigation is fixed
    if(mainNav.length > 0 && Util.hasClass(mainNav[0], 'hide-nav--fixed')) navIsFixed = true;

    // store button that triggers navigation on mobile
    var triggerMobile = getTriggerMobileMenu();
    
    // init navigation and listen to window scroll event
    initSecondaryNav();
    resetHideNav();
    window.addEventListener('scroll', function(event){
      if(scrolling) return;
      scrolling = true;
      window.requestAnimationFrame(resetHideNav);
    });

    window.addEventListener('resize', function(event){
      if(scrolling) return;
      scrolling = true;
      window.requestAnimationFrame(function(){
        if(headerHeight > 0 && subNav.length > 0) {
          headerHeight = mainNav[0].offsetHeight;
          subNav[0].style.top = headerHeight+'px';
        }
        // reset both navigation
        hideNavScrollUp();

        scrolling = false;
      });
    });

    function initSecondaryNav() { // if there's a secondary nav, set its top equal to the header height
      if(subNav.length < 1 || mainNav.length < 1) return;
      headerHeight = mainNav[0].offsetHeight;
      subNav[0].style.top = headerHeight+'px';
    };

    function resetHideNav() { // check if navs need to be hidden/revealed
      currentTop = window.scrollY;
      if(currentTop - previousTop > scrollDelta && currentTop > scrollOffset) {
        hideNavScrollDown();
      } else if( previousTop - currentTop > scrollDelta || (previousTop - currentTop > 0 && currentTop < scrollOffset) ) {
        hideNavScrollUp();
      } else if( previousTop - currentTop > 0 && subNav.length > 0 && subNav[0].getBoundingClientRect().top > 0) {
        setTranslate(subNav[0], '0%');
      }
      // if primary nav is fixed -> toggle bg class
      if(navIsFixed) {
        var scrollTop = window.scrollY || window.pageYOffset;
        Util.toggleClass(mainNav[0], 'hide-nav--has-bg', (scrollTop > headerHeight));
      }
      previousTop = currentTop;
      scrolling = false;
    };

    function hideNavScrollDown() {
      // if there's a secondary nav -> it has to reach the top before hiding nav
      if( subNav.length  > 0 && subNav[0].getBoundingClientRect().top > headerHeight) return;
      // on mobile -> hide navigation only if dropdown is not open
      if(triggerMobile && triggerMobile.getAttribute('aria-expanded') == "true") return;
      if( mainNav.length > 0 ) {
        setTranslate(mainNav[0], '-100%'); 
        mainNav[0].addEventListener('transitionend', addOffCanvasClass);

      }
      if( subNav.length  > 0 ) setTranslate(subNav[0], '-'+headerHeight+'px');
    };

    function hideNavScrollUp() {
      if( mainNav.length > 0 ) {setTranslate(mainNav[0], '0%'); Util.removeClass(mainNav[0], 'hide-nav--off-canvas');mainNav[0].removeEventListener('transitionend', addOffCanvasClass);}
      if( subNav.length  > 0 ) setTranslate(subNav[0], '0%');
    };

    function addOffCanvasClass() {
      mainNav[0].removeEventListener('transitionend', addOffCanvasClass);
      Util.addClass(mainNav[0], 'hide-nav--off-canvas');
    };

    function setTranslate(element, val) {
      element.style.transform = 'translateY('+val+')';
    };

    function getTriggerMobileMenu() {
      // store trigger that toggle mobile navigation dropdown
      var triggerMobileClass = hidingNav[0].getAttribute('data-mobile-trigger');
      if(!triggerMobileClass) return false;
      var trigger = hidingNav[0].getElementsByClassName(triggerMobileClass);
      if(trigger.length > 0) return trigger[0];
      return false;
    };
    
  } else {
    // if window requestAnimationFrame is not supported -> add bg class to fixed header
    var mainNav = document.getElementsByClassName('js-hide-nav--main');
    if(mainNav.length < 1) return;
    if(Util.hasClass(mainNav[0], 'hide-nav--fixed')) Util.addClass(mainNav[0], 'hide-nav--has-bg');
  }
}());