# react-spatial-navigation

This library is based on [@noriginmedia/react-spatial-navigation](https://github.com/NoriginMedia/react-spatial-navigation) developed by NoriginMedia. Rewritte in TypeScript to support React 17. We would like to express our respect and deepest gratitude to NoriginMedia for releasing such a wonderful library.

For Japanese README, click [here 🇯🇵](./README.ja.md).

## Definition terms in this documentation

|terms|description|
|--|--|
|Original|@noriginmedia/react-spatial-navigation|
|FocusableComponent|A special component returned from the withFocusable (HighOrderComponent) function.|
|WrappedComponent|A component to pass along with forwardRef to the argument of the withFocusable function(HOC).|

## Difference from original

||@noriginmedia/react-spatial-navigation|@yuki153/react-spatial-navigation|
|--|--|--|
|Size (gzip)|16 KB|__6 KB__|
|React17| supported (using deprecated api) |__supported__|
|React Native|supported|not supported|
|TypeScript|not supported|__supported__|
|lodash|dependent|__independent__|
|recompose|dependent|__independent__|
|debug |supported|partially supported|

## Important changes since v1.3.0

> ⚠︎ If you are new to this library, you may want to start with "How to Use the Library". The "How to Use the Library" section uses HOC-based code examples prior to v1.3.0.

FocusableComponent creation using hooks was support in v1.3.0.

Previously, FocusaleComponent was created using withFocusable(HOC), but as of v1.3.0, it is recommended to use `useFocusable`. The two code examples below are written in different ways, but they create exactly the same FocusableComponent.

```tsx
/** Create a FocusableComponent with HOC **/

import { forwardRef, type ForwardedRef } from 'react';
import { withFocusable, type FocusableProps } from '@yuki153/react-spatial-navigation';

const WrappedComponent = (props: FocusableProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { className } = props;
    return (
        <div className={className} ref={ref}>
            <div>Hello World</div>}
        </div>
    );
}
export const FocusableComponent = withFocusable()(forwardRef(WrappedComponent))
```

```tsx
/** Create a FocusableComponent with hooks **/

import { type PublicComponentProps } from '@yuki153/react-spatial-navigation';

export const FocusableComponent = (props: PublicComponentProps) => {
  const { FocusProvider, ref, className } = useFocusable(props)
    return (
      <FocusProvider>
        <div className={className} ref={ref}>
            <div>Hello World</div>}
        </div>
      </FocusProvider>
    );
}
```

### useFocusable specification

* argments
  * Basically the same props as "[@noriginmedia/react-spatial-navigation | props applicable to HOC](https://github.com/NoriginMedia/react-spatial-navigation#props-that-can-be-applied-to-hoc)" can be passed as arguments. Additionally, className, autoDelayFocusToChild, and onBackPress can be passed as arguments in this library. The details of each of its properties are described in later sections.
* returns
  * You can get the same value as "[Props passed to Wrapped Component](#props-passed-to-wrapped-component)" as the return value. Additionally, `useFocusable` includes `FocusProvider` and `ref` in the return value. These two properties are important for creating a FocusableComponent.

### Creating a FocusableComponent using useFocusable

As in the HOC and hook comparison code example above, use the `FocusProvider` and `ref` obtained from `useFocusable`. The `FocusProvider` must be placed in the ROOT element of the JSX that FocusableComponent returns. This `FocusProvider` is used to convey the focusKey(parentFocusKey) to the child FocusableComponent.

The `ref` is passed to the element you want to make focusable. Usually passed to ROOT elements (exclude FocusProvider) in JSX.

### ClassName that useFocusable receives as an argument

`useFocusable` can receive `className` as an argument and returns `className` as a return value. The behavior is the result of the following code example. So the `className` returned by `useFocusable` will have the string "is-spatial-focused" when `focused` is true. This saves you the trouble of writing logic to check whether `focused` is true or false and give `className` a name that represents the focused state. And "[Know the focus state by className](#know-the-focus-state-by-classname)" explains the same thing.

```tsx
/** Pass className to arguments **/

const { className, focused } = useFocusable({ className: "hoge" });

// focused: true  -> "hoge is-spatial-focused"
// focused: false -> "hoge"
console.log(className);
```

```tsx
/** Not pass className to arguments **/

const { className, focused } = useFocusable();

// focused: true  -> "is-spatial-focused"
// focused: false -> undefined
console.log(className);
```

## How to use library

The basic usage is the same as the original. Only the different parts are described.

### Initialization

The library must be initialized before creating the FocusableComponent.

```tsx
import { initNavigation, setKeyMap } from '@yuki153/react-spatial-navigation';

initNavigation();

/**
 * You can set multiple values from KeyboardEvent.keyCode and KeyboardEvent.key.
 */
setKeyMap({
  left: [37, 9001, "ArrowLeft"],
  up: [38, 9002, "ArrowUp"],
  right: [39, 9003, "ArrowRight"],
  down: [40, 9004, "ArrowDown"],
  enter: [13, 9005, "Enter"],
  back: [8, 9006, "Backspace"]
});
```

### Create FocusableComponent

```tsx
import { forwardRef, type ForwardedRef } from 'react';
import { withFocusable, type FocusableProps } from '@yuki153/react-spatial-navigation';

type Props = {
    text: string;
    isSkeleton: boolean;
} & FocusableProps;

const WrappedComponent = (props: Props, ref: ForwardedRef<HTMLDivElement>) => {
    const { children, className, text, isRoundedCorner } = props;
    return (
        // Pass the ref to ROOT element in JSX
        <div className={className} ref={ref}>
          {isSkeleton ? <div className="skeleton"/> : <div>{text}</div>}
        </div>
    );
}
// You must pass the forwardRef component to the withFocusable argument
const FocusableComponent = withFocusable()(forwardRef(WrappedComponent))
```

#### Props passed to Wrapped Component

You can receive the following Props other than the Props that the user gives optionally.  
See "[NoriginMedia / react-spatial-navigation - Props passed to Wrapped Component](https://github.com/NoriginMedia/react-spatial-navigation#props-passed-to-wrapped-component)" for properties descriptions. Additionally, this library can receive className.

```ts
type FocusableProps = {
    className: string | undefined;
    focusKey: string;
    parentFocusKey: string;
    focused: boolean;
    hasFocusedChild: boolean;
    setFocus: (focusKey?: string, detail?: any) => void;
    stealFocus: (detail?: any) => void;
    navigateByDirection: (dir: "right" | "left" | "down" | "up") => void;
    pauseSpatialNavigation: () => void;
    resumeSpatialNavigation: () => void;
    updateAllSpatialLayouts: () => void;
};
```

### Know the focus state by className

Wrapperd component can receive `className` in addition to `focused` as props representing focus state. Below is an example combined with StyledComponent from @emotion/styled. But, the same thing can be done with "focused" props, so you can use them differently depending on the situation.

```tsx
import styled from "@emotion/styled";
import { forwardRef, type ForwardedRef } from 'react';
import { withFocusable, FOCUSED_SELECTOR_NAME, type FocusableProps } from '@yuki153/react-spatial-navigation';

const StyledDiv = styled.div`
  width: 100px;
  height: 100px;
  background-color: gray;
  &${FOCUSED_SELECTOR_NAME} {
    background-color: yellow;
  }
`;

const WrappedComponent = (props: FocusableProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { className, focused } = props;
    return (
        /**
         * The `className` will have the string "is-spatial-focused" when `focused` is true.
         */
        <StyledDiv className={className} ref={ref} />
    );
}

// withFocusable の引数に渡すコンポーネントは必ず forwardRef なコンポーネントである必要があります。
const FocusableComponent = withFocusable()(forwardRef(WrappedComponent));
```

### Handring when back key pressed

This library is `onBackPress` supported.  
Like `onEnterPress` function's arguments, it accepts the same props as WrappedComponent. Also, the default behavior of `onBackPress` is to not propagate the keydown event of a back key press to the window object because [`stopPropagation()`](https://developer.mozilla.org/ja/docs/Web/API/Event/stopPropagation) is enabled when the function is executed. If you want to enable the propagation of keydown events to the window object when `onBackPress` is executed, you must add a __return false__ at the end of the function.

```tsx
<FocusableComponent
    onBackPress={(focusableProps) => {
    const { focusKey, setFocus, navigateByDirection, ...props } = focusableProps;
        // The logic when back key pressed ...
    }}
/>
```

### autoDelayChildToFocus（default: false）

This is the property to pass to "config for the `withFocusable`" or "props of FocusableComponent". The default behavior of this library is that executed `setFocus("hoge")` will focus on the FocusaleComponent with "hoge" in the `focusKey` (hereafter called hoge). If the hoge has a child FocusableComponent at a lower level, the child FocusableComponent will be focused, not the hoge.

However, if the child FocusableComponent is not yet mounted on the DOM Tree when hoge is focused by setFocus("hoge"), the focus is not shifted to the child but to hoge. autoDelayChildToFocus is useful if you want to automatically shift the focus from the parent to the child regardless of the child's mount timing.

```tsx
const FocusableComponent = withFocusable(/* config */)(forwardRef(WrappedComponent))
```
```tsx
return (
  <FocusableComponent autoDelayChildToFocus={true} >
    <ChildFocusableComponent />
  </FocusableComponent>
)
```

### Debug

Since the debug version is published, please rewrite package.json as follows.  
The debug version will output console.log.

```diff
"dependencies": {
  "react": "@17.0.2",
  "react-dom": "17.0.2",
- "@yuki153/react-spatial-navigation": "^1.2.5",
+ "@yuki153/react-spatial-navigation": "1.2.5-debug",
},
```

## How to use this repository

How to use for developers to clone this library, modify it, and check its operation.

### Recommendation

* node version is 16.13 or higher

### Check library behavior

Launch local server from demo/main.tsx as entry point with the following npm script.

```bash
# Launch local server -> localhost:3000
yarn dev
```

### bundle the library

lib/index.ts is bundle by vite as the entry point.

```bash
# bundled by vite to create dist and types directories
yarn build
```
