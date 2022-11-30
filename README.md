# react-spatial-navigation

このライブラリは NoriginMedia が開発した [@noriginmedia/react-spatial-navigation](https://github.com/NoriginMedia/react-spatial-navigation) がベースとなります。このような素晴らしいライブラリを公開された NoriginMedia に敬意を表すとともに深く感謝します。

@noriginmedia/react-spatial-navigation を TypeScript で書き直し React 17 に対応させました。hooks ではなく HOC base なライブラリです。

## 本ドキュメントにおける用語定義

|用語|用語が指す意味|
|--|--|
|オリジナル|@noriginmedia/react-spatial-navigation|
|FocusableComponent|withFocusable (HighOrderComponent) 関数から return されたコンポーネント|
|WrappedComponent|withFocusable 関数の引数に forwardRef と共に渡すコンポーネント|

## オリジナルとの差分比較

|比較項目|@noriginmedia/react-spatial-navigation|@yuki153/react-spatial-navigation|
|--|--|--|
|Size (gzip)|16 KB|__5 KB__|
|React17|対応（17 では非推奨な API の使用有）|__対応__|
|React Native|対応|非対応|
|TypeScript|非対応|__対応__|
|lodash|依存|__非依存__|
|recompose|依存|__非依存__|
|debug 機能|充実|最低限|

## ライブラリの使用方法

基本的な使用方法はオリジナルと変わりありません。変更ある部分についてのみ記載。

### 初期化

```tsx
import { initNavigation, setKeyMap } from '@yuki153/react-spatial-navigation';

initNavigation();

/**
 * KeyboardEvent.keyCode または KeyboardEvent.key で取得できる値を複数セット可能です。
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

### フォーカス可能なコンポーネントの作成

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
        // コンポーネントのルート要素に必ず ref を渡してください。
        <div className={className} ref={ref}>
          {isSkeleton ? <div className="skeleton"/> : <div>{text}</div>}
        </div>
    );
}
// withFocusable の引数に渡すコンポーネントは必ず forwardRef なコンポーネントである必要があります。
const FocusableComponent = withFocusable()(forwardRef(WrappedComponent))
```

#### WrappedComponent が受け取る Props

ユーザーが任意に渡す Props 以外では下記の Props を受け取ることができます。  
それぞれ値や関数の説明については [NoriginMedia / react-spatial-navigation - Props passed to Wrapped Component](https://github.com/NoriginMedia/react-spatial-navigation#props-passed-to-wrapped-component) を参照してください。本ライブラリでは加えて、className が受け取れるようになっています。

```ts
type FocusableProps = {
    className: "is-spatial-focused" | `${string} is-spatial-focused` | "";
    focusKey: string | null;
    realFocusKey: string;
    parentFocusKey: string;
    preferredChildFocusKey: string | null;
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

### className で focus の状態を知る

コンポーネントの focus 状態を表す props として `focused` の他に `className` を受け取ることができます。下記は @emotion/styled の StyledComponent と組み合わせた一例です。`focused` props でも同じことは実現できるため、状況に応じて使い分けられます。

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
         * このコンポーネントが focus されている時 className には "is-spatial-focused"
         *   という文字列が入ります。focus されていないときは空文字列が入ります。
         */
        <StyledDiv className={className} ref={ref} />
    );
}

// withFocusable の引数に渡すコンポーネントは必ず forwardRef なコンポーネントである必要があります。
const FocusableComponent = withFocusable()(forwardRef(WrappedComponent));
```

### Back キーが押された場合のハンドリング

本ライブラリでは、オリジナルには存在しない `onBackPress` をサポートしています。  
`onEnterPress` 等と同様に関数の引数から WrappedComponent が受け取る props と同じ値を受け取れます。また、`onBackPress` のデフォルトの挙動として、関数実行時 [`stopPropagation()`](https://developer.mozilla.org/ja/docs/Web/API/Event/stopPropagation) が有効となるため window object に back キーを押した keydown event を伝搬しません。もし `onBackPress` の実行時 window object への keydown event の伝搬を有効にしたい場合は、関数内で最後に __`return false`__ してください。

```tsx
<FocusableComponent onBackPress={(ownProps) => {
    const { focusKey, setFocus, navigateByDirection, ...props } = ownProps;
    // back キーを押した場合の処理
    // ...
}} />
```

### デバッグ

debug バージョンを公開しているため package.json を以下のように書き換えてください。  
debug バージョンでは console.log が出力されるようになります。

> ⚠︎ debug version へ切り替える場合には ^ や ~ を varsion 指定から取り除いてください。

```diff
"dependencies": {
  "react": "@17.0.2",
  "react-dom": "17.0.2",
- "@yuki153/react-spatial-navigation": "^1.2.5",
+ "@yuki153/react-spatial-navigation": "1.2.5-debug",
},
```

## 開発環境の使用方法

開発者がこのライブラリを Clone して修正や動作確認などを行う際の手順を記載。

### 推奨事項

- Node.js version = 16.13.0

### デモで動作を確認する

demo/main.tsx が entry point として起動します。

```bash
# localhost:3000 が起動します
yarn dev
```

### ライブラリとしてバンドルする

lib/index.ts が entry point として vite により bundle されます。

```bash
# vite によって bundle され dist と types ディレクトリが生成されます
yarn build
```
