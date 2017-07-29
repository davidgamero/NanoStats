import React from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity, AsyncStorage, FlatList, Picker, Keyboard, Alert, Platform, RefreshControl, ScrollView } from 'react-native';
import autobind from 'autobind-decorator'
import { StackNavigator } from 'react-navigation';

//style sheet resource info
const styles = StyleSheet.create({
  cardTextInput: {
    height: (Platform.OS == 'android' ? 40 : 20),
  },
  headerTouchableText: {
    marginLeft: 20,
    marginRight: 20,
    color: '#2196F3',
  },
  cardText: {
    margin: 5,
    padding: 0,
    fontSize: 15,
  },
  cardItem: {
    margin: 10,
    marginBottom: 0,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  homeNewAddressButton: {
    
  },
  homeAddressItemText: {

  },
  button: {
    marginTop: 20,
    margin: 10,
    alignItems: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 5
  },
  buttonText: {
    padding: 5,
    color: 'white',
    fontSize: 20
  },
  avgHashBar: {
    backgroundColor:'#2196F3',
    borderRadius: 5,
  },
  nowHashBar: {
    backgroundColor:'#7bdb78',
    borderRadius: 5,
  },
  hashBarBG: {
    backgroundColor:'white'
  },

//older
  myListItem: {
    height: 50,
  },
  viewTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 50,
    alignSelf: 'center',
  },
  balanceText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 30,
    alignSelf: 'center',
  },
  addressInput: {
    height: 40,
    color: 'black',
    backgroundColor: 'white',
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


const HashrateUnits = {
  ETH: 'Mh/s',
  SIA: 'Mh/s,'
}

class HomeScreen extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      pairs: null,
    };
  }

  @autobind
  fetchData(){
    if(this.state.pairs){
      for(var i = 0; i<this.state.pairs.length; i++){
        //once per pair
        try{
          if(this.state.pairs[i].cryptocurrency == 'ETH'){
            fetch('https://etherchain.org/api/account/' + this.state.pairs[i].address)
              .then((response) => response.json())
              .then((responseJson) => {
                p = this.state.pairs;

                this.addBalanceData(responseJson.data);
              })
              .catch((error) => {
                console.error(error);
              }
            );
          }
        } catch(e){
          console.log('Error parsing JSON for balance data');
        }
      }
    }
  }

  @autobind
  addBalanceData(data){
    balance = data[0] ? data[0].balance : null;
    address = data[0] ? data[0].address : null;

    p = this.state.pairs;
    for(var i = 0; i<p.length; i++){
      //once per pair
      if(p[i].address == address){
        //add address to the pair object in the pairs array
        p[i].balance = balance;

      }
    }
    this.setState({
      pairs: p,
    });
  }


  componentDidMount(){
    //AsyncStorage.setItem('@DatStore:addresses','[]');
    this.loadPairs().then(() =>{
      //after pairs are loaded
      this.fetchData()
    });
  }

  loadPairs() {
    return AsyncStorage.getItem('@DatStore:addresses')
      .then((pp) => {
        this.setState({
          pairs: JSON.parse(pp)
        },(e)=>{
            //do nothing about the errors here
          });
      });
  }

  @autobind
  promptDeletePair(pair) {
    Alert.alert(
      'Delete Address?',
      pair.name + '\n'
      + pair.cryptocurrency + '\n'
      + pair.address,
      [
        {text: 'Yes', onPress: () => this.deletePair(pair)},
        {text: 'No'}
      ],
    )
  }

  deletePair(pair) {
    AsyncStorage.getItem('@DatStore:addresses')
      .then(async (pairs) => {
        //parse strigified object
        data = JSON.parse(pairs);

        testFunc = (p) => {
          if(
          p.address == pair.address &&
          p.name == pair.name &&
          p.cryptocurrency == pair.cryptocurrency){
            return true;
          }
          return false;
        };

        //find the entry to delete
        toDeleteIndex = data.findIndex(testFunc);

        //remove the long pressed and confirmed entry
        data.splice(toDeleteIndex,1);

        try{
          //update the stored pair list
          AsyncStorage.setItem('@DatStore:addresses',JSON.stringify(data)).then((f) =>{
            //reload the list of entries
            this.loadPairs();
          });

        }catch(e){
          console.log('Failed to delete pair');
        }
        
      });
  }

  @autobind
  navToAddressStats(pair){
    const { navigate } = this.props.navigation;
    navigate('AddressStats',pair);
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={{flex:1, justifyContent: 'center'}}>
        <View style={{flex:1, justifyContent: 'center'}}>
          <TouchableOpacity onPress={() => navigate('NewAddress')} style={styles.homeNewAddressButton}>
            <View style={styles.button}>
                <Text style={styles.buttonText}>New Address</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{flex: 10,}}>
          <AddressList style={{flex: 9,}}
            data={this.state.pairs}
            extraData={this.state}
            onPressItem={this.navToAddressStats}
            onLongPressItem={this.promptDeletePair}
            onRefresh={this.fetchData}
          />
        </View>
      </View>
    );
  }
}

class NewAddressScreen extends React.Component {
  static navigationOptions = {
    title: 'New Address',
  };

  constructor(props){
    super(props);
    this.state = {newAddress: null,cryptocurrency: 'ETH',name:null};
  }

  componentDidMount(){
    this.loadAddresses();
  }

  loadAddresses() {
    return AsyncStorage.getItem('@DatStore:addresses')
      .then((add) => {
        this.setState({
          addresses: add
        },(e)=>{
            //do nothing about the errors here
          });
      }).catch(error => {
        this.setState({
          addresses: []
        });
      });
  }

  saveNewAddressAndHome() {
    const { navigate } = this.props.navigation

    AsyncStorage.getItem('@DatStore:addresses')
      .then(async (pairs) => {
        //parse strigified object
        data = JSON.parse(pairs);

        //the new currency-address pair
        //take everything after last slash
        var parsed;
        try{
          var n = this.state.newAddress.lastIndexOf('/');
          parsed = this.state.newAddress.substring(n + 1);
        }catch(e){
          console.log('Error parsing new address string')
          console.log(e);
        }
        newPair = {cryptocurrency: this.state.cryptocurrency,address: (parsed == -1)? this.state.newAddress: parsed,name: this.state.name};
        
        //if there is already a pair array
        if(data){
          //append the new pair to the end
          try {
            data.push(newPair);
          }catch (e){
            console.log('Failed to append new data pair');
          }
        }else{
          //no data, make the array
          data=[newPair];
        }

        try{
          //update the stored pair list
          await AsyncStorage.setItem('@DatStore:addresses',JSON.stringify(data));

          //go back home
          navigate('Home');

          //dismiss the keyboard
          try {
            Keyboard.dismiss();
          }catch(e){
            console.log('Failed to dismiss Keyboard');
          }

        }catch(e){
          console.log('Failed to  store updated addresses or navigate to Home');
        }
        
      });
  }


  render() {
    return (
      <View style={{flex:1, }}>
        <View style={styles.cardItem}>
          <TextInput  
              style={styles.cardText, styles.cardTextInput}
              placeholder={'Account Nickname'}
              onChangeText={(name) => this.setState({'name': name})}
            />
          <Picker
            selectedValue={this.state.cryptocurrency}
            onValueChange={(itemValue,itemIndex) => this.setState({'cryptocurrency': itemValue})}>
            <Picker.Item label={'Ethereum'} value={'ETH'}/>
            <Picker.Item label={'Siacoin'} value={'SIA'}/>
          </Picker>
          <TextInput  
              style={styles.cardText, styles.cardTextInput}
              placeholder={'Address'}
              onChangeText={(address) => this.setState({'newAddress': address})}
            />
        </View>
        <View style={styles.homeNewAddressButton}>
          <TouchableOpacity onPress={() => this.saveNewAddressAndHome()} style={styles.homeNewAddressButton}>
              <View style={styles.button}>
                  <Text style={styles.buttonText}>Add Address</Text>
              </View>
            </TouchableOpacity>
        </View>
      </View>
    );
  }
}

class AddressListItem extends React.PureComponent {
  _onPress = () => {
    this.props.onPressItem(this.props.item);
  };

  _onLongPress = () => {
    this.props.onLongPressItem(this.props.item);
  };

  render() {
    return (
      <TouchableOpacity
      onPress={this._onPress}
      onLongPress={this._onLongPress}>
        <View style={styles.cardItem}>
          <Text style={styles.homeAddressItemText}>{this.props.item.name + ' : ' + this.props.item.cryptocurrency}</Text>
          <Text style={styles.homeAddressItemText}>{this.props.balance ? 'Balance: ' + wei2Rounded(this.props.balance,4) : 'No balance found'}</Text>
          <Text style={styles.homeAddressItemText}>{this.props.item.address}</Text>
        </View>
      </TouchableOpacity>
    )
  }
}

class AddressList extends React.PureComponent {
  state = {
    selected: (new Map(): Map<string, boolean>),
    refreshing: false,
  };

  _keyExtractor = (item, index) => item.address;

  _onPressItem = (pair) => {
    this.props.onPressItem(pair);
  };

  _onLongPressItem = (pair) => {
    this.props.onLongPressItem(pair);
  };

  _onRefresh() {
    this.setState({refreshing: true});
    this.props.onRefresh();
    //fetchData().then(() => {
    this.setState({refreshing: false});
    //});
  }

  _renderItem = ({item}) => (
    <AddressListItem
      props={item}
      item={item}
      balance={item.balance}
      onPressItem={this._onPressItem}
      onLongPressItem={this._onLongPressItem}
      selected={!!this.state.selected.get(item.id)}
    />
  );

  render() {
    return (
      <FlatList
        data={this.props.data}
        extraData={this.state}
        keyExtractor={this._keyExtractor}
        renderItem={this._renderItem}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}
          />
        }
      />
    );
  }
}


class AddressStatsScreen extends React.Component {
  static navigationOptions = ({navigation}) => ({
    title: `${navigation.state.params.cryptocurrency + ' : ' + navigation.state.params.name}`,
  });

  constructor(props){
    super(props);
    this.state = {
      balance: ' ',
      avghashrate: null,
      accountData: {},
      currentHashratePercent: 0.0,
      workers: [],
      cryptocurrency: '',
      address: '',
      chartData: [],
      miningChartHours: 6,
    };
  }

  componentDidMount(){
    this.fetchInfo();

    //import the nav states to the main state
    const { params } = this.props.navigation.state;

    this.setState({
      cryptocurrency: params.cryptocurrency,
      address: params.address,
    });
  }

  fetchInfo() {
    const { params } = this.props.navigation.state;
    //fetch balance
    fetch('https://api.nanopool.org/v1/' + params.cryptocurrency.toString().toLowerCase() + '/balance/' + params.address.toString())
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          //update the balance state
          balance: responseJson.data ? responseJson.data : 'Account not found',
        }, function() {
          // do something with new state
        });
        //got the balance
      })
      .catch((error) => {
        console.error(error);
      });

    //fetch user overview data
    fetch('https://api.nanopool.org/v1/' + params.cryptocurrency.toString().toLowerCase() + '/user/' + params.address.toString())
      .then((response) => response.json())
      .then((responseJson) => {
        if(responseJson.data){
          this.setState({
            //update the balance state
            accountData: responseJson.data,
            avghashrate: responseJson.data.avgHashrate,
            workers: responseJson.data.workers,
          }, function() {
            // do something with new state
            this.parseAvgHashrates();
          });
          //console.log(responseJson.data);
        }
      })
      .catch((error) => {
        console.error(error);
    });

    //fetch account hashrate historical data
    fetch('https://api.nanopool.org/v1/' + params.cryptocurrency.toString().toLowerCase() + '/hashratechart/' + params.address.toString())
      .then((response) => response.json())
      .then((responseJson) => {
        if(responseJson.data){
          this.setState({
            //update the state
            chartData: responseJson.data,
          }, function() {
            //do something wit fetched data
          });
          //console.log(responseJson.data);
        }
      })
      .catch((error) => {
        console.error(error);
    });


  }

  @autobind
  parseAvgHashrates(){
    const { params } = this.props.navigation.state;

    times = [1,3,6,12,24];
    s = [];

    //declare hash max and min at function scope
    hashMax = null;
    hashMin = null;
    if(this.state.avghashrate){
      //set first hashrate to both min and max
      hashMax = parseInt(this.state.avghashrate['h' + times[0].toString()]);
      hashMin = parseInt(this.state.avghashrate['h' + times[0].toString()]);
      for(var i = 1;i < times.length; i++ ){
       
        //next hashrate
        h = parseInt(this.state.avghashrate['h' + times[i].toString()]);
        hashMax = h > parseInt(hashMax) ? h : hashMax;
        hashMin = h < parseInt(hashMin) ? h : hashMin; 
      }
      h = parseInt(this.state.accountData.hashrate);
      hashMax = h > parseInt(hashMax) ? h : hashMax;
      hashMin = h < parseInt(hashMin) ? h : hashMin; 

    }

    //generate the average hashrate line objects
    for(var i = 0;i < times.length; i++ ){
      s.push({
        time: times[i].toString(),
        rateText: (this.state.avghashrate ? Math.round(this.state.avghashrate['h' + times[i].toString()]) : '...') + HashrateUnits[params.cryptocurrency],
        rateDispPercent: (this.state.avghashrate ? (this.state.avghashrate['h' + times[i].toString()]) : 0)/(hashMax ? hashMax : 1)
      });
    };
    currPercent = (this.state.accountData.hashrate? this.state.avghashrate: 0)/(hashMax ? hashMax : 1);
    
    this.setState(
      (prev)=>{
        return({
          parsedHashrates: s,
          currentHashratePercent: (this.state.accountData.hashrate)/(hashMax ? hashMax : 1),
        })
      },
      (a)=>{

      }
    );
  }

  render() {
    const { params } = this.props.navigation.state;
    return (
      <RefreshableScrollView
      style={{flex:1, backgroundColor:'white' }}>
        <View style={styles.cardItem}>
          <Text style={styles.cardText}>
            {'Balance : ' + this.state.balance + '\n' + params.address}
          </Text>
        </View>
        <View style={styles.cardItem}>
          <MiningChart
            data={this.state.chartData}
            hours={'24'}
            height={100}
          />
        </View>
        <View style={styles.cardItem}>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={{flex: 1, marginRight: 5}}>
              <Text style={{textAlign: 'right',}}>{'Now'}</Text>
            </View>
            <View style={{flex: 3}}>
              <Text>{'Current Hashrate:' + (this.state.accountData && this.state.accountData.hashrate)?this.state.accountData.hashrate:'nah'}</Text>
            </View>
            <View style={{flex: 8, margin: 2}}>
              <HorizPercentBar  
                  percent={this.state.currentHashratePercent}
                  barStyle={styles.nowHashBar}
                  barBackgroundStyle={styles.hashBarBG}/>
            </View>
            
          </View>
          <AvgHashratesBarChart
            hashrates={this.state.parsedHashrates}/>
        </View>
        <View style={styles.cardItem}>
          <WorkerTable
            data={this.state.workers}
            hashrateUnit={HashrateUnits[this.state.cryptocurrency]}
          />
        </View>
      </RefreshableScrollView>
    );
  }
}

class HorizPercentBar extends React.Component {
    constructor(props) {
    super(props);
    this.state = {percent: 0};
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

class VertPercentBar extends React.Component {
    constructor(props) {
    super(props);
    this.state = {percent: 0};
  }

  render() {
    return(
        <View style={{flex: 1,}}>
          <View style={[{flex: 10.0 - (this.props.percent * 10.0)}, this.props.barBackgroundStyle]}/>
          <View style={[{flex: this.props.percent * 10.0}, this.props.barStyle]}/>
        </View>
    )
    return null
  }
}

/** 
props:
  hashrates - array of hashrates objects
*/
class AvgHashratesBarChart extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View>
        {this.props.hashrates ? this.props.hashrates.map(function(rateSet,index){
          return (
            <View style={{flexDirection: 'row'}} key={index}>
              <View style={{flex: 1, marginRight: 5}}>
                <Text style={{textAlign: 'right',}}>{rateSet.time + 'h'}</Text>
              </View>
              <View style={{flex: 3}}>
                <Text style={{textAlign: 'left',}}>{rateSet.rateText}</Text>
              </View>
              <View style={{flex: 8,margin: 2}}> 
                <HorizPercentBar  
                  percent={rateSet.rateDispPercent}
                  barStyle={styles.avgHashBar}
                  barBackgroundStyle={styles.hashBarBG}/>
              </View>
            </View>
          )})
        : null
        }
      </View>
    )
  }
}

class WorkerTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View>
        <View style={{flexDirection: 'row', margin: 5}}>
              <View style={{flex: 1, marginRight: 5}}>
                <Text style={{textAlign: 'right',}}>{'Worker'}</Text>
              </View>
              <View style={{flex: 1, marginRight: 5}}>
                <Text style={{textAlign: 'right',}}>{'Current'}</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={{textAlign: 'right',}}>{'6h'}</Text>
              </View>
              <View style={{flex: 1,margin: 2}}> 
                <Text style={{textAlign: 'right',}}>{'12h'}</Text>
              </View>
              <View style={{flex: 2}}>
              </View>
          </View>
        {this.props.data ? this.props.data.map(function(worker,index){
          return (
            <View style={{flexDirection: 'row', margin: 5}} key={index}>
              <View style={{flex: 1, marginRight: 5}}>
                <Text style={{textAlign: 'right',}}>{worker.id}</Text>
              </View>
              <View style={{flex: 1, marginRight: 5}}>
                <Text style={{textAlign: 'right',}}>{worker.hashrate}</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={{textAlign: 'right',}}>{worker.avg_h6}</Text>
              </View>
              <View style={{flex: 1,margin: 2}}> 
                <Text style={{textAlign: 'right',}}>{worker.avg_h12}</Text>
              </View>
              <View style={{flex: 2}}>
              </View>
            </View>
          )})
        : null
        }
      </View>
    )
  }
}

class MiningChart extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    //the data to plot
    data = []
    numPoints = this.props.data.length

    //if a nonzero time range was supplied as a prop
    if(this.props.hours){
      //get number of data points to use (zero means use all)
      numPoints = parseInt(this.props.hours) * 6

      //take numPoints entries from the end of the array
      data = this.props.data.slice(this.props.data.length - numPoints)
    }else{
      //default to all data if no time range supplied
      data = this.props.data
    }

    //how many bars to display
    numBars = this.props.bars ? this.props.bars : this.props.hours;

    //in Mh/s
    //console.log(data);
    //hashrateData = data.map(function(a) {return Math.round(a.hashrate / 1000)});
    hashrateData = data.map(function(a) {return Math.round(a.hashrate / 1000)});
    sharesData = data.map(function(a) {return Math.round(a.shares)});

    max = getMaxOfArray(hashrateData);
    min = getMinOfArray(hashrateData);

    //scale using max-min= 50%
    mid = 0.5*(max+min);
    fiftyRange = max-min;
    breakPoint = mid - (fiftyRange);

    //array to hold the bars' data
    barData = [];
    //how many data points each bar averages
    incrementLength = hashrateData.length / numBars;

    for(i = 0; i < numBars; i++){
      thisBarData = hashrateData.slice(parseInt(i*incrementLength), (i + 1)*incrementLength);
      barData.push(thisBarData);
//      console.log(thisBarData);
    }


    //console.log(barData);

    //console.log(arrToPercentOfMax(getMeanOfArrayRows(barData)));


    barPercents = arrToPercentOfMax(getMeanOfArrayRows(barData));

    return(<View style={{flex: 1}}>
      <Text>{'Hashrate'}</Text>
      <View style={{flexDirection: 'row', margin: 5, display: 'flex', height: this.props.height ? this.props.height : 100}}>
        {barPercents ? barPercents.map(function(percent,index){
          return (
            <View 
            style={{flex: 1, margin: 2.5}}
            key={index}>
              <VertPercentBar style={{flex:1,}}
                percent={percent}
                barStyle={styles.avgHashBar}
                barBackgroundStyle={styles.hashBarBG}
              />
            </View>
          )})
        : null
        }
      </View>
      <Text>{'Shares'}</Text>
      <BarChart
          data={sharesData}
          bars={12}
          height={100}
          barStyle={styles.avgHashBar}
          barBackgroundStyle={styles.hashBarBG}
          />
      </View>
    )

  }
}

class BarChart extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {   
    data = this.props.data;

    numBars = this.props.bars ? this.props.bars : this.props.hours;

    max = getMaxOfArray(data);
    min = getMinOfArray(data);

    //scale using max-min= 50%
    mid = 0.5*(max+min);
    fiftyRange = max-min;
    breakPoint = mid - (fiftyRange);

    //array to hold the bars' data
    barData = [];
    //how many data points each bar averages
    incrementLength = hashrateData.length / numBars;

    for(i = 0; i < numBars; i++){
      thisBarData = data.slice(parseInt(i*incrementLength), (i + 1)*incrementLength);
      barData.push(thisBarData);
//      console.log(thisBarData);
    }

    barPercents = arrToPercentOfMax(getMeanOfArrayRows(barData));

    console.log(barPercents);

    return (
      <View style={{flexDirection: 'row', margin: 5, display: 'flex', height: this.props.height ? this.props.height : 100}}>
        {barPercents ? barPercents.map(function(percent,index){
          console.log(percent);
          return (
            <View 
            style={{flex: 1, margin: 2.5}}
            key={index}>
              <VertPercentBar style={{flex:1,}}
                percent={percent}
                barStyle={styles.avgHashBar}
                barBackgroundStyle={styles.hashBarBG}
               />
            </View>
          )})
        : null
        }
      </View>
    )
  }
}

class RefreshableScrollView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
    };
  }

  fetchData(){
    console.log('refreshing');
  }

  @autobind
  _onRefresh() {
    this.setState({refreshing: true});
    this.setState({refreshing: false});
  }

  render() {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}
          />
        }
      >
      {this.props.children}
      </ScrollView>
    );
  }
}

function getMaxOfArray(numArray) {
  if (!numArray || numArray.length == 0) {
    return null;
  }
  return Math.max.apply(null, numArray);
}

function getMinOfArray(numArray) {
  if (!numArray || numArray.length == 0) {
    return null;
  }
  return Math.min.apply(null, numArray);
}

function arrToPercentOfMax(arr) {
  try {
    max = getMaxOfArray(arr);
    return arr.map((a) => {return (a*1.0) / (max*1.0)})
  } catch(e){
    console.log(e);
  }
  return null;
}

function getMeanOfArray(arr){
  if (!arr || arr.length == 0){
    return null;
  }
  return arr.reduce(function(a,b){return a+b;}) / arr.length;
}

function getMeanOfArrayRows(arr){
  try{
    return arr.map((a) => {return getMeanOfArray(a)});
  }catch(e){
    console.log(e);
    return null;
  }
}

/** Convert wei to ethereum
*/
function wei2Eth(wei){
  w = parseFloat(wei);
  return (w / (1e18));
}

/** Convert wei to ethereum and round at digits
*/
function wei2Rounded(wei,digits){
  return (wei2Eth(wei)).toFixed(digits)
}

const App = StackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: ({navigate}) => ({
      title: 'NanoStats',
      headerLeft: null,

    }),
  },
  NewAddress: {
    screen: NewAddressScreen,
  },
  AddressStats: {
    screen: AddressStatsScreen,
  },
});

export default App;
