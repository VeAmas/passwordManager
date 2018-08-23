import React, {Component} from "react";
import {
    TextInput,
    Button,
    View,
    Modal,
    TouchableOpacity, StyleSheet
} from 'react-native';

class ItemInputModal extends Component<Props> {
    constructor(props) {
        super(props);

        this.state = {
            modalVisible: false,
            defaultValue: props.editTextValue,
            editTextValue: ''
        };
    }

    setModalVisible(visible, value) {
        this.setState({modalVisible: visible, defaultValue: value || ''});
    }

    render() {
        return (
            /*
              输入密码的模态框
             */
            <Modal
                animationType={"fade"}
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => {
                    this.setModalVisible(!this.state.modalVisible)
                }}>
                <TouchableOpacity
                    activeOpacity = {1}
                    style={styles.modalMask}
                    onPress={() => {
                        this.setModalVisible(!this.state.modalVisible)
                    }}>
                    <View style={styles[{normal: "modal", large: "modalLarge"}[this.props.size || 'normal']]}>
                        <TextInput style={styles[{normal: "textInput", large: "textInputLarge"}[this.props.size || 'normal']]}
                            defaultValue={this.state.defaultValue}
                            multiline={this.props.size==='large'}
                            onChangeText={(text)=>{
                              this.setState({editTextValue:text})
                            }}
                        > </TextInput>

                        <Button style={styles.button}
                                onPress={() => {
                                    this.setModalVisible(!this.state.modalVisible)
                                    this.props.afterConfirmed(this.state.editTextValue)
                                }}
                                title={'确定'}
                        >
                        </Button>

                    </View>
                </TouchableOpacity>
            </Modal>
        )
    }
}
const styles = StyleSheet.create({
    modal: {
        padding: 10,
        width: '70%',
        backgroundColor: '#fff',
        borderRadius: 10
    },
    modalLarge: {
        padding: 10,
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10
    },
    textInput: {},
    textInputLarge: {
        height: 400,
        justifyContent: 'flex-start'
    },
    button: {
        width: 100
    },
    modalMask: {
        display: 'flex',
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    }
});


export default ItemInputModal;