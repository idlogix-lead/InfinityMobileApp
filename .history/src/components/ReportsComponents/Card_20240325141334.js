import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, UIManager, Platform } from 'react-native';

if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Card = ({ item }) => {
    console.log(item.Name,'d')
    const [expanded, setExpanded] = useState(true);
    const [expanded2, setExpanded2] = useState(true);
    const [expanded3, setExpanded3] = useState(true);

    const [height1, setHeight1] = useState(null);
    const [height2, setHeight2] = useState(null);
    const [height3, setHeight3] = useState(null);

    const contentRef1 = useRef();
    const contentRef2 = useRef();
    const contentRef3 = useRef();

    const toggleSection = (section) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        switch (section) {
            case 'section1':
                setExpanded(!expanded);
                break;
            case 'section2':
                setExpanded2(!expanded2);
                break;
            case 'section3':
                setExpanded3(!expanded3);
                break;
            default:
                break;
        }
    };

    const measureView = (event, section) => {
        if (section === 'section1' && !height1) {
            setHeight1(event.nativeEvent.layout.height);
        } else if (section === 'section2' && !height2) {
            setHeight2(event.nativeEvent.layout.height);
        } else if (section === 'section3' && !height3) {
            setHeight3(event.nativeEvent.layout.height);
        }
    };

    return (
        <View>
            <TouchableOpacity onPress={() => toggleSection('section1')} style={styles.MainContainer}>
                <Text style={styles.TitleTxt}>Funds Available</Text>
                <Text style={styles.TitleTxt}></Text>
            </TouchableOpacity>

            {expanded && (
                <View onLayout={(event) => measureView(event, 'section1')} ref={contentRef1}>
                    <TouchableOpacity onPress={() => toggleSection('section2')} style={styles.MiddleContainer}>
                        <Text style={styles.TitleTxt}>Cash</Text>
                        <Text style={styles.TitleTxt}></Text>
                    </TouchableOpacity>

                    {expanded2 && (
                        <View onLayout={(event) => measureView(event, 'section2')} ref={contentRef2} style={styles.InnerContainer}>
                            {item?.AccountType?.id === 'B' && (
                                <View style={styles.CashView}>
                                    <Text style={[styles.TitleTxt,{fontSize:16,}]}>{item.Name}</Text>
                                    <Text style={[styles.TitleTxt,{fontSize:16,}]}>{item.Amount}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    <TouchableOpacity onPress={() => toggleSection('section3')} style={styles.MiddleContainer}>
                        <Text style={styles.TitleTxt}>Bank</Text>
                        <Text style={styles.TitleTxt}></Text>
                    </TouchableOpacity>

                    {expanded3 && (
                        <View onLayout={(event) => measureView(event, 'section3')} ref={contentRef3} style={styles.InnerContainer}>
                            {item?.AccountType?.id === 'C' && (
                                <View style={styles.CashView}>
                                    <Text style={[styles.TitleTxt,{fontSize:16,}]}>{item.Name}</Text>
                                    <Text style={[styles.TitleTxt,{fontSize:16,}]}>{item.Amount}</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

export default Card;

const styles = StyleSheet.create({
    MainContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        width: '100%',
        padding: 10,
        marginTop: 10,
    },
    MiddleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        width: '90%',
        padding: 10,
        marginTop: 10,
        alignSelf: 'center'
    },
    TitleTxt: {
        color: '#000',
        fontFamily: 'K2D-Regular',
        fontSize: 18,
    },
    InnerContainer: {
        width: '90%',
        backgroundColor: '#eeeeee',
        alignSelf: 'center',
        padding: 10,
    },
    CashView:{
        flexDirection:'row',
        justifyContent:'space-between',
        paddingHorizontal: 10,
    },
});