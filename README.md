# react-spatial-navigation

[@noriginmedia/react-spatial-navigation](https://github.com/NoriginMedia/react-spatial-navigation) を TypeScript で書き直し React 17 に対応させました。hooks ではなく HOC base なライブラリです。

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

基本的な使用方法は [オリジナル](@noriginmedia/react-spatial-navigation)と変わりありません。変更ある部分についてのみ記載。

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

const Sample = (props: Props, ref: ForwardedRef<HTMLDivElement>) => {
    const { children, className, text, isRoundedCorner } = props;
    return (
        // コンポーネントのルート要素に必ず ref を渡してください。
        <div className={className} ref={ref}>
          {isSkeleton ? <div className="skeleton"/> : <div>{text}</div>}
        </div>
    );
}
// withFocusable の引数に渡すコンポーネントは必ず forwardRef なコンポーネントである必要があります。
const FocusableSample = withFocusable()(forwardRef(Sample))
```

### フォーカスされた状態の時に className を付与する

コンポーネントの focus 状態を表す props として `focused` の他に `className` を受け取ることができます。

```tsx
import { forwardRef, type ForwardedRef } from 'react';
import { withFocusable, type FocusableProps } from '@yuki153/react-spatial-navigation';

const Component = (props: FocusableProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { className, focused } = props;
    return (
        /**
         * このコンポーネントが focus されている時 className には "is-spatial-focused"
         *   という名前が入ります。focus されていないときは空文字列が入ります。
         */
        <div className={className} ref={ref} />
    );
}
// withFocusable の引数に渡すコンポーネントは必ず forwardRef なコンポーネントである必要があります。
const FocusableComponent = withFocusable()(forwardRef(Component))
```

### デバッグ

import path を変更してください。library 内の console.log が有効になります。

```tsx
// before
import { initNavigation } from '@yuki153/react-spatial-navigation';

// after
import { initNavigation } from '@yuki153/react-spatial-navigation/debug';
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
