import {
  KeyboardEvent,
  MouseEventHandler,
  TouchEventHandler,
  useCallback,
  useEffect,
  useState,
  useRef,
} from "react";
import { applyRef, nearest, useDir } from "@react-md/utils";

import {
  DEFAULT_SLIDER_MAX,
  DEFAULT_SLIDER_MIN,
  DEFAULT_SLIDER_STEP,
} from "./constants";
import {
  SliderValue,
  UseSliderOptions,
  SliderDraggingType,
  SliderThumbDragIndex,
  SliderBehaviorProps,
} from "./types";

// this is the amount of time (in ms) since the last increment or decrement
// keydown event
const KEYBOARD_DRAG_THRESHOLD = 100;

interface SliderState {
  values: SliderValue;
  dragType: SliderDraggingType;
  dragging: SliderThumbDragIndex;
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

export function useSlider({
  ref: propRef,
  min = DEFAULT_SLIDER_MIN,
  max = DEFAULT_SLIDER_MAX,
  step = DEFAULT_SLIDER_STEP,
  defaultValue = [min, min],
  vertical = false,
  disabled = false,
  // mode = "onDrag",
  // onValueChange,
  onKeyUp,
  onKeyDown,
  onMouseDown,
  onTouchStart,
}: UseSliderOptions = {}): SliderBehaviorProps {
  const ref = useRef<HTMLDivElement | null>(null);
  const refHandler = useCallback(
    (instance: HTMLDivElement | null) => {
      applyRef(instance, propRef);
      ref.current = instance;
    },
    [propRef]
  );

  const [state, setState] = useState<SliderState>(() => {
    const value =
      typeof defaultValue === "function" ? defaultValue() : defaultValue;

    return {
      values: value,
      dragType: null,
      dragging: null,
    };
  });
  const { values, dragging, dragType } = state;
  const { dir } = useDir();

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
      const reversed = vertical || dir === "rtl";
      const range = max - min;
      const steps = Math.abs(range / step);
      const sliderSize = vertical ? height : width;
      const sliderPosition = vertical ? top : left;
      const cursorPosition = vertical ? clientY : clientX;

      const index = 0;

      const distanceDragged = Math.min(
        Math.max(0, cursorPosition - sliderPosition),
        sliderSize
      );
      const percentageDragged = distanceDragged / sliderSize;
      const value = percentageDragged * range + min;
      const rounded = nearest(value, min, max, steps);
      const nextValue = reversed ? 100 - rounded : rounded;
      setState(({ values }) => ({
        dragging: index,
        dragType: event.type.includes("mouse") ? "mouse" : "touch",
        values: index === 0 ? [nextValue, values[1]] : [values[0], nextValue],
      }));
    },
    [dir, min, max, step, vertical]
  );
  const stop = useCallback(() => {
    setState((prevState) => ({
      values: prevState.values,
      dragType: null,
      dragging: null,
    }));
  }, []);
  const minimum = useCallback(
    (index: 0 | 1) => {
      setState((prevState) => {
        const [first, second] = prevState.values;
        const values: SliderValue = index === 0 ? [min, second] : [first, min];

        return {
          ...prevState,
          values,
        };
      });
    },
    [min]
  );
  const maximum = useCallback(
    (index: 0 | 1) => {
      setState((prevState) => {
        const [first, second] = prevState.values;
        const values: SliderValue = index === 0 ? [max, second] : [first, max];

        return {
          ...prevState,
          values,
        };
      });
    },
    [max]
  );
  const increment = useCallback(
    (index: 0 | 1, dragging: boolean) => {
      setState((prevState) => {
        const [first, second] = prevState.values;
        const value = Math.max(
          min,
          Math.min(max, step + index === 0 ? first : second)
        );
        const values: SliderValue =
          index === 0 ? [value, second] : [first, value];

        return {
          values,
          dragType: dragging ? "keyboard" : null,
          dragging: dragging ? index : null,
        };
      });
    },
    [step, min, max]
  );
  const decrement = useCallback(
    (index: 0 | 1, dragging: boolean) => {
      setState((prevState) => {
        const [first, second] = prevState.values;
        const value = Math.max(
          min,
          Math.min(max, step - index === 0 ? first : second)
        );
        const values: SliderValue =
          index === 0 ? [value, second] : [first, value];

        return {
          values,
          dragType: dragging ? "keyboard" : null,
          dragging: dragging ? index : null,
        };
      });
    },
    [step, min, max]
  );

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
        if (key === "Tab") {
          stop();
        }

        return;
      }

      const index = 0;

      event.preventDefault();
      event.stopPropagation();
      if (isMinimum) {
        return minimum(index);
      }

      if (isMaximum) {
        return maximum(index);
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
        increment(index, dragging);
      } else {
        decrement(index, dragging);
      }
    },
    [onKeyDown, disabled, increment, decrement, minimum, maximum, stop]
  );
  const handleKeyUp = useCallback(
    (event: KeyboardEvent<HTMLSpanElement>) => {
      if (onKeyUp) {
        onKeyUp(event);
      }

      lastKeyDown.current = -1;
      stop();
    },
    [onKeyUp, stop]
  );

  return {
    ref: refHandler,
    min,
    max,
    values,
    vertical,
    disabled,
    dragging,
    onKeyUp: handleKeyUp,
    onKeyDown: handleKeyDown,
    onMouseDown: handleMouseDown,
    onTouchStart: handleTouchStart,
  };
}
