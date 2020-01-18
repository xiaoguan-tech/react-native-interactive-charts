/**
 * @author wushanshan
 * @func 柱状图
 * @time 2019/12/06
 */
import React, {Component, PureComponent} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  PanResponder,
  LayoutAnimation,
  UIManager,
  findNodeHandle,
  ScrollView,
  TouchableHighlight,
} from 'react-native';
import Svg, {Line, Polyline, Defs, Stop, LinearGradient, Polygon} from 'react-native-svg';
import LinearGradientView from 'react-native-linear-gradient';
import Utils from './utils';

const {width} = Dimensions.get('window');

class BarPointDetailView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      number: '',
    };
  }

  setContent(title, number, complete) {
    this.setState({title, number}, complete);
  }

  render() {
    return (
      <View
        style={styles.barPointDetailView}
        ref={ref => {
          this.contentView = ref;
        }}>
        <Text style={[styles.barPointDetailText, {fontWeight: '500'}]}>{this.state.title}</Text>
        <Text style={[styles.barPointDetailText, {marginTop: 3}]}>{this.state.number}</Text>
      </View>
    );
  }
}

class BarItem extends Component {
  _onPressBar = () => {
    console.log('showdetail');
  };

  render() {
    const {barWidth, h, title, w} = this.props;
    const style = {width: barWidth, height: h};
    return (
      <TouchableHighlight onPress={this._onPressBar} activeOpacity={0.9} underlayColor="rgba(0,0,0,0.1)">
        <View style={{...styles.barChartItemView, width: w}}>
          <Text style={styles.barChartItemTitle}>{title}</Text>
          <LinearGradientView style={style} colors={['#fea649', '#fe8145']} start={{x: 0, y: 0}} end={{x: 0, y: 1}} />
        </View>
      </TouchableHighlight>
    );
  }
}

export default class BarChart extends Component {
  static defaultProps = {
    sourceList: [], // 图表数据源 {number: Number, title: String}
  };

  constructor(props) {
    super(props);
    this.linePointView = null; // 选中的折线点
    this.linePoints = []; // 折现点坐标数组
    this.displayList = []; // 实际显示的坐标，因为横坐标最多显示`xMaxCount`个标题，如果不是`xMaxCount`的倍数，余数将会被舍弃
    this.options = {
      xMaxCount: 6,
      YMaxCount: 6,
      w: 50, // 单条数据宽度
      barWidth: 16, // 柱子宽度，默认16
    };
    this.state = {
      barList: [],
      xTitleList: [],
      yTitleList: [],
      yLineList: [],
    };
  }
  componentDidMount() {
    const {options, sourceList} = this.props;
    this.options = Object.assign(this.options, options);
    const {xMaxCount} = this.options;
    this.calcBarWidth();
    this.convertData();
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
      this.convertData();
    }
  }
  convertData() {
    const sourceList = this.props.sourceList;
    const {xValue, yUnit, yValue, w, barWidth} = this.options;
    let numList = sourceList.map(item => Number(item[yValue]));
    let maxItem = 1;
    if (sourceList.length) {
      maxItem = Utils.searchMaxItem(numList); // 计算最大值
    }
    let heightRatio = Utils.calculateHeightRatio(maxItem, chartMaxHeight); // 高度系数
    // 计算y轴稀疏标题
    const yTitles = Utils.calculateYSparseNumbers(maxItem);
    // y轴参考线
    const yLineList = Utils.renderYReferenceLines(yTitles, heightRatio, width - 60);
    // y轴标题
    const yTitleList = this.getYTitleList(yTitles, heightRatio, yUnit);
    // x轴标题
    const xTitleList = this.getXTitleList(sourceList);
    // 图表数组
    const barList = [];
    sourceList.forEach(item => {
      const h = item[yValue] * heightRatio;
      const title = item[yValue] + yUnit;
      barList.push(<BarItem h={h} w={w} barWidth={barWidth} title={title} key={item[xValue]} />);
    });
    this.setState({
      barList,
      xTitleList,
      yTitleList,
      yLineList,
    });
  }
  // 计算单个柱子的宽度
  calcBarWidth() {
    const {sourceList} = this.props;
    const {xMaxCount} = this.options;
    let perBarWidth = 0;
    if (sourceList.length > xMaxCount) {
      perBarWidth = (width - 65) / xMaxCount;
    } else {
      perBarWidth = (width - 65) / sourceList.length;
    }
    this.options.w = perBarWidth;
  }

  // 获取Y轴标题数组
  getYTitleList(items, heightRatio, unit) {
    const yTitleList = [];
    items.forEach((item, key) => {
      const style = {
        fontSize: 10,
        color: '#999',
        width: 24,
        height: 12,
        position: 'absolute',
        bottom: item * heightRatio,
      };
      yTitleList.push(
        <Text style={style} key={`${item}-${key}`} numberOfLines={1}>
          {`${item}${unit}`}
        </Text>,
      );
    });
    return yTitleList;
  }

  // 获取X轴标题数组 isSparse:是否稀释
  getXTitleList(items, isSparse = false) {
    const {xValue, yUnit, yValue, xMaxCount, w} = this.options;
    const xTitleList = [];
    let array = [];
    if (items.length > xMaxCount && isSparse) {
      const range = Math.floor(items.length / xMaxCount);
      for (let index = 0; index < items.length; index += range) {
        array.push(items[index]);
      }
    } else {
      array = items;
    }
    array.forEach(item => {
      const style = {
        fontSize: 10,
        color: '#999',
        textAlign: 'center',
        width: w,
      };
      xTitleList.push(
        <Text key={item[xValue]} style={style}>
          {item[xValue]}
        </Text>,
      );
    });
    return xTitleList;
  }

  // 获取柱形数组
  getBarItemList(sourceList) {
    const {heightRatio} = this.state;
    const {w, h, barWidth, yUnit} = this.options;
    const barList = [];
    sourceList.forEach(item => {
      const h = item[yValue] * heightRatio;
      const title = item[yValue] + yUnit;
      barList.push(<BarItem h={h} w={w} barWidth={barWidth} title={title} key={item[xValue]} />);
    });
  }
  render() {
    const {barList, yTitleList, yLineList, xTitleList} = this.state;
    const {w, referenceLine} = this.options;
    const {style} = this.props;
    return (
      <View
        style={{
          width: width - 40,
          marginHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'flex-start',
          ...style,
        }}>
        <View style={{width: 24, ...styles.yTitleStyle}}>{yTitleList}</View>
        <ScrollView style={{...styles.scrollView}} horizontal={true} directionalLockEnabled={true} showsHorizontalScrollIndicator={false}>
          <View style={styles.scrollItem}>
            <LinearGradientView
              style={[styles.barChartView, {width: barList.length * w}]}
              colors={['#fffffe', '#f7f2ea']}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 1}}>
              {referenceLine ? yLineList : null}
              {barList}
            </LinearGradientView>
            <View style={[styles.xTitleList, {justifyContent: 'space-between'}]}>{xTitleList}</View>
          </View>
          <BarPointDetailView />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  barPointDetailView: {
    position: 'absolute',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#c0c4cc',
    opacity: 0,
  },
  barPointDetailText: {
    fontSize: 12,
    color: '#fff',
  },
  xTitleList: {
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    marginTop: 5,
  },
  scrollItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  yTitleStyle: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: 180,
  },
  barListView: {
    backgroundColor: 'red',
  },
  scrollView: {
    flex: 1,
  },
  barChartView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: -1,
    height: 180,
  },
  barChartItemView: {
    display: 'flex',
    justifyContent: 'flex-end',
    height: 180,
    alignItems: 'center',
  },
  barChartItemTitle: {
    fontSize: 10,
    textAlign: 'center',
    color: '#999',
    marginBottom: 3,
  },
});
const chartMaxHeight = styles.barChartView.height - 30;
