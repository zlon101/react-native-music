# fork

https://github.com/maotoumao/MusicFree  commit: 8eb7504dc648f883639b6394c78f95c7497f6075

# 调试

[真机调试](https://reactnative.dev/docs/running-on-device) 

http://localhost:8081/index.bundle?platform=android&dev=true&minify=false&modulesOnly=false&runModule=true

# 依赖

1. [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) 

动画库

2. [react-native-gesture-handler](https://www.npmjs.com/package/react-native-gesture-handler) 

触摸 + 手势

3. 导航

方案一：

[@react-navigation/native](https://reactnavigation.org/docs/getting-started/) 
[@react-navigation/native-stack](xxx) 
[react-native-screens](xx) 
[react-native-safe-area-context](xx) 

需要修改 android 目录下的内容

**API**

navigation: navigate push goBack popToTop

方案二：

[react-native-navigation](https://wix.github.io/react-native-navigation/docs/installing#npm-or-yarn) 

4. tab

[react-native-tab-view](https://reactnavigation.org/docs/tab-view/) 

5. 图标

[react-native-vector-icons](https://github.com/oblador/react-native-vector-icons) 

6. 音频播放

[react-native-track-player](https://rntp.dev/docs/basics/installation) 

7. 开屏动画

[react-native-bootsplash](https://github.com/zoontek/react-native-bootsplash) 

8. 随机字符

[react-native-get-random-values](https://github.com/LinusU/react-native-get-random-values) 
[nanoid](https://github.com/ai/nanoid#react-native) 

react-native-get-random-values 必须在全局入口处导入

# 更新记录

package.json

  @react-native-masked-view/masked-view  删除
  deepmerge 删除
  immer 删除
  qrcode-generator 删除
  react-native-bootsplash 删除
  react-native-image-picker 删除
  react-native-url-polyfill 删除
  react-native-view-shot 删除
  react-qr-code 删除
  recyclerlistview 删除
  webdav 删除


android
  gradle.properties
  build.gradle
  app/build.gradle
  app/src/main/res/balues/styles.xml

src

  immer 引用： `import produce from 'immer'` 改为 `import { produce } from 'immer';`


============================================================

This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
