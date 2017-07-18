import React from 'react';
import autobind from 'autobind-decorator'
import { StyleSheet, Text, View, Image, TextInput, Button, Alert, FlatList, Fetch, TouchableOpacity, Picker } from 'react-native';
import { StackNavigator } from 'react-navigation';

class HomeScreen extends React.Component {

  static navigationOptions = {
    title: 'TF2Logs',

  };

  constructor(props) {
    super(props);
    this.state = {
      player: '',
      matches: [{id: '123', title: 'poopybutthole'}],
    };
  }

  @autobind
  _onPressButton() {
   // if(this.state.player){
      this.fetchStats(this.state.player)
    //}
  }

  /** Fetches the list of matches from logs.tf and stores it in the matches state
  */
  fetchStats(player) {
    return fetch('https://logs.tf/json_search?player='  + (player? player.toString():'76561198043059628'))
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          //add logs to the list
          matches: responseJson.logs
        }, function() {
          //something to do w new states
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  @autobind
  navToMatchScreen(matchInfo){
    console.log('poopybutthole')
    const { navigate } = this.props.navigation;
    navigate('Match', matchInfo)
  }
  
  render() {
  
  
    return (
      <View style={{flex: 1, backgroundColor: 'powderblue'}}>
        
        <View style={{marginTop: 60,margin: 40, padding: 10, flex: 1}}>
            <TextInput
              style={{height: 40, color: 'black'}}
              textAlign="center"
              placeholder="Enter Steam ID Number"
              placeholderTextColor="black"
              onChangeText={(text) => this.setState({'player':text})}
            />
            
            <Button 
            onPress={this._onPressButton}
            title="SEARCH"
            />
        </View>


        <View style={{flex: 8}}>
         <MatchList
            data= {this.state.matches}
            onPressItem= {this.navToMatchScreen}
          />
        </View>
       </View>
  )
  }
};

class MatchScreen extends React.Component {

  static navigationOptions = {
    title: 'Match',

  };
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      score: [{red: '0', blue: '0'}],
    };
  }

  fetchStats() {
    return fetch('https://logs.tf/json/'  + (id? id.toString():'1486609'))
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          //add logs to the list
          score: responseJson.teams
        }, function() {
          //something to do w new states
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }


  render(){

    //const { navigate } = this.props.navigation;

    return(

      <View style={{backgroundColor: 'white'}}>
        <Text>SCORE GOES HERE</Text>
      </View>
    )

  }

}

class MatchListItem extends React.PureComponent {

  

  _onPress = () => {
    //navigate('Match');
    this.props.onPressItem({id:this.props.id});
    console.log('match selected');
  };
  

  render() {
    //const { navigate } = this.props.navigation;
    return (
      <TouchableOpacity onPress={this._onPress}>
        <View style={styles.logItem}>
          <Text style={styles.logItemText}>
          {this.props.id}
          </Text>
          <Text style={styles.logItemText}>
          {this.props.title}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }
}

class MatchList extends React.PureComponent {
  state = {selected: (new Map(): Map<string, boolean>)};

  _keyExtractor = (item, index) => item.id;

  _onPressItem = (matchItem) => {
    
    this.props.onPressItem(matchItem);
    console.log('match list recieved touch');
  };

  _renderItem = ({item}) => (
    <MatchListItem
      id={item.id}
      onPressItem={this._onPressItem}
      selected={!!this.state.selected.get(item.id)}
      title={item.title}
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


const styles = StyleSheet.create({

  logItem: {
    justifyContent: 'center',
    margin: 10,
    borderRadius: 5,
    borderColor: 'black',
    borderWidth: 1,
    backgroundColor: 'white',
  },

  logItemText: {
    textAlign: 'center',
  }

});

const App = StackNavigator({

    Home: { screen: HomeScreen },
    Match: { screen: MatchScreen },

});

export default App;