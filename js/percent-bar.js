import React from 'react';
import {View, Animated} from 'react-native';
import autobind from 'autobind-decorator'

export class HorizPercentBar extends React.Component {
    constructor(props) {
    super(props);
    this.state = {
      percent: new Animated.Value(0.05),
    };
  }

  render() {
    return(
        <View style={{flexDirection: 'row',flex: 1}}>
          <View style={[{flex: 10.0 - (this.props.percent * 10.0)}, this.props.barBackgroundStyle]}/>
          <View style={[{flex: this.props.percent * 10.0}, this.props.barStyle]}/>
        </View>
    )
    return null
  }
}

// export class VertPercentBar extends React.Component {
//     constructor(props) {
//     super(props);
//     this.state = {
//       barHeight: new Animated.Value(0),
//       barWidth: 0,
//       containerHeight: 0,
//     };
//   }

//   componentDidMount() {

//   }

//   @autobind
//   _onLayout(e){
//     var {x, y, width, height} = e.nativeEvent.layout;
//     var p = Math.max(this.props.percent ? this.props.percent : 0, 0);
    
//     console.log(height);
//     this.setState({
//       barWidth: width,
//       containerHeight: height,
//     });

//     Animated.timing(
//       this.state.barHeight,
//       {
//         toValue: p*height,
//         duration: 500, 
//       }
//     ).start();
//   }

//   render() {

//     return(
//         <View style={{flex: 1, justifyContent: 'flex-end'}} onLayout={this._onLayout}>
//           <Animated.View style={[{height: this.state.barHeight}, this.props.barStyle]}/>
//         </View>
//     )
//     return null
//   }
// }

//
// Working non animated


export class VertPercentBar extends React.Component {
    constructor(props) {
    super(props);
    this.state = {
      percent: 0.05
    };
  }

  componentDidMount() {
    this.state.percent = this.props.percent;
  }

  render() {
    p = this.props.percent;

    return(
        <View style={{flex: 1,}}>
          <View style={[{flex: 10.0 - (p * 10.0)}, this.props.barBackgroundStyle]}/>
          <View style={[{flex: p * 10.0}, this.props.barStyle]}/>
        </View>
    )
    return null
  }
}
