import { StyleSheet, Text, View, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import CustomHeader from '../../../components/CustomHeader'
import Card from '../../../components/ReportsComponents/Card'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Loader from '../../../components/Loader';

const Liquidity = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [liquidityData, setLiquidityData] = useState([]);

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
      setLiquidityData(response.data);

    } catch (error) {
      console.log(error)
    }finally{
      setIsLoading(false);
    }
  }


  useEffect(() => {
    fetchData();
  }, [])
console.log('first')

  return (
    <View style={{flex:1}}>
      <CustomHeader title={'Liquidity'} />

      <View style={styles.Container}>
        <FlatList
          data={liquidityData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            { console.log(item)}
            return (<Card item={item} />)
          }}
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