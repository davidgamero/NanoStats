import React from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity, AsyncStorage } from 'react-native';
import autobind from 'autobind-decorator'

export default class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {address: null, balance: 'loading...', lastAddress: ''};
  }

  componentDidMount(){
    this.loadAddress();
  }

    @autobind
  _onPressFetchBalance(){
    if(this.state.address){
      this.fetchBalance(this.state.address);
    }
  }

  @autobind
  _onPressSaveAddress() {
    this.saveAddress();
  }

  @autobind
  _onPressLoadAddress(){
    this.loadAddress();
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
          lastAddress: add,
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
              placeholder={this.state.lastAddress ? (this.state.lastAddress.toString()): 'Address'}
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
          <TouchableOpacity onPress={this._onPressSaveAddress}>
            <View style={styles.button}>
                <Text style={styles.buttonText}>Save Address</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this._onPressLoadAddress}>
            <View style={styles.button}>
                <Text style={styles.buttonText}>Load Address</Text>
            </View>
          </TouchableOpacity>
          
          <Text style={{color: '#2196F3', fontSize: 20}}>{this.state.lastAddress ? ('Saved address: ' + this.state.lastAddress.toString()): 'No saved address'}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
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
