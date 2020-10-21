import {
  KeyboardEvent,
  MouseEventHandler,
  TouchEventHandler,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { applyRef, getPercentage, nearest } from "@react-md/utils";

import {
  DEFAULT_SLIDER_MAX,
  DEFAULT_SLIDER_MIN,
  DEFAULT_SLIDER_STEP,
} from "./constants";
import {
  SliderAction,
  SliderDefaultValue,
  SliderDragAction,
  SliderState,
  UseSliderOptions,
  UseSliderReturnValue,
} from "./types";

// this is the amount of time (in ms) since the last increment or decrement
// keydown event
const KEYBOARD_DRAG_THRESHOLD = 100;

function handleDrag({
  min,
  max,
  step,
  vertical,
  reversed,
  clientX,
  clientY,
  top,
  height,
  left,
  width,
  eventType,
}: SliderDragAction): SliderState {
  const range = max - min;
  const steps = Math.abs(range / step);
  const sliderSize = vertical ? height : width;
  const sliderPosition = vertical ? top : left;
  const cursorPosition = vertical ? clientY : clientX;

  const distanceDragged = Math.min(
    Math.max(0, cursorPosition - sliderPosition),
    sliderSize
  );
  const percentageDragged = distanceDragged / sliderSize;
  const value = percentageDragged * range + min;
  const rounded = nearest(value, min, max, steps);

  return {
    dragging: eventType !== "mousedown" && eventType !== "touchstart",
    dragType: eventType.includes("mouse") ? "mouse" : "touch",
    // when dragging vertically or horizontally when the language is
    // RTL instead of LTR, need to inverse the value for it to work
    value: reversed ? 100 - rounded : rounded,
  };
}

function reducer(state: SliderState, action: SliderAction): SliderState {
  const { value, dragType } = state;
  switch (action.type) {
    case "increment": {
      const { min, max, step, dragging } = action;
      return {
        dragging,
        dragType,
        value: Math.max(min, Math.min(max, value + step)),
      };
    }
    case "decrement": {
      const { min, max, step, dragging } = action;
      return {
        dragging,
        dragType,
        value: Math.max(min, Math.min(max, value - step)),
      };
    }
    case "minimum":
      return {
        dragging: false,
        dragType,
        value: action.min,
      };
    case "maximum":
      return {
        dragging: false,
        dragType,
        value: action.max,
      };
    case "stop":
      return {
        value,
        dragType: null,
        dragging: false,
      };
    case "setValue":
      if (value === action.value) {
        return state;
      }

      return {
        ...state,
        value: action.value,
      };
    case "drag":
      return handleDrag(action);
    default:
      throw new Error("invalid slider action type");
  }
}

const isMouseEvent = (
  event: MouseEvent | TouchEvent
): event is MouseEvent & { type: "mousedown" | "mousemove" | "mouseup" } =>
  event.type === "mousedown" ||
  event.type === "mousemove" ||
  event.type === "mouseup";

const isTouchEvent = (
  event: MouseEvent | TouchEvent
): event is TouchEvent & { type: "touchstart" | "touchmove" | "touchend" } =>
  event.type === "touchstart" ||
  event.type === "touchmove" ||
  event.type === "touchend";

const initialState: SliderState = {
  dragging: false,
  dragType: null,
  value: 0,
};

const getInitialState = (
  defaultValue: SliderDefaultValue
) => (): SliderState => {
  const value =
    typeof defaultValue === "function" ? defaultValue() : defaultValue;

  return {
    ...initialState,
    value,
  };
};

/**
 * A hook that controls the `value` for the `Slider` component.
 */
export function useSlider({
  ref: propRef,
  min = DEFAULT_SLIDER_MIN,
  max = DEFAULT_SLIDER_MAX,
  step = DEFAULT_SLIDER_STEP,
  vertical = false,
  disabled = false,
  defaultValue = min,
  onKeyUp,
  onKeyDown,
  onMouseDown,
  onTouchStart,
}: UseSliderOptions = {}): UseSliderReturnValue {
  const ref = useRef<HTMLDivElement | null>(null);
  const refHandler = useCallback(
    (instance: HTMLDivElement | null) => {
      applyRef(instance, propRef);
      ref.current = instance;
    },
    [propRef]
  );

  const [state, dispatch] = useReducer<typeof reducer, SliderState>(
    reducer,
    initialState,
    getInitialState(defaultValue)
  );
  const { dragType, dragging, value } = state;
  if (process.env.NODE_ENV !== "production") {
    // to handle and max validation
    getPercentage(min, max, value);

    if ((max - min) % step !== 0) {
      throw new RangeError(
        "A slider's step must be divisible by the min and max range values"
      );
    }
  }

  const increment = useCallback(
    (dragging = false) =>
      dispatch({ type: "increment", min, max, step, dragging }),
    [min, max, step]
  );
  const decrement = useCallback(
    (dragging = false) =>
      dispatch({ type: "decrement", min, max, step, dragging }),
    [min, max, step]
  );
  const minimum = useCallback(() => dispatch({ type: "minimum", min }), [min]);
  const maximum = useCallback(() => dispatch({ type: "maximum", max }), [max]);
  const drag = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const slider = ref.current;
      if (
        !slider ||
        event.altKey ||
        event.shiftKey ||
        event.ctrlKey ||
        event.metaKey ||
        (!isTouchEvent(event) && !isMouseEvent(event)) ||
        (isMouseEvent(event) && event.button !== 0)
      ) {
        return;
      }

      // prevent text from being highlighted while dragging the slider
      event.preventDefault();
      event.stopPropagation();

      let clientX: number;
      let clientY: number;
      if (isMouseEvent(event)) {
        ({ clientX, clientY } = event);
      } else {
        const touch = event.changedTouches[0];
        ({ clientX, clientY } = touch);
      }

      const { left, top, height, width } = slider.getBoundingClientRect();
      let reversed = vertical;
      if (!vertical) {
        const closestDir = slider.closest("[dir]");
        if (closestDir) {
          reversed = closestDir.getAttribute("dir") === "rtl";
        }
      }

      dispatch({
        type: "drag",
        min,
        max,
        step,
        vertical,
        clientX,
        clientY,
        left,
        top,
        height,
        width,
        reversed,
        eventType: event.type,
      });
    },
    [min, max, step, vertical]
  );
  const stop = useCallback(() => dispatch({ type: "stop" }), []);
  const setValue = useCallback((value: number) => {
    dispatch({ type: "setValue", value });
  }, []);

  useEffect(() => {
    if (dragType === null) {
      return;
    }

    if (dragType === "mouse") {
      window.addEventListener("mousemove", drag);
      window.addEventListener("mouseup", stop);
    } else {
      window.addEventListener("touchmove", drag);
      window.addEventListener("touchend", stop);
    }

    return () => {
      if (dragType === "mouse") {
        window.removeEventListener("mousemove", drag);
        window.removeEventListener("mouseup", stop);
      } else {
        window.removeEventListener("touchmove", drag);
        window.removeEventListener("touchend", stop);
      }
    };
  }, [dragType, drag, stop]);

  const handleMouseDown = useCallback<MouseEventHandler<HTMLSpanElement>>(
    (event) => {
      if (onMouseDown) {
        onMouseDown(event);
      }

      if (disabled) {
        return;
      }

      drag(event.nativeEvent);
    },
    [drag, onMouseDown, disabled]
  );
  const handleTouchStart = useCallback<TouchEventHandler<HTMLSpanElement>>(
    (event) => {
      if (onTouchStart) {
        onTouchStart(event);
      }

      if (disabled) {
        return;
      }

      drag(event.nativeEvent);
    },
    [drag, onTouchStart, disabled]
  );

  const lastKeyDown = useRef<number>(-1);
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLSpanElement>) => {
      if (onKeyDown) {
        onKeyDown(event);
      }

      if (disabled) {
        return;
      }

      const { key, metaKey, altKey, shiftKey, ctrlKey } = event;
      const isIncrement = key === "ArrowUp" || key === "ArrowRight";
      const isDecrement = key === "ArrowDown" || key === "ArrowLeft";
      const isMinimum = key === "Home";
      const isMaximum = key === "End";
      if (
        metaKey ||
        altKey ||
        shiftKey ||
        ctrlKey ||
        (!isIncrement && !isDecrement && !isMinimum && !isMaximum)
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      if (isMinimum) {
        return minimum();
      }
      if (isMaximum) {
        return maximum();
      }

      const now = Date.now();
      // this is used to help mimic the drag behavior with mouse and touch so
      // that the value is updated immediately instead of needing to wait for
      // the smoothing value transition that is enabled by default. if the
      // keyboard user is holding the arrow keys, it won't really look like
      // anything is happening/delayed until they release the key since each
      // time the `value` changes, the value will only reach the new
      // destination/value after `.15s`
      const dragging =
        lastKeyDown.current !== -1 &&
        now - lastKeyDown.current < KEYBOARD_DRAG_THRESHOLD;

      lastKeyDown.current = now;

      if (isIncrement) {
        increment(dragging);
      } else {
        decrement(dragging);
      }
    },
    [onKeyDown, disabled, increment, decrement, minimum, maximum]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent<HTMLSpanElement>) => {
      if (onKeyUp) {
        onKeyUp(event);
      }

      lastKeyDown.current = -1;
    },
    [onKeyUp]
  );

  return [
    {
      ref: refHandler,
      min,
      max,
      value,
      vertical,
      disabled,
      dragging,
      onKeyUp: handleKeyUp,
      onKeyDown: handleKeyDown,
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
    },
    {
      increment,
      decrement,
      minimum,
      maximum,
      drag,
      stop,
      setValue,
    },
  ];
}
