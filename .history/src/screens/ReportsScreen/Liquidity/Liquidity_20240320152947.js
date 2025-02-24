import { StyleSheet, Text, View,FlatList } from 'react-native'
import React, { useEffect,useState } from 'react'
import CustomHeader from '../../../components/CustomHeader'
import Card from '../../../components/ReportsComponents/Card'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Loader from '../../../components/Loader';

const Liquidity = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
            const protocol = await AsyncStorage.getItem('protocol');
            const host = await AsyncStorage.getItem('host');
            const port = await AsyncStorage.getItem('port');
            const token = await AsyncStorage.getItem('token');

            const URL = `${protocol}://${host}:${port}/api/v1/models/fact_acct`
            console.log(URL)

            const response = await axios.get(URL, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            console.log(JSON.stringify(response.data), 'data')
  }

  useEffect(()=>{
    fetchData();
  },[])

    const data = [
        { id: '1', title: 'May 19',  price:'525.00',  cash : '50.00', visa:'70.00'},
        { id: '2', title: 'May 19',  price:'525.00',  cash : '50.00', visa:'70.00'},
    ];
  return (
    <View>
      <CustomHeader title={'Liquidity'}/>

      <View style={styles.Container}>
           <FlatList 
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <Card  item={item} />}
           />
        </View>
    </View>
  )
}

export default Liquidity

const styles = StyleSheet.create({
    Container:{
        padding:10,
        marginTop:10,
    },
})