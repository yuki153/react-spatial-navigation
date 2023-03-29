# react-spatial-navigation

このライブラリは NoriginMedia が開発した [@noriginmedia/react-spatial-navigation](https://github.com/NoriginMedia/react-spatial-navigation) を一から TypeScript で書き直し React 17 に対応させたものです。このような素晴らしいライブラリを公開された NoriginMedia に敬意を表すとともに深く感謝します。

## 本ドキュメントにおける用語定義

|用語|用語が指す意味|
|--|--|
|オリジナル|@noriginmedia/react-spatial-navigation|
|FocusableComponent|withFocusable (HighOrderComponent) 関数から return されたコンポーネント|
|WrappedComponent|withFocusable 関数の引数に forwardRef と共に渡すコンポーネント|

## オリジナルとの差分比較

|比較項目|@noriginmedia/react-spatial-navigation|@yuki153/react-spatial-navigation|
|--|--|--|
|Size (gzip)|16 KB|__6 KB__|
|React17|対応（17 では非推奨な API の使用有）|__対応__|
|React Native|対応|非対応|
|TypeScript|非対応|__対応__|
|lodash|依存|__非依存__|
|recompose|依存|__非依存__|
|debug 機能|充実|最低限|

## v1.3.0 からの重要な変更

> ⚠︎ このライブラリを初めて使用する方は「[ライブラリの使用方法](#ライブラリの使用方法)」から先に見ると良いでしょう。「ライブラリの使用方法」では v1.3.0 より前の HOC ベースでのコード例を用いて説明しています。

v1.3.0 で hooks を使用した FocusaleComponent の作成に対応しました。  
これまでは基本的に withFocusable(HOC) を使用して FocusaleComponent を作成する手順でしたが、v1.3.0 以降は `useFocusable` を使用することを推奨します。下記の2つのコード例は書き方は違えど、全く同じ FocusableComponent の作成です。

```tsx
/** HOC を使った FocusableComponent の作成 **/

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
/** hooks を使った FocusableComponent の作成 **/

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

### useFocusable の仕様

* 引数
  * 基本的に [@noriginmedia/react-spatial-navigation | Props that can be applied to HOC](https://github.com/NoriginMedia/react-spatial-navigation#props-that-can-be-applied-to-hoc) と同じ props を引数として渡すことができます。加えて、本ライブラリでは `className`, `autoDelayFocusToChild`, `onBackPress` を引数として渡すことができます。各プロパティーの詳細については後述しています。
* 戻り値
  * HOC から [WrappedComponent が受け取る props](#wrappedcomponent-が受け取る-props) と同様の値を戻り値として取得できます。加えて `useFocusable` では `FocusProvider`, `ref` が戻り値に含まれます。この2つのプロパティーは FocusableComponent を作成する上で重要なプロパティーです。

### useFocusable を使用した FocusableComponent の作成

前述にも比較 HOC との比較例としてコードを記載していますが、`useFocusable` から取得した `FocusProvider` と `ref` を使用します。`FocusProvider` は FocusableComponent が return する JSX の ROOT 要素に必ず配置する必要があります。この `FocusProvider` は更に下階層に子の FocusableComponent を持った時に、子の FocusableComponent が親の FocusableComponent の focusKey(parentFocusKey) を知るために使用されます。

`ref` は focusable にしたい要素に対して渡します。通常は `FocusProvider` を除く return する JSX の ROOT 要素に渡します。

### useFocusable が引数として受け取る className

`useFocusable` は引数として `className` を受け取ることができ、戻り値としても `className` を返します。動作としては以下のコード例の結果となります。つまり `useFocusable` から返される `className` には `focused` が true の時には "is-spatial-focused" という文字列が付与されるます。これはわざわざ `focused` の true / false を見て `className` にフォーカス状態を表す名前を付与するロジックを書く手間を省きます。「[className で focus の状態を知る](#classname-で-focus-の状態を知る)」でも似たような事を説明しています。

```tsx
/** className を引数として渡した時 **/

const { className, focused } = useFocusable({ className: "hoge" });

// focused が true の時  -> "hoge is-spatial-focused"
// focused が false の時 -> "hoge"
console.log(className);
```

```tsx
/** className を引数として渡さない時 **/

const { className, focused } = useFocusable();

// focused が true の時  -> "is-spatial-focused"
// focused が false の時 -> undefined
console.log(className);
```

## ライブラリの使用方法

基本的な使用方法はオリジナルと変わりありません。異なる部分についてのみ記載。

### 初期化

FocusableComponent を作成する前に、まずは初期化しておく必要があります。

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
    className: string | undefined;
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

### autoDelayChildToFocus（default: false）

これは FocusableComponent に渡せる props または `withFocusable` 関数の設定値（config）として渡せるプロパティーです。このライブラリの通常の挙動として `setFocus("hoge")` を実行した時に `focusKey` に "hoge" と名のつく FocusaleComponent（以降 hoge と呼ぶ） にフォーカスしますが、その hoge が下階層に子供の FocusableComponent を持っていた場合は、hoge ではなく子供の FocusableComponent がフォーカスされることになります。

ただし、hoge が `setFocus("hoge")` によりフォーカスされたタイミングで、子供の FocusableComponent がまだ DOM Tree 上にマウントされていない場合には、フォーカスは子供へ移らず hoge にフォーカスされます。この子供のマウントタイミングに左右されず、親から子へフォーカスを自動的に移したい場合に `autoDelayChildToFocus` は有効です。

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

- Node.js version = 16.14.2

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
