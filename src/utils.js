/*
 * @Date: 2019-12-05 10:42:47
 * @Author: liujixin
 * @LastEditTime: 2019-12-06 18:21:03
 */

import React, {Component} from 'react';
import {Text} from 'react-native';
import Svg, {Line} from 'react-native-svg';

/**
 * @description 二分找有序数组内最接近key的元素
 * @param {*} arr 数组
 * @param {*} low 查找起点index
 * @param {*} high 查找终点index
 * @param {*} key 需要查找的值
 */
const binarySearch = (arr, low, high, key) => {
  if (key >= arr[arr.length - 1]) {
    return arr.length - 1;
  } else if (key <= arr[0]) {
    return 0;
  }
  if (low > high) {
    return -1;
  }
  const mid = parseInt((high + low) / 2);
  const left = Math.abs(key - arr[mid - 1]);
  const right = Math.abs(key - arr[mid + 1]);
  const center = Math.abs(key - arr[mid]);
  if ((center < left && center < right) || (mid === 0 && center < right) || (mid === arr.length - 1 && center < left)) {
    return mid;
  } else if (arr[mid] > key) {
    high = mid - 1;
    return binarySearch(arr, low, high, key);
  } else if (arr[mid] < key) {
    low = mid + 1;
    return binarySearch(arr, low, high, key);
  }
};

/**
 * @description 计算Y轴上的稀疏数值，用来决定Y轴上显示的标题。如果max比较小，会使用内置枚举，如果较大（>20）会根据最大值伸缩求值
 * @param {*} max 最大值
 * @param {*} count 返回数组个数默认6个
 */
const calculateYSparseNumbers = (max, count = 6) => {
  let nums = [];
  if (max <= 5) {
    nums = [5, 4, 3, 2, 1, 0];
  } else if (max <= 10) {
    nums = [10, 8, 6, 4, 2, 0];
  } else if (max <= 20) {
    nums = [20, 16, 12, 8, 4, 0];
  } else {
    const maxNum = Math.ceil(max);
    const range = Math.floor(maxNum / count);
    let num = max;
    while (num > 0) {
      nums.push(Math.ceil(num));
      num -= range;
    }
  }
  return nums;
};

/**
 * @description 截取整倍数数组，舍弃余数
 * @param {*} sourceList 源数组
 * @param {*} multiple 倍数，默认7
 */
const interceptMultiplesList = (sourceList, multiple = 7) => {
  const list = sourceList.concat();
  if (list.length > multiple) {
    const count = list.length % multiple;
    if (count > 0) {
      // multiple的余数舍弃掉
      list.splice(0, count);
    }
  }
  return list;
};

/**
 * @description 计算高度系数，此值用来决定元素的实际坐标：实际坐标=元素值*系数
 * @param {*} maxItem 图表内最大的元素
 * @param {*} chartHeight 图表的高度
 */
const calculateHeightRatio = (maxItem, chartHeight) => {
  let heightRatio = 0;
  if (maxItem === 0) {
    heightRatio = 1.0;
  } else if (maxItem <= 5) {
    return chartHeight / 5.0;
  } else if (maxItem <= 10) {
    return chartHeight / 10.0;
  } else if (maxItem <= 20) {
    return chartHeight / 20.0;
  } else {
    heightRatio = chartHeight / maxItem;
  }
  return heightRatio;
};

/**
 * @description 在数组中查找最大值（目前只是简单实现，复杂度O(n)）
 * @param {*} list 目标数组
 */
const searchMaxItem = list => {
  let maxItem = 0;
  list.forEach(item => {
    if (item > maxItem) {
      maxItem = item;
    }
  });
  return maxItem;
};

/**
 * @description 返回Y轴所有参考线
 * @param {*} items 图表元素值数组
 * @param {*} heightRatio 高度系数
 * @param {*} width 图表宽
 */
const renderYReferenceLines = (items, heightRatio, width) => {
  return items.map((item, index) => {
    return (
      <Svg
        key={index}
        height="2"
        width={width}
        style={{
          position: 'absolute',
          bottom: item * heightRatio,
          left: 0,
        }}>
        <Line x1="0" y1="0" x2={width} y2="0" stroke="#eeeeee" strokeWidth="3" strokeDasharray={[3, 3]} />
      </Svg>
    );
  });
};

/**
 * @description 获取X轴标题数组
 * @param {*} titles titles
 * @param {*} isSparse 是否稀释数组，返回count个数的title
 * @param {*} count title个数，当isSparse为true时有效
 */
const renderXTitles = (titles, isSparse = false, count, pointW = 0, style = {}) => {
  let array = [];
  let firstPosi = -style.width / 2;
  const range = Math.floor(titles.length / count) > 1 ? Math.floor(titles.length / count) : 1;
  const distance = pointW * range;
  let list = titles;
  if (titles.length > count && isSparse) {
    const lastCount = titles.length % count; // 余数
    for (let index = 0; index <= titles.length - lastCount; index += range) {
      array.push(titles[index]);
    }
    list = array.slice(0, count + 1);
  }
  array = list.map((item, index) => ({name: item, position: firstPosi + distance * index}));
  const textStyle = {
    fontSize: 10,
    color: '#999',
    paddingTop: 9,
    textAlign: 'center',
    position: 'absolute',
    top: 0,
  };
  return array.map((item, index) => {
    return (
      <Text key={`${item.name}${item.position}`} style={[textStyle, style, {left: item.position}]}>
        {item.name}
      </Text>
    );
  });
};

export default Utils = {
  binarySearch,
  calculateYSparseNumbers,
  interceptMultiplesList,
  calculateHeightRatio,
  searchMaxItem,
  renderYReferenceLines,
  renderXTitles,
};
