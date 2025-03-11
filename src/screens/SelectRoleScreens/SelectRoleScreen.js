import { StyleSheet, Text, View, Dimensions, Image, TouchableOpacity, ActivityIndicator, BackHandler } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { height, width } = Dimensions.get('window');

const SelectRoleScreen = ({ navigation, route }) => {
  const { token, clientId, clientName, protocol, host, port, checkedRem } = route.params
  console.log(`Token: ${token}`);
  console.log(clientId, 'clientId')
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedOrgan, setSelectedOrgan] = useState('');
  const [selectedWareHouse, setSelectedWareHouse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [optionsRoles, setOptionsRoles] = useState([{ label: 'Select Role', value: 'Select Role' }]);
  const [optionsOrgan, setOptionsOrgan] = useState([{ label: 'Select Organization', value: 'Select Organization' }]);
  const [optionsWareHouse, setOptionsWareHouse] = useState([{ label: 'Select WareHouse', value: 'Select WareHouse' }]);
  const [roleId, setRoleId] = useState('')
  const [organizationId, setOrganizationId] = useState()
  const [warehouseId, setWareHouseId] = useState('')

  const optionClient = [
    { label: 'Select Client', value: 'Select Client' },
    { label: clientName, value: clientName }
  ]

  const fetchRoles = async () => {
    setIsLoading(true)
    await fetch(`${protocol}://${host}:${port}/api/v1/auth/roles?client=${clientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const fetchRole = data.roles
        setOptionsRoles([...optionsRoles, ...fetchRole]);
        setIsLoading(false)
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false)
      });
  }

  const fetchOrganization = async (itemValue) => {
    setOptionsOrgan([{ label: 'Select Organization', value: 'Select Organization' }])
    await fetch(`${protocol}://${host}:${port}/api/v1/auth/organizations?client=${clientId}&role=${itemValue}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        const array1 = [{ label: 'Select Organization', value: 'Select Organization' }]
        const fetchOran = data.organizations
        setOptionsOrgan(array1.concat(fetchOran))
        setIsLoading(false)
      })
      .catch(error => {
        console.error(error);
      });
  }

  const fetchWareHouse = async (itemValue) => {
    await fetch(`${protocol}://${host}:${port}/api/v1/auth/warehouses?client=${clientId}&role=${roleId}&organization=${itemValue}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        const array1 = [{ label: 'Select WareHouse', value: 'Select WareHouse' }]
        const fetchWareHouse = data.warehouses
        setOptionsWareHouse(array1.concat(fetchWareHouse))
        setIsLoading(false)
      })
      .catch(error => {
        console.error(error);
      });
  }

  // const Login = async () => {
  //   setIsLoading(true)
  //   const sessionResponse = await fetch(`${protocol}://${host}:${port}/api/v1/auth/tokens`, {
  //     method: 'PUT',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${token}`
  //     },
  //     body: JSON.stringify({
  //       clientId,
  //       roleId,
  //       organizationId,
  //       warehouseId,
  //       language: 'en_US'
  //     })
  //   });

  //   if (!sessionResponse.ok) {
  //     throw new Error('Error'),
  //     setIsLoading(false)
  //   } else {
  //     const sessionData = await sessionResponse.json();
  //     console.log(sessionData,'session')
  //     const tokenOk = sessionData.userId
  //     const token = sessionData.token
  //     if (checkedRem) {
  //       await AsyncStorage.setItem('token', token).then(async () => {
  //         await AsyncStorage.setItem('tokenOk', tokenOk.toString()).then(async () => {
  //           await AsyncStorage.setItem('clientName', clientName).then(async () => {
  //             await AsyncStorage.setItem('roleId', roleId.toString()).then(async () => {
  //               await AsyncStorage.setItem('clientId', clientId.toString()).then(async () => {
  //                 await AsyncStorage.setItem('organizationId', organizationId.toString()).then(async () => {
  //                   await AsyncStorage.setItem('warehouseId', warehouseId.toString()).then(async () => {
  //                     await AsyncStorage.setItem('userId', sessionData.userId.toString()).then(async () => {
  //                        navigation.navigate('FingerPrintScreen', { token, tokenOk, roleId })
  //                       //  navigation.navigate("HomeScreen",{ token, tokenOk, roleId })
  //                       setIsLoading(false)
  //                     })
  //                   })
  //                 })
  //               })
  //             })
  //           })
  //         })
  //       })
  //     } else {
  //       await AsyncStorage.setItem('clientName', clientName).then(async () => {
  //         await AsyncStorage.setItem('roleId', roleId.toString()).then(async () => {
  //           await AsyncStorage.setItem('clientId', clientId.toString()).then(async () => {
  //             await AsyncStorage.setItem('organizationId', organizationId.toString()).then(async () => {
  //               await AsyncStorage.setItem('warehouseId', warehouseId.toString()).then(async () => {
  //                 await AsyncStorage.setItem('userId', sessionData.userId.toString()).then(() => {
  //                    navigation.navigate('FingerPrintScreen', { token, tokenOk, roleId })
  //                   // navigation.navigate('HomeScreen', { token, tokenOk, roleId })
  //                   setIsLoading(false)
  //                 })
  //               })
  //             })
  //           })
  //         })
  //       })
  //     }
  //     await AsyncStorage.setItem('token', token).then(async () => {
  //       await AsyncStorage.setItem('tokenOk', tokenOk.toString()).then(async () => {
  //         await AsyncStorage.setItem('clientName', clientName).then(async () => {
  //           await AsyncStorage.setItem('roleId', roleId.toString()).then(async () => {
  //             await AsyncStorage.setItem('clientId', clientId.toString()).then(async () => {
  //               await AsyncStorage.setItem('organizationId', organizationId.toString()).then(async () => {
  //                 await AsyncStorage.setItem('warehouseId', warehouseId.toString()).then(async () => {
  //                   await AsyncStorage.setItem('userId', sessionData.userId.toString()).then(() => {
  //                      navigation.navigate('FingerPrintScreen', { token, tokenOk, roleId })
  //                     // navigation.navigate('HomeScreen', { token, tokenOk, roleId })
  //                     setIsLoading(false)
  //                   })
  //                 })
  //               })
  //             })
  //           })
  //         })
  //       })
  //     })
  //   }
  // }

  const Login = async () => {
    setIsLoading(true);
    try {
      const sessionResponse = await fetch(`${protocol}://${host}:${port}/api/v1/auth/tokens`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },

        body: JSON.stringify({
          clientId,
          roleId,
          organizationId,
          warehouseId,
          language: 'en_US'
        })
      });

      if (!sessionResponse.ok) {
        throw new Error(`Session update failed with status: ${sessionResponse.status}`);
      }

      const sessionData = await sessionResponse.json();
      // console.log(sessionData,'dataForInfinityERP')
      const updatedToken = sessionData.token;
      const tokenOk = sessionData.userId.toString();
      const userId = sessionData.userId.toString();
      console.log(tokenOk)

      await AsyncStorage.multiSet([
        ['token', updatedToken],
        ['tokenOk', tokenOk],
        ['userId', userId],
        ['clientName', clientName],
        ['roleId', roleId.toString()],
        ['clientId', clientId.toString()],
        ['organizationId', organizationId.toString()],
        ['warehouseId', warehouseId.toString()]
      ]);

      if (updatedToken && tokenOk && roleId) {
        navigation.navigate('FingerPrintScreen', { token: updatedToken, tokenOk, roleId, userId });
      } else {
        throw new Error('Missing parameters after session update');
      }

    } catch (error) {
      console.error('Login error:', error);
      Alert.alert("Login Error", error.message || "An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };






  const clickOk = () => {
    if (!selectedClient) {
      alert('please select client')
    } else if (!selectedRole) {
      alert('please select the role')
    } else if (!selectedOrgan) {
      alert('select an organization')
    }
    else if (!selectedWareHouse) {
      alert('select an wareHouse')
    }
    else {
      Login()
    }
  }

  useEffect(() => {
    fetchRoles()
    const backAction = () => {
      navigation.goBack()
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [])

  return (
    <>
      {isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#0050C0" />
        </View>
      )}
      {!isLoading && (
        <View style={{
          flex: 1,
          // backgroundColor: '#0050C0',
          backgroundColor: '#fff',
          alignItems: 'center'
        }}>
          {/* First image */}
          <View style={styles.imageCon}>
            <Image
              // source={require('../../asserts/splashScreenAsserts/infinityLoginIcon.png')}
              source={require('../../asserts/WelcomeSrn/infinityerpiconillustrator23.png')}
              style={{ height: height / 3, width: width / 3, }}
              // style={{ height: height , width: width / 1,  }}
              resizeMode="contain"
            />
          </View>


          {/* Pickers */}
          {/* Client picker */}
          <View style={{ backgroundColor: "#f1f1f1", width: "95%", alignSelf: "center", borderRadius: 10 }}>
            {/* Text  */}
            <View>
              <Text style={{ marginTop: "5%", fontSize: 20, fontWeight: "800", color: "black", paddingLeft: "3%" }}>Set User Role</Text>
            </View>

            <View style={styles.pickerStyle}>
              <Picker
                selectedValue={selectedClient}
                onValueChange={async (itemValue, itemIndex) => (
                  setSelectedClient(itemValue),
                  await AsyncStorage.setItem('clientNameSelected', optionClient[itemIndex].label)
                )}
                style={styles.pickerItem}
                dropdownIconColor={'black'}
              >
                {optionClient.map(option => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    color="black"
                    // color="#fff"
                  />
                ))}
              </Picker>
            </View>

            {/* role picker */}
            <View style={styles.pickerStyle}>
              <Picker
                selectedValue={selectedRole}
                onValueChange={async (itemValue, itemIndex) => {
                  setSelectedRole(itemValue)
                  await AsyncStorage.setItem('roleNameSelected', optionsRoles[itemIndex].name)
                  if (itemValue === 'Select Role') {
                    alert('Please select an role')
                  } else {
                    await setRoleId(itemValue)
                    fetchOrganization(itemValue)
                    setIsLoading(true)
                  }
                }}
                style={styles.pickerItem}
                dropdownIconColor={'black'}
              >
                {optionsRoles.map(option => (
                  <Picker.Item label={option.name || option.label}
                    value={option.id || option.value}
                    key={option.id || option.value}
                    color="black"
                    //  color="#fff"
                  />
                ))}
              </Picker>
            </View>

            {/* organization picker */}
            <View style={styles.pickerStyle}>
              <Picker
                selectedValue={selectedOrgan}
                onValueChange={async (itemValue, itemIndex) => {
                  setSelectedOrgan(itemValue)
                  await AsyncStorage.setItem('organizationNameSelected', optionsOrgan[itemIndex].name)
                  if (itemValue === 'Select Organization') {
                    alert('Please select an organization')
                  } else {
                    setIsLoading(true)
                    await setOrganizationId(itemValue)
                    fetchWareHouse(itemValue)
                  }
                }}
                style={styles.pickerItem}
                dropdownIconColor={'black'}
              >
                {optionsOrgan.map(option => (
                  <Picker.Item label={option.name || option.label}
                    value={option.id || option.value}
                    key={option.id || option.value}
                    color="black"
                    //  color="#fff"
                  />
                ))}
              </Picker>
            </View>

            {/* warehouse picker */}
            <View style={styles.pickerStyle}>
              <Picker
                selectedValue={selectedWareHouse}
                onValueChange={async (itemValue, itemIndex) => {
                  setSelectedWareHouse(itemValue)
                  await AsyncStorage.setItem('warehouseNameSelected', optionsOrgan[itemIndex].name)
                  if (itemValue === 'Select WareHouse') {
                    alert('Please select an Warehouse')
                  } else {
                    setIsLoading(true)
                    await setWareHouseId(itemValue)
                    setIsLoading(false)
                  }
                }}
                style={styles.pickerItem}
                dropdownIconColor={'black'}
              >
                {optionsWareHouse.map(option => (
                  <Picker.Item label={option.name || option.label}
                    value={option.id || option.value}
                    key={option.id || option.value}
                    color="black"
                    //  color="#fff"
                  />
                ))}
              </Picker>
            </View>

            {/* Buttoms */}
            <View style={{ marginTop: '10%', flexDirection: "row", justifyContent: "flex-end", alignItems: "flex-end" }}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: "#f1f1f1", borderWidth: 1 }]} onPress={() => navigation.goBack()}>
                <Text style={[styles.btnTxt, { color: "black" }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { marginRight: "5%" }]} onPress={() => clickOk()}>
                <Text style={styles.btnTxt}>Save</Text>
              </TouchableOpacity>
            </View>


          </View>





        </View>
      )}
    </>
  )
}

export default SelectRoleScreen

const styles = StyleSheet.create({
  imageCon: {
    alignItems: 'center',
    justifyContent: 'center',
    height: height / 3.5,
    width: width,
    // backgroundColor:"red"
  },
  middleContainer: {
    alignItems: 'center'
  },
  txt: {
    fontSize: 32,
    fontFamily: 'K2D-Bold',
    color: '#800000'
  },
  txt2: {
    fontSize: 32,
    fontFamily: 'K2D-Bold',
    color: '#330000'
  },
  topMiddleText: {
    flexDirection: 'row'
  },
  pickerStyle: {
    width: width / 1.3,
    // borderBottomColor: 'white',
    // borderBottomWidth: 1,
    marginTop: 14,
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#DCDADA",
    borderRadius: 10

  },
  pickerItem: {
    color: 'black',
    fontFamily: "K2D"
  },
  btn: {
    // backgroundColor: '#00B0F0',
    backgroundColor: "#002E62",
    height: height / 20,
    width: width / 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '3%',
    borderRadius: 10,
    marginLeft: '4%',
    marginBottom: "15%"
  },
  btnTxt: {
    fontSize: 16,
    color: 'white'
  }

})