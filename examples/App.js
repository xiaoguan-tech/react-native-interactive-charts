/*
 * @Date: 2019-12-05 09:39:21
 * @Author: liujixin
 * @LastEditTime: 2019-12-10 09:24:12
 */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Platform,
  UIManager,
  Dimensions,
} from 'react-native';
import {LineChart, BarChart} from '@tools/react-native-chart';

const {width} = Dimensions.get('window');

const LINE_DATA = [
  {numbers: [2.3], title: '2018.1'},
  {numbers: [2.5], title: '2018.2'},
  {numbers: [2.8], title: '2018.3'},
  {numbers: [2.9], title: '2018.4'},
  {numbers: [3.3], title: '2018.5'},
  {numbers: [4.3], title: '2018.6'},
  {numbers: [5.3], title: '2018.7'},
  {numbers: [6.3], title: '2018.8'},
  {numbers: [7.3], title: '2018.9'},
  {numbers: [4.3], title: '2018.10'},
  {numbers: [5.3], title: '2018.11'},
  {numbers: [6.3], title: '2018.12'},
  {numbers: [8.3], title: '2019.1'},
  {numbers: [6.3], title: '2019.2'},
  {numbers: [5.3], title: '2019.3'},
  {numbers: [4.3], title: '2019.4'},
  {numbers: [5.3], title: '2019.5'},
  {numbers: [6.3], title: '2019.6'},
  {numbers: [7.3], title: '2019.7'},
  {numbers: [4.3], title: '2019.8'},
  {numbers: [3.3], title: '2019.9'},
  {numbers: [7.3], title: '2019.10'},
  {numbers: [7.3], title: '2019.11'},
  {numbers: [7.3], title: '2019.12'},
  {numbers: [7.3], title: '2020.1'},
  {numbers: [7.3], title: '2020.2'},
  // {numbers: [7.3], title: '2020.3'},
  // {numbers: [7.3], title: '2020.4'},
  // {numbers: [7.3], title: '2020.5'},
  // {numbers: [7.3], title: '2020.6'},
  // {numbers: [7.3], title: '2020.7'},
  // {numbers: [7.3], title: '2020.8'},
  // {numbers: [7.3], title: '2020.9'},
  // {numbers: [7.3], title: '2020.10'},
];

const LINE_DATA2 = [
  {numbers: [2.3, 1.1], title: '2018.1'},
  {numbers: [2.5, 1.4], title: '2018.2'},
  {numbers: [2.8, 1.9], title: '2018.3'},
  {numbers: [2.9, 2.1], title: '2018.4'},
  {numbers: [3.3, 2.7], title: '2018.5'},
  {numbers: [4.3, 3.0], title: '2018.6'},
  {numbers: [8, 4.8], title: '2018.7'},
];

const barData = [
  {label: '201901', value: '12'},
  {label: '201902', value: '8.1'},
  {label: '201903', value: '4.5'},
  {label: '201904', value: '4.5'},
  {label: '201905', value: '19.12'},
  {label: '201906', value: '1.25'},
  {label: '201907', value: '7.45'},
  {label: '201908', value: '7.45'},
  {label: '201909', value: '7.45'},
  {label: '201910', value: '7.45'},
  {label: '201911', value: '7.45'},
  {label: '201912', value: '7.45'},
];
const barOptions = {
  xValue: 'label',
  yValue: 'value',
  yUnit: '%', // xMaxCount: 6, // YMaxCount: 6,
  referenceLine: true,
  gradientBackground: ['#ffffff', '#f6f7f8'],
  barStyle: {
    background: ['#ffffff', '#f6f7f8'],
  },
};

if (Platform.OS === 'android') {
  // 打开安卓布局动画
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const App: () => React$Node = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{flex: 1, paddingBottom: 50}}>
        <ScrollView>
          <Text style={{textAlign: 'center', fontSize: 18, fontWeight: 'bold'}}>
            折线
          </Text>
          <LineChart
            sourceList={LINE_DATA}
            axisYTitleUnit={'%'}
            displayReferenceLine={true}
            displayMobileReferenceLine={false}
            mobileReferenceLineColor={'rgb(0,0,0,0.15)'}
            linesColor={['#5691ff', '#fea649']}
            axisXTitleMaxCount={7}
            axisXTitleWidth={50}
            style={{
              backgroundColor: '#fff',
              width: width - 40,
              height: 200,
              marginHorizontal: 20,
              marginVertical: 20,
            }}
          />
          <LineChart
            sourceList={LINE_DATA2}
            axisYTitleUnit={'%'}
            displayReferenceLine={true}
            displayMobileReferenceLine={true}
            mobileReferenceLineColor={'rgb(0,0,0,0.15)'}
            linesColor={['#5691ff', '#fea649']}
            axisXTitleWidth={32}
            style={{
              backgroundColor: '#fff',
              width: width - 40,
              height: 200,
              marginHorizontal: 20,
            }}
          />
          <Text
            style={{
              textAlign: 'center',
              fontSize: 18,
              fontWeight: 'bold',
              paddingTop: 20,
            }}>
            柱状图         
          </Text>
          <BarChart
            style={{
              backgroundColor: '#fff',
              width: width - 40,
              height: 200,
              marginHorizontal: 20,
              marginVertical: 20,
            }}
            sourceList={barData}
            options={barOptions}
          />
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#fff',
  },
});

export default App;
