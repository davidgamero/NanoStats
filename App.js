import React from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity, AsyncStorage, FlatList, Picker, Keyboard, Alert } from 'react-native';
import autobind from 'autobind-decorator'
import { StackNavigator } from 'react-navigation';

class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'NanoStats',
    headerLeft: null,
    headerRight: <View><Text>Add New</Text></View>,
  };

  constructor(props){
    super(props);
    this.state = {pairs: null};
  }


  componentDidMount(){
    //AsyncStorage.setItem('@DatStore:addresses','[]');
    this.loadPairs();
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
            onLongPressItem={this.promptDeletePair}
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

    console.log('new address pressed');

    AsyncStorage.getItem('@DatStore:addresses')
      .then(async (pairs) => {
        //parse strigified object
        data = JSON.parse(pairs);

        //the new currency-address pair
        newPair = {cryptocurrency: this.state.cryptocurrency,address: this.state.newAddress,name: this.state.name};
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
              style={styles.cardText}
              placeholder={'Account Nickname'}
              onChangeText={(name) => this.setState({'name': name})}
            />
          <Picker
            selectedValue={this.state.cryptocurrency}
            onValueChange={(itemValue,itemIndex) => this.setState({'cryptocurrency': itemValue})}>
            <Picker.Item label={'Ethereum'} value={'ETH'}/>
            <Picker.Item label={'Siacoin'} value={'SC'}/>
          </Picker>
          <TextInput  
              style={styles.cardText}
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
    this.props.onPressItem(this.props.address);
  };

  _onLongPress = () => {
    this.props.onLongPressItem(this.props.item);
  };

  render() {
    console.log(this.props.item);
    return (
      <TouchableOpacity
      onPress={this._onPress}
      onLongPress={this._onLongPress}>
        <View style={styles.cardItem}>
          <Text style={styles.homeAddressItemText}>{this.props.item.name + ' : ' + this.props.item.cryptocurrency}</Text>
          <Text style={styles.homeAddressItemText}>{this.props.item.address}</Text>
        </View>
      </TouchableOpacity>
    )
  }
}

class AddressList extends React.PureComponent {
  state = {selected: (new Map(): Map<string, boolean>)};

  _keyExtractor = (item, index) => item.address;

  _onPressItem = (id: string) => {
    console.log('item pressed');
    // updater functions are preferred for transactional updates
    this.setState((state) => {
      // copy the map rather than modifying state.
      const selected = new Map(state.selected);
      selected.set(id, !selected.get(id)); // toggle
      return {selected};
    });
  };

  _onLongPressItem = (pair) => {
    console.log('tryna delete');
    console.log(pair);
    this.props.onLongPressItem(pair);
  };

  _renderItem = ({item}) => (
    <AddressListItem
      props={item}
      item={item}
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
      />
    );
  }
}

class Old extends React.Component {
  constructor(props){
    super(props);
    this.state = {address: null, balance: 'loading...', saveAddress: ''};
  }

  componentDidMount(){
    this.loadAddress();
  }

    @autobind
  _onPressFetchBalance(){
    if(this.state.address){
      this.fetchBalance(this.state.address);
    }else{
      this.loadAddress();
    }
  }

  fetchBalance(address) {
    return fetch('https://api.nanopool.org/v1/eth/balance/' + address.toString())
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          balance: responseJson.data,
        }, function() {
          // do something with new state
        });
        //got the balance now save address
        this.saveAddress();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  saveAddress() {
    add = this.state.address;
    if(add){
      AsyncStorage.setItem('@DatStore:address',add);
    }
  }

  loadAddress() {
    return AsyncStorage.getItem('@DatStore:address')
      .then((add) => {
        this.setState({
          address: add
        },(e)=>{
            //do nothing about the errors here
          });
      });
  }

  render() {
    return (
      <View style={{flex:1, justifyContent: 'center'}}>
        <View style={{flex:1, backgroundColor: 'powderblue',justifyContent: 'center'}}>
          <Text style={styles.viewTitle}>NanoStats</Text>
          <Text style={styles.balanceText}>{this.state.balance}</Text>
          <View style={{margin: 20, width:450, alignSelf: 'center', backgroundColor: 'white'}}>
            <TextInput  
              style={{height: 40}}
              placeholder={this.state.address ? (this.state.address.toString()): 'Address'}
              onChangeText={(text) => this.setState({'address':text})}
            />
          </View>
        </View>
        <View style={{flex:1, alignItems: 'center'}}>
          <TouchableOpacity onPress={this._onPressFetchBalance} style={{marginTop: 20}}>
            <View style={styles.button}>
                <Text style={styles.buttonText}>Fetch Balance</Text>
            </View>
          </TouchableOpacity>
          <MyList
            data={[
              {id: '1',name: 'uno',nick: 'juan'},
              {id: '2',name: 'dos',nick: 'jose'},
            ]}
          />
        </View>
      </View>
    );
  }
}

//style sheet resource info
const styles = StyleSheet.create({
  cardText: {
    margin: 5,
    padding: 5,
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

const App = StackNavigator({
  Home: {screen: HomeScreen},
  NewAddress: {screen: NewAddressScreen},
});

export default App;
