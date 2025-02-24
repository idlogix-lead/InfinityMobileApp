import { StyleSheet, Text, View, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import CustomHeader from '../../../components/CustomHeader'
import Card from '../../../components/ReportsComponents/Card'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Loader from '../../../components/Loader';

const Liquidity = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [liquidityData, setLiquidityData] = useState({ cashItems: [], bankItems: [] });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const protocol = await AsyncStorage.getItem('protocol');
      const host = await AsyncStorage.getItem('host');
      const port = await AsyncStorage.getItem('port');
      const token = await AsyncStorage.getItem('token');

      const URL = `${protocol}://${host}:${port}/api/v1/models/mbl_funds_available`
      const response = await axios.get(URL, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const records = response.data.records || [];
      const cashItems = records.filter(item => item.AccountType.id === 'B');
      const bankItems = records.filter(item => item.AccountType.id === 'C');
      setLiquidityData({ cashItems, bankItems });

    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false);
    }
  }


  useEffect(() => {
    fetchData();
  }, [])


  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title={'Liquidity'} />

      <View style={styles.Container}>
        {/* <Card cashItems={liquidityData.cashItems} bankItems={liquidityData.bankItems} /> */}
        <Card
          title={'Funds Available'}
          totalAmount={''}
          Header1={'Cash'}
          totalCashAmount={''}
          Header2={'Bank'}
          totalBankAmount={''}
        />
      </View>
      {isLoading ? <Loader /> : null}
    </View>
  )
}

export default Liquidity

const styles = StyleSheet.create({
  Container: {
    padding: 10,
    marginTop: 10,
  },
})