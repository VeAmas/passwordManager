/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ListView,
  TouchableOpacity,
  CheckBox,
  Image,
  Clipboard,
  ToastAndroid,
  AppState
} from 'react-native';
import ItemInputModal from './itemInputModal';
import encrypt from './encrypt'
import './expand'

import SortableListView from './sortableList.js'
var RNFS = require('react-native-fs');

import FingerprintPopup from './fingerPrintScan.js';

type Props = {};

let list = [];

export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => {
      return r1 !== r2
    }});
    this.state = { 
      text: '',
      input: '',
      showLeftButton: false,
      showFingerprintScan: true,
      list: this.ds.cloneWithRows(list),
      modalVisible: false,
      onEditing: false
    };
    this.readFile();

    AppState.addEventListener('change', (state) => {
      if (state === 'active' && new Date().getTime() - this.lastAuthTime > 600000) {
        this.setState({showFingerprintScan: true});
      } else {
        this.lastAuthTime = new Date().getTime();
      }
    });
  }

  writeFile () {
      RNFS.writeFile(RNFS.DocumentDirectoryPath + '/password.txt', JSON.stringify(list), 'utf8')
          .then(() => {})
          .catch((err) => {
            ToastAndroid.show(err.message, ToastAndroid.SHORT);
          });

  }

  readFile () {
      RNFS.readDir(RNFS.DocumentDirectoryPath)
          .then((result) => {
              var res = result.find(v => v.name === 'password.txt')

              // stat the first file
              return RNFS.readFile(res.path, 'utf8');
          })
          .then((contents) => {
              console.log(contents);
              list = JSON.parse(contents);
              this.setState({});
          })
          .catch((err) => {
              ToastAndroid.show(err.message, ToastAndroid.SHORT);
          });
  }

  clickItem (item) {
    if (this.state.showLeftButton) {
      var index = list.indexOf(item);
      item.checked = !item.checked;
      list[index] = Object.assign({}, item);
      this.setState({list: this.ds.cloneWithRows(list)})
    } else {
      Clipboard.setString(encrypt(item.key));
      ToastAndroid.show("已复制到剪切板", ToastAndroid.SHORT);
    }
  }

  toggleEnableSelect () {
    list = list.map((v) => {
      v = Object.assign({}, v)
      return v;
    })
    this.setState({
      list: this.ds.cloneWithRows(list),
      showLeftButton: !this.state.showLeftButton
    })
  }

  afterConfirmed (str) {
    if (this.state.onEditing) {
      var index = list.indexOf(list.find(v => v.key === this.state.onEditing.key));
      list[index] = {key: str.trim(), ctime: new Date().getTime()};
      this.setState({list: this.ds.cloneWithRows(list)})
    } else {
      list.push({
          key: str.trim(),
          ctime: new Date().getTime()
      })
    }
    this.writeFile();
    this.setState({onEditing: false});
  }

  afterImportComfirmed (str) {
    var _list = [];
    try {
      _list = JSON.parse(str);
    } catch (e) {
      ToastAndroid.show(e.message, ToastAndroid.SHORT);
      return;
    }

    list = list.concat(_list);
    this.writeFile();
    this.setState({onEditing: false});
  }

  comfirmToDelete () {
    list = list.filter(v => !v.checked)
    this.toggleEnableSelect();
    this.writeFile();
  }

  handleFingerprintDismissed () {
    this.setState({showFingerprintScan: false});
  }

  renderRow (rowData) {
    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => { 
          this.clickItem(rowData);
        }}>
        {
          this.state.showLeftButton && <CheckBox style={styles.checkbox} value={rowData.checked} onChange={() => {this.clickItem(rowData)}}></CheckBox>
        }
        <View style={{flexDirection: 'column', justifyContent: 'center', flex: 1}}>        
          <View style={styles.itemLine1}>
            <Text style={styles.itemTitle}>{rowData.key}</Text>
            <Text style={styles.itemTime}>{new Date(rowData.ctime).Format('yyyy-MM-dd hh:mm:ss')}</Text>
          </View>
          <View style={styles.itemLine1}>
              <Text style={styles.itemPassword}>{encrypt(rowData.key)}</Text>
              {
                !this.state.showLeftButton && 
                <TouchableOpacity onPress={() => {
                    this.refs.itemInputModal.setModalVisible(true, rowData.key);
                    this.setState({onEditing: rowData})
                }}>
                  <Image
                    style={styles.itemIcon}
                    source={require('./assets/image/edit.png')}
                  ></Image>
                </TouchableOpacity>
              }
          </View>
        </View>

      </TouchableOpacity>
    )
  }

  render() {
    return (this.state.showFingerprintScan ?
      (<FingerprintPopup
        style={styles.fingerprintPopup}
        handlePopupDismissed={this.handleFingerprintDismissed.bind(this)}
      />) : 
      (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{flexDirection: 'row', marginLeft: 10}}>
            {
              this.state.showLeftButton &&
              <TouchableOpacity style={styles.headerButton} onPress={() => {    
                this.comfirmToDelete();
              }}>
                  <Image
                      style={styles.icon}
                      source={require('./assets/image/check.png')}
                  />
              </TouchableOpacity>
            }
          </View>

          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity style={styles.headerButton} onPress={() => {            
              Clipboard.setString(JSON.stringify(list, 0, 4));
              ToastAndroid.show("已复制到剪切板", ToastAndroid.SHORT);
            }}>
                <Image
                    style={styles.icon}
                    source={require('./assets/image/inbox.png')}
                />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={() => {
              this.toggleEnableSelect();
            }}>
              <Image
                  style={styles.icon}
                  source={require('./assets/image/delete.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => {
                this.refs.itemInputModal.setModalVisible(true);
              }}
              onLongPress={() => {
                this.refs.importModal.setModalVisible(true);
              }}
            >
                <Image
                    style={styles.icon}
                    source={require('./assets/image/plus.png')}
                />
            </TouchableOpacity>
          </View>
        </View>
        <SortableListView 
          pageSize = {100}
          style={styles.list}
          data = {list}
          onRowMoved={e => {
            var first = list[e.from];
            var x = e.from < e.to ? 1 : -1;
            for (let i = e.from; e.from < e.to ? i < e.to : i > e.to; e.from < e.to ? i++ : i--) {
              list[i] = list[i + x];
            }
            list[e.to] = first;
            this.writeFile();
            this.setState({list: this.ds.cloneWithRows(list)})
          }}
          renderRow={ this.renderRow.bind(this) }>
        </SortableListView>
        <ItemInputModal
            ref={"itemInputModal"}
            afterConfirmed={this.afterConfirmed.bind(this)}/>
        <ItemInputModal
            ref={"importModal"}
            size={"large"}
            afterConfirmed={this.afterImportComfirmed.bind(this)}/>
      </View>)
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
    width: '100%'
  },
  header: {
    height: 56,
    backgroundColor: 'blue',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  list: {
    flex: 1
  },
  headerButton: {
    marginRight: 10
  },
  icon: {
    width: 30,
    height: 30
  },
  listItem: {
    height: 60,
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
    display: 'flex',
    flexDirection: 'row'
  },
  checkbox: {
    marginTop: 14
  },
  itemLine1: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  itemTitle: {
    marginLeft: 15
  },
  itemPassword: {
    marginLeft: 18,
    fontSize: 20
  },
  itemTime: {
    marginRight:15
  },
  itemIcon: {
      width: 22,
      height: 22,
      marginRight:15
  },
  fingerprintPopup: {
    position: 'absolute',
    top: -56,
    bottom: 0,
    left: 0,
    right: 0
  }
});
