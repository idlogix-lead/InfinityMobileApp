import {
  StyleSheet,
  Text,
  View,
  BackHandler,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import TopHeader from '../../components/ApprocalScreenComponents/TopHeader';
import HomeNotifyCard from '../../components/HomeScreenComponents/HomeNotifyCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ApprovalScreens = ({route, navigation}) => {
  const {
    // filteredArrayAccount, filteredArraySupply,
    token,
    tokenOk,
    roleId,
  } = route.params;
  //   let financial = filteredArrayAccount.length
  //   let supply = filteredArraySupply.length;
  const [isLoading, setIsLoading] = useState(false);
  const [financialNum, setFinancialNum] = useState(0);
  const [supplyNum, setSupplyNum] = useState(0);
  const [hrNum, setHrNum] = useState(0);
  const [salesNum, setSalesNum] = useState(0);
  const [ItNum, setItNum] = useState(0);

  const getData = async (protocol, host, port) => {
    setIsLoading(true);
    const headers = new Headers({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
    try {
      const request1 = new Request(
        `${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId} AND (AD_Table_ID eq 319 OR AD_Table_ID eq 259 OR AD_Table_ID eq 702)`,
        {
          method: 'GET',
          headers,
        },
      );

      const request2 = new Request(
        `${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId} AND (AD_Table_ID eq 335 OR AD_Table_ID eq 318 OR AD_Table_ID eq 224)`,
        {
          method: 'GET',
          headers,
        },
      );

      const request3 = new Request(
        `${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId} AND AD_Table_ID eq 319 AND IsSOTrx eq false`,
        {
          method: 'GET',
          headers,
        },
      );

      const request4 = new Request(
        `${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId} AND AD_Table_ID eq 319 AND IsSOTrx eq true`,
        {
          method: 'GET',
          headers,
        },
      );

      const request5 = new Request(
        `${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId} AND AD_Table_ID eq 702`,
        {
          method: 'GET',
          headers,
        },
      );
      Promise.all([fetch(request1), fetch(request2)])
        .then(responses =>
          Promise.all(responses.map(response => response.json())),
        )
        .then(data => {
          console.log(JSON.stringify(data), 'Dataaaa');
          setSupplyNum(data[0].records.length);
          setFinancialNum(data[1].records.length);
          setIsLoading(false);
        })
        .catch(error => {
          console.error(error);
          setIsLoading(false);
        });
    } catch (error) {
      console.error(error);
    }
  };

  const getAPIData = async () => {
    const token = await AsyncStorage.getItem('token');
    const protocol = await AsyncStorage.getItem('protocol');
    const host = await AsyncStorage.getItem('host');
    const port = await AsyncStorage.getItem('port');
    getData(protocol, host, port);
  };

  const navigateBack = () => {
    const unsubscribe = navigation.addListener('focus', () => {
      getAPIData();
    });

    return unsubscribe;
  };

  useEffect(() => {
    navigateBack();
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [navigation]);

  const supplyChain = async () => {
    const filterCheck = await AsyncStorage.getItem('filterCheck');
    if (filterCheck != null) {
      await AsyncStorage.removeItem('filterCheck');
    }
    navigation.navigate('ApprovalByDoc', {token});
  };

  const financialFun = async () => {
    await AsyncStorage.setItem('filterCheck', token);
    navigation.navigate('FinancialByDoc', {token});
  };

  return (
    <>
      {isLoading && (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator size="large" color="#0050C0" />
        </View>
      )}
      {!isLoading && (
        <View style={{flex: 1, backgroundColor: 'white'}}>
          <TopHeader
            txt="Department Approvals"
            handlePress={() =>
              navigation.navigate('BottomTab', {tokenOk, token, roleId})
            }
          />
          <View style={styles.card}>
            <View
              style={{
                flexDirection: 'row',
                width: '80%',
                justifyContent: 'space-between',
              }}>
              <HomeNotifyCard
                source={require('../../asserts/ApprovalAndDoucementAssets/Mask.png')}
                txt="Financial"
                num={financialNum}
                clickHandler={() => {
                  if (financial === 0) {
                    alert('No data exist');
                  } else {
                    financialFun();
                  }
                }}
              />
              <HomeNotifyCard
                source={require('../../asserts/ApprovalAndDoucementAssets/hr.png')}
                txt="HR"
                num={hrNum}
                clickHandler={() => {
                  if (hrNum === 0) {
                    alert('No data exist');
                  } else {
                    console.log('hrHandler');
                  }
                }}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                width: '80%',
                justifyContent: 'space-between',
                marginTop: '10%',
              }}>
              <HomeNotifyCard
                source={require('../../asserts/ApprovalAndDoucementAssets/supply.png')}
                txt="Supply chain"
                num={supplyNum}
                clickHandler={() => {
                  if (supply === 0) {
                    alert('No data exist');
                  } else {
                    supplyChain();
                  }
                }}
              />
              <HomeNotifyCard
                source={require('../../asserts/ApprovalAndDoucementAssets/sales.png')}
                txt="Sales"
                num={salesNum}
                clickHandler={() => {
                  if (salesNum === 0) {
                    alert('no data exist');
                  } else {
                    console.log('sales handler');
                  }
                }}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                width: '80%',
                justifyContent: 'space-between',
                marginTop: '10%',
              }}>
              <HomeNotifyCard
                source={require('../../asserts/ApprovalAndDoucementAssets/it.png')}
                txt="IT"
                num={ItNum}
                clickHandler={() => {
                  if (ItNum === 0) {
                    alert('no data exist');
                  } else {
                    console.log('it handler');
                  }
                }}
              />
            </View>
          </View>
        </View>
      )}
    </>
  );
};

export default ApprovalScreens;

const styles = StyleSheet.create({
  card: {
    marginTop: '13%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
