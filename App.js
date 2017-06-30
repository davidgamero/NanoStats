import React from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity, AsyncStorage, FlatList } from 'react-native';
import autobind from 'autobind-decorator'
import { StackNavigator } from 'react-navigation';

export default class App extends React.Component {
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

class MyListItem extends React.PureComponent {
  _onPress = () => {
    this.props.onPressItem(this.props.id);
  };

  render() {
    return (
      <Text>migoo</Text>
    )
  }
}

class MyList extends React.PureComponent {
  state = {selected: (new Map(): Map<string, boolean>)};

  _keyExtractor = (item, index) => item.id;

  _onPressItem = (id: string) => {
    // updater functions are preferred for transactional updates
    this.setState((state) => {
      // copy the map rather than modifying state.
      const selected = new Map(state.selected);
      selected.set(id, !selected.get(id)); // toggle
      return {selected};
    });
  };

  _renderItem = ({item}) => (
    <Text>{item.name + ' aka ' + item.nick}</Text>
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

const styles = StyleSheet.create({
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
  button: {
    marginBottom: 30,
    width: 260,
    alignItems: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 5
  },
  buttonText: {
    padding: 20,
    color: 'white',
    fontSize: 20
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
