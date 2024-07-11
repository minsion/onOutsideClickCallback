import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import ReactDOM from 'react-dom';
import './Tooltip.css'

/****** helpers ******/
function createWrapperAndAppendToBody(wrapper, wrapperElementId) {
  const wrapperElement = document.createElement(wrapper);
  wrapperElement.setAttribute('id', wrapperElementId);
  document.body.appendChild(wrapperElement);
  return wrapperElement;
}

// get {top, left} of the required element
function getElementOffset(el) {
  let _x = 0,
    _y = 0;
  while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
    _x += el.offsetLeft - el.scrollLeft;
    _y += el.offsetTop - el.scrollTop;
    el = el.offsetParent;
  }
  return { top: _y, left: _x };
}

const regex = /(auto|scroll)/;

const style = (node, prop) => getComputedStyle(node, null).getPropertyValue(prop);

const scroll = (node) =>
  regex.test(style(node, 'overflow') + style(node, 'overflow-y') + style(node, 'overflow-x'));

// get the first scrollable parent
const getScrollParent = (node) =>
  !node || node === document.body
    ? document.body
    : scroll(node)
    ? node
    : getScrollParent(node.parentNode);

/****** custom hooks ******/
const useTouchScreenDetect = () => {
  const isSSR = typeof window === 'undefined',
    [isTouchScreen, setIsTouchScreen] = useState(false);

  useEffect(() => {
    if (!isSSR) {
      setIsTouchScreen('ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0);
    }
  }, [isTouchScreen, isSSR]);

  return isTouchScreen;
};

const useClickAway = (ref, onOutsideClickCallback) => {
  const handleClick = (e) => {
    if (ref.current && !ref.current.contains(e.target)) {
      onOutsideClickCallback(e);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  });
};

/****** components ******/
const ConditionalWrapper = ({ initialWrapper, condition, wrapper, children }) =>
  condition ? wrapper(children) : initialWrapper(children);

const ClickAwayWrapper = ({ children, onClickAwayCallback, className }) => {
  const wrapperRef = useRef(null);
  useClickAway(wrapperRef, onClickAwayCallback);

  return (
    <span className={className} ref={wrapperRef}>
      {children}
    </span>
  );
};

//create portal component
const Portal = ({ children, wrapperElement, wrapperElementId, show }) => {
  const [wrapper, setWrapper] = useState(null);
  useEffect(() => {
    let element = document.getElementById(wrapperElementId);
    // if element is not found with wrapperElementId or wrapperElementId is not provided,
    // create and append to body
    if (!element && show) {
      element = createWrapperAndAppendToBody(wrapperElement, wrapperElementId);
    }
    setWrapper(element);
    return () => {
      if (element && show) {
        element.remove()
      }
    }
  }, [wrapperElementId, wrapperElement, show]);

  // wrapper state will be null on the first render.
  if (wrapper === null) return null;

  return ReactDOM.createPortal(children, wrapper);
};

// Tooltip component
export const SuperTooltip = ({
  tooltipContent,
  position = 'top',
  color,
  backgroundColor,
  disabled,
  isParentFixed,
  customPosition,
  isDisplayTooltipIndicator = true,
  trigger = 'hover',
  className = '',
  icon,
  children,
}) => {
  const isHasTouch = useTouchScreenDetect(),
    [show, setShow] = useState(false),
    [styles, setStyles] = useState({}),
    tooltipWrapperRef = useRef(null),
    tooltipMessage = useRef(null),
    newPosition = useRef(position),
    space = 15,
    [childrenWidth, setChildrenWidth] = useState(undefined),
    [childrenHeight, setChildrenHeight] = useState(undefined),
    [isTooltipVisible, setIsTooltipVisible] = useState(false),
    [wrapperParentUpdated, setWrapperParentUpdated] = useState({
      top: 0,
      left: 0,
    }),
    availableTooltipPositions = useMemo(
      () => ({
        top: 'top',
        right: 'right',
        bottom: 'bottom',
        left: 'left',
      }),
      []
    ),
    isHoverTrigger = useMemo(() => trigger === 'hover', [trigger]),
    isClickTrigger = useMemo(() => trigger === 'click', [trigger]);

  //set children width and height
  useEffect(() => {
    if (show && childrenWidth === undefined && childrenHeight === undefined) {
      setChildrenHeight(tooltipMessage.current?.offsetHeight);
      setChildrenWidth(tooltipMessage.current?.offsetWidth);
    }
  }, [show, childrenWidth, childrenHeight]);

  //update tooltip visibility
  useEffect(() => {
    if (show && !isTooltipVisible && childrenWidth !== undefined && childrenHeight !== undefined) {
      setIsTooltipVisible(true);
    }
  }, [show, isTooltipVisible, childrenWidth, childrenHeight]);

  const showTooltip = () => {
    if (!show) {
      setShow(true);
      setStyles(getStylesList());
    }
  };

  const hideTooltip = () => {
    setShow(false);
  };

  const getStylesList = useCallback(() => {
    if (tooltipWrapperRef.current) {
      const wrapperRect = tooltipWrapperRef.current.getBoundingClientRect(),
        wrapperRef = tooltipWrapperRef.current,
        scrollableParent = getScrollParent(wrapperRef),
        style = {
          left: 0,
          top: 0,
        },
        centeredHorizontalPosition = Math.max(space, wrapperRect.left + wrapperRect.width / 2),
        centeredVerticalPosition =
          getElementOffset(tooltipWrapperRef.current).top + wrapperRect.height / 2;

      let pos = position;
      //if position is top and no room for tooltip => change position to bottom
      if (
        position === availableTooltipPositions.top &&
        wrapperRect.top < (childrenHeight || 0) + space
      ) {
        pos = availableTooltipPositions.bottom;
      }
      //if position is right and no room for tooltip => change position to left
      else if (
        position === availableTooltipPositions.right &&
        wrapperRect.right + ((childrenWidth || 0) + space * 1.5) > window.innerWidth
      ) {
        pos = availableTooltipPositions.left;
      }
      //if position is bottom and no room for tooltip => change position to top
      else if (
        position === availableTooltipPositions.bottom &&
        wrapperRect.bottom + (childrenHeight || 0) + space > window.innerHeight
      ) {
        pos = availableTooltipPositions.top;
      }
      //if position is left and no room for tooltip => change position to right
      else if (
        position === availableTooltipPositions.left &&
        wrapperRect.left - ((childrenWidth || 0) + space * 1.5) < 0
      ) {
        pos = availableTooltipPositions.right;
      }

      newPosition.current = pos;

      if (pos === availableTooltipPositions.top) {
        style.top = Math.max(
          space,
          getElementOffset(tooltipWrapperRef.current).top -
            (childrenHeight || 0) -
            (isDisplayTooltipIndicator ? space : space / 2)
        );
        style.left = centeredHorizontalPosition;
      } else if (pos === availableTooltipPositions.right) {
        style.top = centeredVerticalPosition;
        style.left = Math.max(space, wrapperRect.right + space);
      } else if (pos === availableTooltipPositions.bottom) {
        style.top =
          getElementOffset(tooltipWrapperRef.current).top +
          wrapperRect.height +
          (isDisplayTooltipIndicator ? space : space / 2);
        style.left = centeredHorizontalPosition;
      } else if (pos === availableTooltipPositions.left) {
        style.top = centeredVerticalPosition;
        style.left = Math.max(space, wrapperRect.left - ((childrenWidth || 0) + space));
      }
      if (!isParentFixed && scrollableParent && wrapperParentUpdated) {
        style.top -= scrollableParent.scrollTop;
      }
      return style;
    }
    return {
      top: 0,
      left: 0,
    };
  }, [
    position,
    isParentFixed,
    childrenWidth,
    childrenHeight,
    wrapperParentUpdated,
    isDisplayTooltipIndicator,
    availableTooltipPositions,
  ]);

  useEffect(() => {
    //required for the first render and on scroll
    if (getStylesList().top !== styles.top || getStylesList().left !== styles.left) {
      setStyles(getStylesList());
    }
  }, [getStylesList, styles.left, styles.top]);

  const updateScrollableParentScroll = ({ target: { scrollTop, scrollLeft } }) => {
    setWrapperParentUpdated({
      top: scrollTop,
      left: scrollLeft,
    });
  };

  useEffect(() => {
    if (tooltipWrapperRef.current) {
      const wrapperRef = tooltipWrapperRef.current,
        scrollableParent = getScrollParent(wrapperRef);

      window.addEventListener('resize', updateScrollableParentScroll);
      scrollableParent.addEventListener('scroll', updateScrollableParentScroll);

      return () => {
        window.removeEventListener('resize', updateScrollableParentScroll);
        scrollableParent.removeEventListener('scroll', updateScrollableParentScroll);
      };
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (show && isClickTrigger) {
        setShow(false);
      }
    };

    if (tooltipWrapperRef.current) {
      const wrapperRef = tooltipWrapperRef.current,
        scrollableParent = getScrollParent(wrapperRef),
        newScrollableParent = scrollableParent === document.body ? window : scrollableParent;

      newScrollableParent.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);

      return () => {
        newScrollableParent.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [show, isClickTrigger]);

  return (
    <ConditionalWrapper
      condition={isClickTrigger}
      initialWrapper={(children) => <>{children}</>}
      wrapper={(children) => (
        <ClickAwayWrapper onClickAwayCallback={hideTooltip}>{children}</ClickAwayWrapper>
      )}
    >
      <span
        className={`tooltip ${disabled ? 'is-disabled' : ''}`}
        onMouseEnter={
          isHoverTrigger ? (disabled ? undefined : isHasTouch ? undefined : showTooltip) : undefined
        }
        onMouseLeave={
          isHoverTrigger ? (disabled ? undefined : isHasTouch ? undefined : hideTooltip) : undefined
        }
        onTouchStart={
          isHoverTrigger ? (disabled ? undefined : isHasTouch ? showTooltip : undefined) : undefined
        }
        onTouchEnd={
          isHoverTrigger ? (disabled ? undefined : isHasTouch ? hideTooltip : undefined) : undefined
        }
        onClick={isClickTrigger ? (disabled ? undefined : showTooltip) : undefined}
        ref={tooltipWrapperRef}
      >
        <Portal wrapperElement="span" wrapperElementId="tooltip" show={show}>
          {show && tooltipContent && (<span
              ref={tooltipMessage}
              className={`tooltip-message 
              ${className}
 on-${newPosition.current} ${isDisplayTooltipIndicator ? 'is-indicator' : ''}`}
              dangerouslySetInnerHTML={{ __html: tooltipContent }}
              style={{
                color: color ? color : '#ffffff',
                '--background-color': backgroundColor ? backgroundColor : 'rgba(97, 97, 97, 0.92)',
                ...(customPosition ? customPosition : styles),
                ...(newPosition.current === availableTooltipPositions.left ||
                newPosition.current === availableTooltipPositions.top
                  ? { visibility: isTooltipVisible ? 'visible' : 'hidden' }
                  : {}),
              }}
            />)}
        </Portal>
        {children}
      </span>
    </ConditionalWrapper>
  );
};

