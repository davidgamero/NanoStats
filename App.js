import React from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity, AsyncStorage, FlatList, Picker, Keyboard, Alert, Platform, RefreshControl } from 'react-native';
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
    for(var i = 0; i<this.state.pairs.length; i++){
      //once per pair
      if(this.state.pairs[i].cryptocurrency == 'ETH'){
        fetch('https://etherchain.org/api/account/' + this.state.pairs[i].address)
          .then((response) => response.json())
          .then((responseJson) => {
            p = this.state.pairs;
//            console.log(responseJson);

            this.addBalanceData(responseJson.data);
          })
          .catch((error) => {
            console.error(error);
          }
        );
      }
    }
  }

  @autobind
  addBalanceData(data){
    console.log('before');
    console.log(this.state.pairs);

    balance = data[0] ? data[0].balance : null;
    address = data[0] ? data[0].address : null;
//    console.log(data[0]);

    p = this.state.pairs;
    for(var i = 0; i<p.length; i++){
      //once per pair
      if(p[i].address == address){
        //add address to the pair object in the pairs array
        p[i].balance = balance;
//        console.log('added balance');
//        console.log(p);
      }
    }
    this.setState({
      pairs: p,
    });
    console.log('after');
    console.log(this.state.pairs);
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
    console.log('deleting');
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
    console.log('mounted');

  }

  loadAddresses() {
    return AsyncStorage.getItem('@DatStore:addresses')
      .then((add) => {
        this.setState({
          addresses: add
        },(e)=>{
            //do nothing about the errors here
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
        console.log(newPair);
        
        //see wtf it is
        console.log(data);
        
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
    console.log(this.props.item);
    console.log(this.props.balance);
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
//    console.log('item pressed');
    this.props.onPressItem(pair);
  };

  _onLongPressItem = (pair) => {
    console.log('tryna delete');
    console.log(pair);
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
    this.state = {balance: ' ',avghashrate: null};
  }

  componentDidMount(){
    this.fetchInfo();
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
        console.log(responseJson);
      })
      .catch((error) => {
        console.error(error);
      });
    //fetch average hashrates
    fetch('https://api.nanopool.org/v1/' + params.cryptocurrency.toString().toLowerCase() + '/avghashrate/' + params.address.toString())
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          //update the balance state
          avghashrate: responseJson.data,
        }, function() {
          // do something with new state
        });
        //got the balance
        console.log(responseJson);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  getHashratesString(params){
    times = [1,3,6,12,24];
    s = 'Average Hashrates:';
    console.log(params);
    for(var i = 0;i < times.length; i++ ){
      try {
        s = s + '\n' + times[i].toString() + ': ' + (this.state.avghashrate ? Math.round(this.state.avghashrate['h' + times[i].toString()]) : '...') + HashrateUnits[params.cryptocurrency]
      } catch (err){
        console.log(err);
      }
    };
    return s;
  }

  render() {
    const { params } = this.props.navigation.state;
    return (
      <View style={{flex:1, }}>
        <View style={styles.cardItem}>
          <Text style={styles.cardText}>
            {'Balance : ' + this.state.balance + '\n' + params.address}
          </Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={styles.cardText}>
            {this.getHashratesString(params)}
          </Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={styles.cardText}>
            {this.getHashratesString(params)}
          </Text>
        </View>
      </View>
    );
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
      // header: ({navigate}) => ({
      //   right: (
      //     <TouchableOpacity onPress={() => {navigate('NewAddress')} }>
      //       <Text style={styles.headerTouchableText}>
      //         Add New
      //       </Text>
      //     </TouchableOpacity>
      //   ),
      // }),
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
