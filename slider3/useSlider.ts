/* eslint-disable */
import {
  KeyboardEvent,
  MouseEventHandler,
  TouchEventHandler,
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import { applyRef, getPercentage, nearest, useDir } from "@react-md/utils";
import {
  DEFAULT_SLIDER_MAX,
  DEFAULT_SLIDER_MIN,
  DEFAULT_SLIDER_STEP,
} from "./constants";
import {
  SliderValue,
  TwoThumbSliderValue,
  UseSliderOptions,
  UseSliderReturnValue,
  SliderDraggingType,
  ReturnedValue,
  SliderDragAction,
} from "./types";

interface State {
  value: TwoThumbSliderValue;
  dragType: SliderDraggingType;
  dragging: -1 | 0 | 1;
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

// function handleDrag({
//   min,
//   max,
//   step,
//   vertical,
//   reversed,
//   clientX,
//   clientY,
//   top,
//   height,
//   left,
//   width,
//   eventType,
// }: SliderDragAction): State {
//   const range = max - min;
//   const steps = Math.abs(range / step);
//   const sliderSize = vertical ? height : width;
//   const sliderPosition = vertical ? top : left;
//   const cursorPosition = vertical ? clientY : clientX;

//   const distanceDragged = Math.min(
//     Math.max(0, cursorPosition - sliderPosition),
//     sliderSize
//   );
//   const percentageDragged = distanceDragged / sliderSize;
//   const value = percentageDragged * range + min;
//   const rounded = nearest(value, min, max, steps);

//   return {
//     dragging: eventType !== "mousedown" && eventType !== "touchstart",
//     dragType: eventType.includes("mouse") ? "mouse" : "touch",
//     // when dragging vertically or horizontally when the language is
//     // RTL instead of LTR, need to inverse the value for it to work
//     value: reversed ? 100 - rounded : rounded,
//   };
// }

export function useSlider<DV extends SliderValue | undefined>({
  ref: propRef,
  min = DEFAULT_SLIDER_MIN,
  max = DEFAULT_SLIDER_MAX,
  step = DEFAULT_SLIDER_STEP,
  vertical = false,
  disabled = false,
  defaultValue,
  // mode = "onDrag",
  // onValueChange,
  onKeyUp,
  onKeyDown,
  onMouseDown,
  onTouchStart,
}: UseSliderOptions<DV> = {}): UseSliderReturnValue<DV> {
  const ref = useRef<HTMLDivElement | null>(null);
  const refHandler = useCallback(
    (instance: HTMLDivElement | null) => {
      applyRef(instance, propRef);
      ref.current = instance;
    },
    [propRef]
  );
  const defaulted = useMemo(() => {
    let initial: SliderValue;
    if (typeof defaultValue === "number") {
      initial = defaultValue;
    } else if (typeof defaultValue === "function") {
      initial = defaultValue();
    } else if (typeof defaultValue === "undefined") {
      initial = min;
    } else {
      initial = defaultValue;
    }

    return initial;
  }, []);

  const [state, setState] = useState<State>(() => {
    let value: TwoThumbSliderValue;
    if (typeof defaulted === "number") {
      value = [defaulted, 0];
    } else {
      value = defaulted;
    }

    return {
      value,
      dragType: null,
      dragging: -1,
    };
  });
  const { dragType, dragging, value } = state;
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
      const data = {
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
      };
    },
    [dir, min, max, step, vertical]
  );

  const stop = useCallback(() => {
    setState((prevState) => ({
      dragType: null,
      dragging: -1,
      value: prevState.value,
    }));
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
        if (key === "Tab") {
          stop();
        }

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
    [onKeyDown, disabled, increment, decrement, minimum, maximum, stop]
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
      value: (Array.isArray(defaultValue) ? value : value[0]) as ReturnedValue<
        DV
      >,
      vertical,
      disabled,
      dragging,
      onKeyUp: handleKeyUp,
      onKeyDown: handleKeyDown,
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
    },
  ];
}
