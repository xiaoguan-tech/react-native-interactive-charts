<!--
 * @Date: 2019-12-05 09:56:29
 * @Author: liujixin
 * @LastEditTime : 2020-01-18 17:55:09
 -->
# react-native-interactive-charts

基于SVG的可交互ReactNative图表组件。

## 运行示例工程
```bash
$ cd examples
$ npm install
$ npm run wml-start
```
<p align="center">
<img src="https://github.com/xiaoguan-tech/react-native-interactive-charts/blob/master/screen-shot-ios.png" alt="screen-shot-ios"  width="262" height="568">

<img src="https://github.com/xiaoguan-tech/react-native-interactive-charts/blob/master/screen-shot-andriod.png" alt="screen-shot-andriod"  width="320" height="568">
</p>

## 安装

```bash
$ npm add react-native-interactive-charts --save
```

## 依赖项


### 1.依赖
虽然package.json已经间接依赖`react-native-svg`、
`react-native-linear-gradient`，但因为ReactNative的Link命令无法识别间接依赖，所以请先添加：
```bash
$ npm add react-native-svg --save
```

```bash
$ npm add react-native-linear-gradient --save
```

### 2. Link native code

```bash
$ react-native link react-native-svg 
```

### 3. iOS执行pod install
```bash
$ cd ios && pod install
```
