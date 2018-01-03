import React from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity, AsyncStorage, FlatList, Picker, Keyboard, Alert, Platform, RefreshControl, ScrollView, Linking, StatusBar } from 'react-native';
import autobind from 'autobind-decorator'
import { StackNavigator } from 'react-navigation';
import {VertPercentBar,HorizPercentBar} from './js/percent-bar';

//style sheet resource info
themeColor = '#2196F3';

const styles = StyleSheet.create({
  centerText: {
    textAlign: 'center',
  },
  cardTextInput: {
    height: (Platform.OS == 'android' ? 40 : 20),
  },
  headerTouchableText: {
    marginLeft: 20,
    marginRight: 20,
    color: themeColor,
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
  cardItemHeading: {
    textAlign: 'center',
    padding: 2,
    color: themeColor,
    fontSize: 20,

  },
  homeAddressItemHeading: {
    textAlign: 'center',
    padding: 2,
    color: themeColor,
    fontSize: 20,
  },
  homeAddressItemText: {
    textAlign: 'center',
    padding: 2,
    color: 'black',
    fontSize: 15,
  },
  button: {
    marginTop: 20,
    margin: 10,
    alignItems: 'center',
    backgroundColor: themeColor,
    borderRadius: 5
  },
  buttonText: {
    padding: 5,
    color: 'white',
    fontSize: 20
  },
  avgHashBar: {
    backgroundColor: themeColor,
    borderRadius: 5,
  },
  nowHashBar: {
    backgroundColor:'#7bdb78',
    borderRadius: 5,
  },
  repHashBar: {
		backgroundColor: '#888b91',
    borderRadius: 5,
  },
  hashBarBG: {
    backgroundColor:'white'
  },
  hourPickerButton: {
    borderRadius: 5,
    margin: 5,
    backgroundColor: 'white',
    borderColor: themeColor,
    borderWidth: 2,
    alignItems: 'center',
  },
  hourPickerButtonSelected: {
    borderRadius: 5,
    margin: 5,
    backgroundColor: themeColor,
    borderColor: themeColor,
    borderWidth: 2,
    alignItems: 'center',
  },
  hourPickerButtonText:{
    alignSelf: 'center',
    color: themeColor,
    fontSize: 15,
    textAlign: 'center',
    margin: 8,
  },
  hourPickerButtonTextSelected:{
    alignSelf: 'center',
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
    margin: 8,
  },
  githubLink: {
    textAlign: 'center',
    color: themeColor,
    textDecorationLine: 'underline',
  },
  headingLinkText: {
    fontSize: 18,
    color: themeColor,
    marginLeft: 10, 
  },
  infoText: {
    textAlign: 'center',
    padding: 10,
    fontSize: 16,
  },
  infoTextTitle: {
    textAlign: 'center',
    padding: 10,
    fontSize: 20,
  },
  infoLink: {
    textAlign: 'center',
    color: themeColor,
    textDecorationLine: 'underline',
    fontSize: 16,
    padding: 10,
  },
});


const HashrateUnits = {
  ETH: 'Mh/s',
  SIA: 'Mh/s',
  ETC: 'Mh/s',
  ZEC: 'Sol/s',
  XMR: 'H/s',
  PASC: 'MH/s',
}

const HashrateShareFactors = {
  ETH: 8.5,
  SIA: 86,
  ETC: 8.5,
  ZEC: 5.64,
  XMR: 53,
  PASC: 58,
}

class HomeScreen extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      pairs: null,
    };
  }

  static navigationOptions = ({navigation}) => ({
    headerLeft: <TouchableOpacity onPress={()=>navigation.navigate('Info')}><Text style={styles.headingLinkText}>Info</Text></TouchableOpacity>,
  });

  /** Show help information
  */
  showHelp(){
    this.props.navigation.navigate('Info');
  }

  @autobind
  fetchData(){
    var eth_adds = [];
    if(this.state.pairs){
      //get all the ETH addresses
      for(var i = 0; i<this.state.pairs.length; i++){
        //once per pair
        if(this.state.pairs[i].cryptocurrency == 'ETH' && this.state.pairs[i].address){
          eth_adds.push(this.state.pairs[i].address);
        }
      }

      //API limit of 20 per query
      if(eth_adds.length > 20){
        eth_adds = eth_adds.slice(0,20);
      }

      eth_adds_string = eth_adds.join(',');
      //console.log('adds str' + eth_adds_string);

      try{
        fetch('https://api.etherscan.io/api?module=account&action=balancemulti&address=' + eth_adds_string + '&tag=latest&apikey=B1M9IPTS83TC4IAMD7F8ESWMTA8MR3VZ8M')
          .then((response) => {
            try{   
              r = response.json();
              return r;
            }catch(e){
              console.log(e);
            }
          })
          .then((responseJson) => {
            p = this.state.pairs;
            try{
              this.addBalanceData(responseJson.result);
            }catch(e){
              console.log(e);
            }
            
          })
          .catch((error) => {
            console.error(error);
          }
          );
          
        } catch(e){
          console.log('Error parsing JSON for balance data');
        }
    }
  }

  @autobind
  addBalanceData(data){
    if(data){
      data.forEach((entry) => {

        balance = data ? entry.balance : 'No balance found';
        address = data ? entry.account : null;

        //console.log('adding balance for ' + address + ' as ' + balance);

        p = this.state.pairs;
        for(var i = 0; i<p.length; i++){
          //once per pair
          if(p[i].address === address){
            //add address to the pair object in the pairs array
            p[i].balance = balance;

          }
        }
        this.setState({
          pairs: p,
        });
      })
    }

  }

  componentDidMount(){

    //detect first launch
    /** thanks to https://stackoverflow.com/questions/40715266/how-to-detect-first-launch-in-react-native */
    AsyncStorage.getItem("alreadyLaunched").then(value => {
      if(value == null){

        //set launched flag
        AsyncStorage.setItem('alreadyLaunched', '1');

        //add the Demo address to the list if the address list is blank
        AsyncStorage.getItem('@DatStore:addresses')
        .then((add) => {
          if(add == null || add.length < 1){
            //sample address data array
            d = [{
              cryptocurrency: 'ETH',
              address: '0xb576c106e18bc53a0294097b4fe9a525ec38ea5f',
              name: 'Demo',
            }];

            //if the address list is blank
            AsyncStorage.setItem('@DatStore:addresses',JSON.stringify(d));

            //put the pairs into the array
            this.setState({
              pairs: d,
            });

          }    
        }).catch(error => {
          console.log(error);
        });   

        //show help first time
        //this.showHelp();
      }
    });

    //get the currency pairs
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

  @autobind
  _onRefresh(){
    console.log('tryna refresh');
    this.fetchData();
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={{flex:1, justifyContent: 'center'}}>
        <StatusBar
           barStyle={(Platform.OS === 'ios')?'dark-content':'dark-content'}
           backgroundColor="white"
         />
        <View style={{flex:2, justifyContent: 'center'}}>
          <TouchableOpacity onPress={() => navigate('NewAddress')}>
            <View style={styles.button}>
                <Text style={styles.buttonText}>New Address</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{flex: 20,}}>
          <AddressList style={{flex: 9,}}
            data={this.state.pairs}
            extraData={this.state}
            onPressItem={this.navToAddressStats}
            onLongPressItem={this.promptDeletePair}
            onRefresh={this._onRefresh}
          />
        </View>
        <View style={{flex:1}}>
          <Text onPress={() => Linking.openURL('http://www.github.com/david340804/nanostats')} style={styles.githubLink}>{'Peep the Github'}</Text>
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


        if (! parsed){
          //invalid address
          //alert invalid address
          
          return
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
            <Picker.Item label={'Ethereum Classic'} value={'ETC'}/>
            <Picker.Item label={'ZCash'} value={'ZEC'}/>
            <Picker.Item label={'Monero'} value={'XMR'}/>
            <Picker.Item label={'Pascal'} value={'PASC'}/>
          </Picker>
          <TextInput  
              style={styles.cardText, styles.cardTextInput}
              placeholder={'Address or Nanopool URL'}
              onChangeText={(address) => this.setState({'newAddress': address})}
              onSubmitEditing={() => this.saveNewAddressAndHome()}
            />
        </View>
        <View style={styles.homeNewAddressButton}>
          <TouchableOpacity onPress={() => this.saveNewAddressAndHome()}>
              <View style={styles.button}>
                  <Text style={styles.buttonText}>Add Address</Text>
              </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

class InfoScreen extends React.Component {

  goHome(){
    this.props.navigation.navigate('Home');
  }

  render() {

    return (
      <View style={{flex:1, }}>
        <View style={styles.cardItem}>
          <Text  style={styles.infoTextTitle}>Thanks for downloading NanoStats!</Text>
          <Text  style={styles.infoText}>Feel free to check out the Demo address before adding your own :)</Text>
          <Text  style={styles.infoText}>To delete an address, long press its entry on the main NanoStats screen</Text>
          <Text  style={styles.infoText}>Powered by Etherscan.io APIs</Text>
          <Text  style={styles.infoText}>Feedback? Suggestions?</Text>
          <Text  style={styles.infoText}>Please hit me up at</Text>
          <Text onPress={() => Linking.openURL('mailto:david340805@gmail.com')} style={styles.infoLink}>{'david340805@gmail.com'}</Text>
          <Text  style={styles.infoText}>Or drop an issue on the</Text>
          <Text onPress={() => Linking.openURL('http://www.github.com/david340804/nanostats')} style={styles.infoLink}>{'NanoStats Github'}</Text>

          <Text  style={styles.infoText}>To see this again, press "Info" in the Top Left</Text>
          
        </View>
      </View>
    )
  }
}

/**
<TouchableOpacity onPress={() =>this.goHome()}>
  <View style={styles.button}>
    <Text style={styles.buttonText}>Dismiss</Text>
  </View>
</TouchableOpacity>
*/

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
          <Text style={styles.homeAddressItemHeading}>{this.props.item.name + ' : ' + this.props.item.cryptocurrency}</Text>
          {this.props.item.cryptocurrency == 'ETH' ? <Text style={styles.homeAddressItemText}>{this.props.balance ? 'Wallet Balance: ' + wei2Rounded(this.props.balance,4) : '...'}</Text> : null}
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
      balance: '...',
      avghashrate: null,
      accountData: {},
      currentHashratePercent: 0.0,
      workers: [],
      cryptocurrency: '',
      address: '',
      chartData: [],
      miningChartHours: 12,
      miningChartBars: 12,
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
        }
      })
      .catch((error) => {
        console.error(error);
    });

    //fetch account hashrate historical data
    fetch('https://api.nanopool.org/v1/' + params.cryptocurrency.toString().toLowerCase() + '/hashratechart/' + params.address.toString())
      .then((response) => response.json())
      .then((responseJson) => {
        if(responseJson.data && responseJson.data[0]){
        	var d = responseJson.data;

          //console.log('got data len ' + d.length);
          dateSort(d);
          //console.log('sorted length' + d.length);

        	i = 0;	//index we are checking
        	cDate = parseInt(d[0].date);	//timestamp of first data point
        	now = parseInt(Math.round(new Date() / 1000)); //current timestamp

        	while ( parseInt(d[i].date) < (now - (17*60))){
        		//while the current data point is not within the last 15 min

        		fDelta = 0;
        		nextIsBlank =  (d[i+1] == undefined); // if next entry doesn't exist or is falsey
        		if(!nextIsBlank){
        			fDelta = (parseInt(d[i+1].date)-parseInt(d[i].date)); //forwardDelta of date (seconds)
        		}

        		reportingCycles = 10; //first x cycles are logged to console in detail

        		if(nextIsBlank || (fDelta > 600) ){
	       			//if the next point doesn't exist or isn't the next sequential

        			d.splice(i+1,0,
        				{
        					date: parseInt(d[i].date) + (10*60),
        					shares: 0,
                  hashrate: 0,
        				}
        			);

        		}

        		i = i + 1;
        	}


          this.setState({
            //update the state
            chartData: d,
          }, function() {
            //do something wit fetched data
          });
        }
      })
      .catch((error) => {
        console.error(error);
    });


  }

  @autobind
  setMiningChartHours(hours){
    var bars;
    switch(hours){
      case 1:
        bars = 6;
        break;
      case 6:
        bars = 8;
        break;
      case 12:
        bars = 12;
        break;
      case 24:
        bars = 24;
        break;
      default:
        bars = 12;
    }

    this.setState({
      miningChartHours: hours,
      miningChartBars: bars,
    })
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
        rateText: (
          this.state.avghashrate ?
            Math.round(this.state.avghashrate['h' + times[i].toString()]).toString() + ' ' + HashrateUnits[params.cryptocurrency]
          :
            '...'),
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
          <Text style={styles.cardItemHeading}>Info</Text> 
          <Text style={styles.cardText}>
            {'Payout Balance : ' + this.state.balance + '\n' + params.address}
          </Text>
        </View>
        <View style={styles.cardItem}>
          <MiningChart
            data={this.state.chartData}
            cryptocurrency={params.cryptocurrency}
            hours={this.state.miningChartHours}
            bars={this.state.miningChartBars}
            height={100}
          />
          <MiningChartHourPicker
            setHours={this.setMiningChartHours}
            miningChartHours={this.state.miningChartHours}
          />
        </View>
        <View style={styles.cardItem}>
          <Text style={[styles.cardItemHeading, {margin: 5}]}>Averages</Text>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={{flex: 3, marginRight: 5}}>
              <Text style={{textAlign: 'right',}}>{'Now'}</Text>
            </View>
            <View style={{flex: 6}}>
              <Text>{'Current Hashrate:' + (this.state.accountData && this.state.accountData.hashrate)?this.state.accountData.hashrate + ' ' + HashrateUnits[this.state.cryptocurrency]:'nah'}</Text>
            </View>
            <View style={{flex: 14, margin: 2}}>
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
          <Text style={[styles.cardItemHeading, {margin: 5}]}>Workers</Text>
          <WorkerTable
            data={this.state.workers}
            hashrateUnit={HashrateUnits[this.state.cryptocurrency]}
            themeColor={themeColor}
          />
        </View>
        <View style={{height: 10}}/>
      </RefreshableScrollView>
    );
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
              <View style={{flex: 3, marginRight: 5}}>
                <Text style={{textAlign: 'right',}}>{rateSet.time + 'h'}</Text>
              </View>
              <View style={{flex: 6}}>
                <Text style={{textAlign: 'left',}}>{rateSet.rateText}</Text>
              </View>
              <View style={{flex: 14,margin: 2}}> 
                <HorizPercentBar  
                  percent={rateSet.rateDispPercent}
                  barStyle={styles.avgHashBar}
                  barBackgroundStyle={styles.hashBarBG}/>
              </View>
            </View>
          )})
        : <Text>{'Fetching...'}</Text>
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
        <View style={{flexDirection: 'row', margin: 5, borderBottomWidth: 1, borderBottomColor: this.props.themeColor ? this.props.themeColor : 'black'}}>
              <View style={{flex: 1, marginRight: 5}}>
                <Text style={{textAlign: 'right',}}>{'Name'}</Text>
              </View>
              <View style={{flex: 1, marginRight: 5}}>
                <Text style={{textAlign: 'right',}}>{'Current'}</Text>
              </View>
              <View style={{flex: 1,margin: 1}}> 
                <Text style={{textAlign: 'right',}}>{'3h'}</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={{textAlign: 'right',}}>{'6h'}</Text>
              </View>
              <View style={{flex: 1,margin: 1}}> 
                <Text style={{textAlign: 'right',}}>{'12h'}</Text>
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
              <View style={{flex: 1,margin: 2}}> 
                <Text style={{textAlign: 'right',}}>{worker.h3}</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={{textAlign: 'right',}}>{worker.h6}</Text>
              </View>
              <View style={{flex: 1,margin: 2}}> 
                <Text style={{textAlign: 'right',}}>{worker.h12}</Text>
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
    reportedHashrateData = data.map(function(a) {return Math.round(a.hashrate / 1000)});
    sharesData = data.map(function(a) {return Math.round(a.shares)});

    return(
      <View style={{flex: 1}}>
        {this.props.data ? 
        <View style={{flex:2}}>
        <Text style={styles.cardItemHeading}>Calculated Hashrate</Text>
        <BarChart
          data={sharesData}
          shareScaling={true}
          cryptocurrency={this.props.cryptocurrency}
          hours={this.props.hours}
          bars={numBars}
          height={this.props.height}
          barStyle={styles.avgHashBar}
          barBackgroundStyle={styles.hashBarBG}
          />
         </View>
          : <Text>{'Fetching...'}</Text>
        }
        {(this.props.data && (this.props.cryptocurrency == 'ETH' || this.props.cryptocurrency == 'ETC') )? 
        <View style={{flex:1}}>
        <Text style={styles.cardItemHeading}>Reported Hashrate</Text>
        <BarChart
          data={reportedHashrateData}
          cryptocurrency={this.props.cryptocurrency}
          hours={this.props.hours}
          bars={numBars}
          height={this.props.height}
          barStyle={styles.repHashBar}
          barBackgroundStyle={styles.hashBarBG}
          />
         </View>
          : null
        }
      </View>
    )

  }
}

class MiningChartHourPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hours: 12,
    }
    this._setHours = this._setHours.bind(this)
  }

  //pass up the change in hours
  _setHours(hours) {
    if(this.props.setHours){
      this.props.setHours(hours);
    }else{
      console.log('Failed to set mining chart hours in HourPicker');
    }
  }

  render() {
    //possible time ranges in hours
    ranges = [1,6,12,24]

    return (
      <View style={{flexDirection: 'row',height: 50}}>
        {ranges.map((range,index) => {
          return(
            <MiningChartHourPickerButton
              hours={range}
              setHours={this._setHours}
              miningChartHours={this.props.miningChartHours}
              key={range}
            />
          )
        })}
      </View>
    )
  }
}

class MiningChartHourPickerButton extends React.Component {
  constructor(props) {
    super(props);
    this._onPress = this._onPress.bind(this);
  }

  _onPress(){
    if(this.props){
      this.props.setHours(this.props.hours);
    }else{
      console.log('Failed to set mining chart hours in PickerButton');
    }
  }

  render() {
    buttonStyle = this.props.hours == this.props.miningChartHours ? styles.hourPickerButtonSelected: styles.hourPickerButton;
    textStyle = this.props.hours == this.props.miningChartHours ? styles.hourPickerButtonTextSelected: styles.hourPickerButtonText;

    return(
      <TouchableOpacity
      style = {{flex: 1}}
      onPress={this._onPress}>
        <View style={[buttonStyle,{flex: 1,height: 50}]}>
          <Text style={textStyle}>{this.props.hours + 'h'}</Text>
        </View>
    </TouchableOpacity>
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
    incrementLength = data.length / numBars;

    for(i = 0; i < numBars; i++){
      thisBarData = data.slice(parseInt(i*incrementLength), (i + 1)*incrementLength);
      barData.push(thisBarData);
    }

    barPercents = arrToPercentOfMax(getMeanOfArrayRows(barData));

    yLabelStyle = {
      flex: 1,
      borderTopWidth: 1,
    }
    xLabelStyle = {
    	marginBottom: 5,
    }

    scaleFactor = (this.props.shareScaling && this.props.cryptocurrency) ? HashrateShareFactors[this.props.cryptocurrency] : 1;
    labels = [Math.round(max * scaleFactor),Math.round(max*0.5*scaleFactor)];

    return (
    	<View style={{}}>
	      <View style={{flex: 5, flexDirection: 'row', margin: 5, display: 'flex', height: this.props.height ? this.props.height : 100}}>
	        <View style={{ flexDirection: 'column'}}>
	          {labels.map((label,index) => {
	            return (
	              <View style={yLabelStyle} key={index}>
	                <Text>{label}</Text>
	              </View>
	            )
	          })}
	        </View>
	        {barPercents ? barPercents.map((percent,index) => {
	          return (
	            <View 
	            style={{flex: 1, margin: 2.5}}
	            key={index}>
	              <VertPercentBar style={{flex:1,}}
	                percent={
	                	Math.max(0.05,percent) //display a 5% if there is nothing there for aestheics
	                }
	                barStyle={this.props.barStyle}
	                barBackgroundStyle={this.props.barBackgroundStyle}
	               />
	            </View>
	          )})
	        : null
	        }
	        <View style={{ flexDirection: 'column'}}>
	          {labels.map((label,index) => {
	            return (
	              <View style={yLabelStyle} key={index}>
	                <Text style={{textAlign: 'right'}}>{label}</Text>
	              </View>
	            )
	          })}
	        </View>
	      </View>
	      <View style={{flexDirection: 'row'}}>
	      	<View style={[{flex: 1},xLabelStyle]}/>
	      	<View style={[{flex: 6},xLabelStyle]}>
	      			<Text style={{textAlign: 'left'}}>{this.props.hours ? '-' + this.props.hours.toString() + 'h' : '...'}</Text>
	      	</View>
	      	<View style={[{flex: 6},xLabelStyle]}>
	      			<Text style={{textAlign: 'center'}}>{this.props.hours ? '-' + (this.props.hours*0.5).toString() + 'h' : '...'}</Text>
	      	</View>
	      	<View style={[{flex: 6},xLabelStyle]}>
	      			<Text style={{textAlign: 'right'}}>Now</Text>
	      	</View>
	      	<View style={[{flex: 1},xLabelStyle]}/>
	      </View>
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

function dateSort(arr){
  [].sort.call(arr,function(a, b){
      // Compare the 2 dates
      if(a.date < b.date) return -1;
      if(a.date > b.date) return 1;
      return 0;
  });
}

function getMaxOfArray(numArray) {
  if (!numArray || numArray.length == 0) {
    return null;
  }
  return Math.max.apply(null, numArray);
}
function shitSort(arr){
  [].sort.call(arr,function(a, b){
      // Compare the 2 dates
      if(a.date < b.date) return -1;
      if(a.date > b.date) return 1;
      return 0;
  });
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
    return arr.map((a) => {return a == 0 ? 0 : (a*1.0) / (max*1.0)})
  } catch(e){
    console.log(e);
  }
  return null;
}

function arrToPercentOfVal(arr,val) {
  try {
    return arr.map((a) => {return (a*1.0) / (val*1.0)})
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
//      headerLeft: null,

    }),
  },
  NewAddress: {
    screen: NewAddressScreen,
  },
  AddressStats: {
    screen: AddressStatsScreen,
  },
  Info: {
    screen: InfoScreen,
    navigationOptions: ({navigate}) => ({
      title: 'NanoStats Info',
    }),
  }
});

export default App;