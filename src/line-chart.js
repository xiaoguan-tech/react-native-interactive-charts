/*
 * @Date: 2019-11-19 15:49:04
 * @Author: liujixin
 * @LastEditTime : 2020-01-18 11:00:35
 */

import React, {Component} from 'react';
import {Text, View, StyleSheet, Dimensions, PanResponder, LayoutAnimation, UIManager, findNodeHandle} from 'react-native';
import Svg, {Line, Polyline, Defs, Stop, LinearGradient, Polygon} from 'react-native-svg';
import LinearGradientView from 'react-native-linear-gradient';
import Utils from './utils';

export default class LineChart extends Component {
  static defaultProps = {
    /// 图表数据源 {numbers: [Number1, Numbe2, ...], title: String}
    sourceList: [],
    // 定义图表容器样式
    style: {},
    // 线条的颜色配置
    linesColor: [],
    // 渐变背景
    backgroundColors: ['#ffffff', '#f6f7f8'],
    // 线和坐标轴组成的区域填充渐变色
    lineFillColors: ['rgb(255,255,255,0)', '#d7e3f9'],
    // 坐标轴标题颜色
    axisTitleColor: '#999',
    // Y轴标题数值单位
    axisYTitleUnit: '',
    // x轴标题最多个数，默认7个
    axisXTitleMaxCount: 7,
    // 是否显示参考线
    displayReferenceLine: true,
    // 是否显示移动参考线
    displayMobileReferenceLine: false,
    // 可移动参考线颜色
    mobileReferenceLineColor: '#eee',
  };

  constructor(props) {
    super(props);
    // 选中的折线点
    this.linePointViews = [];
    // 选中点X参考线
    this.referenceLineX = null;
    // 选中点Y参考线
    this.referenceLineY = null;
    // 折现点坐标数组
    this.linePoints = [];
    // 实际显示的坐标，因为横坐标最多显示`axisXTitleMaxCount`个标题，如果不是`axisXTitleMaxCount`的倍数，余数将会被舍弃
    this.displayList = [];
  }

  UNSAFE_componentWillMount() {
    this.initPanResponder();
  }

  initPanResponder() {
    this.viewPanResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => {
        // 开始 gestureState.{x,y} 现在会被设置为0
        this.onPanResponderMove(evt, gestureState);
      },
      onPanResponderMove: (evt, gestureState) => this.onPanResponderMove(evt, gestureState),
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // 阻止原生组件成为JS响应者
        return false;
      },
    });
  }

  // ======== MARK: Event =======

  onPanResponderMove(evt, gestureState) {
    const point = this.searchMinimumRangeLinePoint({
      x: evt.nativeEvent.locationX,
      y: evt.nativeEvent.locationY,
    });
    if (point && this.gesturePoint && point.index === this.gesturePoint.index) {
      return;
    }
    if (point) {
      const item = this.displayList[point.index];
      this.pointDetailView.setContent(item.title, item.numbers, () => {
        const handle = findNodeHandle(this.pointDetailView);
        UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
          // 先获取到控件宽高，再设置其位置
          this.setMobilePointProperty(point.points, {width, height});
        });
      });
    } else {
      this.linePointViews.forEach(item => {
        if (item) {
          item.setNativeProps({
            style: {opacity: 0},
          });
        }
      });
      this.pointDetailView.contentView.setNativeProps({
        style: {opacity: 0},
      });
    }
    this.gesturePoint = point;
  }

  setMobilePointProperty(points, viewSize) {
    LayoutAnimation.configureNext(customLayoutAnimation);
    this.linePointViews.forEach((item, index) => {
      item.setNativeProps({
        style: {left: points[index].x - 2.5, top: points[index].y - 2.5, opacity: 1},
      });
    });
    const position = this.calculatePointPosition(points[0], viewSize);
    this.pointDetailView.contentView.setNativeProps({
      style: {left: position.left, top: position.top, opacity: 1},
    });
    if (this.referenceLineX && this.referenceLineY) {
      this.referenceLineX.setNativeProps({
        style: {left: points[0].x, opacity: 1},
      });
      if (this.linePoints.length <= 1) {
        this.referenceLineY.setNativeProps({
          style: {top: points[0].y, opacity: 1},
        });
      }
    }
  }

  // ======== MARK: Render =======

  render() {
    const {
      style,
      sourceList = [],
      displayReferenceLine,
      axisYTitleUnit,
      axisXTitleMaxCount,
      axisTitleColor,
      axisXTitleWidth,
      backgroundColors,
      lineFillColors,
      displayMobileReferenceLine,
    } = this.props;
    this.linePointViews = [];
    this.displayList = sourceList; // Utils.interceptMultiplesList(sourceList, this.props.axisXTitleMaxCount);
    // 统计图内容实际宽度=总宽-y轴标题宽
    const svgChartWidth = this.getChartWidth() - styles.yTitleListText.width;
    const svgChartHeight = style.height - styles.xTitleList.height;
    // 标题数组
    const titleList = this.displayList.map(({title}) => title);
    let maxItem = 0;
    // 线条数量
    let numberLength = 0;
    // 计算最大值
    this.displayList.forEach((item, index) => {
      let max = 0;
      numberLength = item.numbers.length;
      item.numbers.forEach((item, index) => {
        if (item > max) max = item;
      });
      if (max > maxItem) maxItem = max;
    });
    // 数据为空时默认5
    if (maxItem === 0) maxItem = 5;
    // 最高点位置
    const chartMaxHeight = style.height - styles.xTitleList.height - /*顶部留个间隙*/ 20;
    // 计算高度系数
    const heightRatio = Utils.calculateHeightRatio(maxItem, chartMaxHeight);
    // 计算y轴稀疏标题
    const yTitles = Utils.calculateYSparseNumbers(maxItem);
    // y轴参考线
    const yLineList = displayReferenceLine ? Utils.renderYReferenceLines(yTitles, heightRatio, svgChartWidth) : [];
    // y轴标题
    const yTitleList = this.getYTitleList(yTitles, heightRatio, axisYTitleUnit);

    // 线坐标数组
    this.linePoints = [];
    const count = titleList.length > 1 ? titleList.length - 1 : 1;
    const pointW = svgChartWidth / count; // 两点之间的宽度
    for (let index = 0; index < numberLength; index++) {
      const list = [];
      this.displayList.forEach((item, idx) => {
        const num = item.numbers[index];
        list.push(pointW * idx + ',' + (chartMaxHeight - num * heightRatio));
      });
      this.linePoints.push(list);
    }
    // 处理x轴展示数据问题
    let maxcount = axisXTitleMaxCount;
    if (titleList.length > maxcount) {
      maxcount = axisXTitleMaxCount - 1;
    }
    // x轴标题
    const xTitleList = Utils.renderXTitles(titleList, true, maxcount, pointW, {
      color: axisTitleColor,
      width: axisXTitleWidth || 40,
    });

    // 线条渐变容器坐标数组
    let polygonPoints = [];
    if (this.linePoints.length) {
      const points = this.linePoints[0];
      polygonPoints = [points[points.length - 1], `${svgChartWidth},${chartMaxHeight}`, `0,${chartMaxHeight}`];
      polygonPoints.push.apply(polygonPoints, points);
    }

    return (
      <View style={[style]}>
        <View style={{flexDirection: 'row'}}>
          <View>{yTitleList}</View>
          <LinearGradientView
            style={[styles.barChartView, {height: svgChartHeight}]}
            colors={backgroundColors}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            {...this.viewPanResponder.panHandlers}>
            {yLineList}
            <Svg
              height={chartMaxHeight}
              width={svgChartWidth}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
              }}>
              {/* 定义渐变 */}
              <Defs>
                <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor={lineFillColors[0]} stopOpacity="0" />
                  <Stop offset="100%" stopColor={lineFillColors[1]} stopOpacity="1" />
                </LinearGradient>
              </Defs>
              {/* 渐变容器 */}
              <Polygon points={polygonPoints.join(' ')} fill="url(#grad)" />
              {/* 折线 */}
              {this.renderLines(this.linePoints)}
              {/* 可移动参考线 */}
              {displayMobileReferenceLine && this.renderMobileReferenceLineY(svgChartWidth)}
              {displayMobileReferenceLine && this.renderMobileReferenceLineX(svgChartHeight)}
              {/* 小点 */}
              {this.linePoints.map((item, index) => (
                <View
                  key={index}
                  style={[styles.linePointView]}
                  ref={ref => {
                    this.linePointViews.push(ref);
                  }}
                />
              ))}
              <LinePointDetailView
                lineProps={this.props}
                ref={ref => {
                  this.pointDetailView = ref;
                }}
              />
            </Svg>
          </LinearGradientView>
        </View>
        <View style={[styles.xTitleList]}>{xTitleList}</View>
      </View>
    );
  }

  renderLines(linePoints) {
    const {linesColor} = this.props;
    return linePoints.map((item, index) => {
      let color = '#5691ff';
      if (linesColor.length) {
        color = linesColor[index];
      }
      return (
        <Polyline
          key={index}
          points={item.join(' ')}
          fill="none" // 填充颜色 无
          stroke={color} // 边框色
          strokeWidth="2" // 边框宽度
        />
      );
    });
  }

  renderMobileReferenceLineY(width) {
    return (
      <View
        style={styles.mobileReferenceLineY}
        ref={ref => {
          this.referenceLineY = ref;
        }}>
        <Svg height="2" width={width}>
          <Line x1="0" y1="0" x2={width} y2="0" stroke={this.props.mobileReferenceLineColor} strokeWidth="2" strokeDasharray={[3, 3]} />
        </Svg>
      </View>
    );
  }

  renderMobileReferenceLineX(height) {
    return (
      <View
        style={styles.mobileReferenceLineX}
        ref={ref => {
          this.referenceLineX = ref;
        }}>
        <Svg height={height} width="2">
          <Line x1="0" y1="0" x2="0" y2={height} stroke={this.props.mobileReferenceLineColor} strokeWidth="2" strokeDasharray={[3, 3]} />
        </Svg>
      </View>
    );
  }

  // ======== MARK: calculates =======

  // 获取Y轴标题数组
  getYTitleList(items, heightRatio, unit) {
    const yTitleList = [];
    items.forEach((item, index) => {
      const style = [styles.yTitleListText, {bottom: item * heightRatio, color: this.props.axisTitleColor}];
      yTitleList.push(
        <Text key={index} style={style} numberOfLines={1}>
          {item + unit}
        </Text>,
      );
    });
    return yTitleList;
  }

  // 查找X轴上离最近的距离的折现点
  searchMinimumRangeLinePoint(point) {
    if (!this.linePoints || this.linePoints.length === 0) {
      return null;
    }
    const points = this.linePoints[0];
    let xlist = points.map(item => {
      return item.split(',')[0];
    });
    let index = Utils.binarySearch(xlist, 0, xlist.length, point.x);
    if (index !== -1) {
      const xy = [];
      this.linePoints.forEach(item => {
        let ps = item[index].split(',');
        xy.push({x: parseInt(ps[0]), y: parseInt(ps[1])});
      });
      return {points: xy, index: index};
    } else {
      return null;
    }
  }

  // 计算浮动小点的位置
  calculatePointPosition(point, size) {
    let top = point.y - size.height - 4;
    let left = point.x - size.width - 4;
    if (top < 0) {
      top = point.y + 5;
    }
    if (left < 0) {
      left = point.x + 5;
    }
    return {left, top};
  }

  // 获取图表容器实际宽度
  getChartWidth() {
    const style = this.props.style || {};
    if (style.paddingHorizontal) {
      return style.width - style.paddingHorizontal;
    }
    return style.width;
  }
}

class LinePointDetailView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      numbers: [],
    };
  }

  // 使用此set方法设置内容
  setContent(title, numbers, complete) {
    this.setState({title, numbers}, complete);
  }

  render() {
    const lineProps = this.props.lineProps;
    const {numbers, title} = this.state;
    return (
      <View
        style={styles.linePointDetailView}
        ref={ref => {
          this.contentView = ref;
        }}>
        <Text style={[styles.linePointDetailText, {fontWeight: '500'}]}>{title}</Text>
        {numbers.map((item, index) => {
          let color = '#5691ff';
          if (lineProps.linesColor.length) {
            color = lineProps.linesColor[index];
          }
          return (
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 3}}>
              {/* 只存在一条折线，不需要显示标识 */}
              {numbers.length === 1 ? null : <View style={{width: 4, height: 4, backgroundColor: color, borderRadius: 2}} />}
              <Text key={index} style={[styles.linePointDetailText, {marginLeft: 3}]}>
                {item + lineProps.axisYTitleUnit}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  barChartView: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    flex: 1,
    marginLeft: 24,
  },
  xTitleList: {
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    marginLeft: 24,
    height: 25,
    alignItems: 'center',
    position: 'relative',
  },
  yTitleListText: {
    fontSize: 10,
    color: '#999',
    width: 24,
    position: 'absolute',
  },
  linePointView: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6198ff',
    position: 'absolute',
    opacity: 0,
  },
  linePointDetailView: {
    position: 'absolute',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#c0c4cc',
    opacity: 0,
  },
  linePointDetailText: {
    fontSize: 12,
    color: '#fff',
  },
  mobileReferenceLineY: {
    height: 0.5,
    position: 'absolute',
    opacity: 0,
  },
  mobileReferenceLineX: {
    width: 0.5,
    position: 'absolute',
    opacity: 0,
  },
});

const customLayoutAnimation = {
  duration: 200,
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
  },
};
