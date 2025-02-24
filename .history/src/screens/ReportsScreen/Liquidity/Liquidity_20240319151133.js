import { StyleSheet, Text, View,FlatList } from 'react-native'
import React from 'react'
import CustomHeader from '../../../components/CustomHeader'
import Card from '../../../components/ReportsComponents/Card'

const Liquidity = () => {
    const data = [
        { id: '1', title: 'May 19',  price:' ربح 525.00',  cash : '50.00', visa:'70.00'},
        { id: '2', title: 'May 16',  price:'ربح 254.50' ,  cash : '60.00', visa:'80.00'},
        { id: '3', title: 'May 15',  price:'ربح 1,031.00', cash : '10.00', visa:'100.00'},
        { id: '4', title: 'May 14',  price:' ربح 75.00',   cash : '30.00', visa:'30.00'},
        { id: '5', title: 'May 13',  price:' ربح 65.00' ,  cash : '120.00',visa:'20.00'},
    ];
  return (
    <View>
      <CustomHeader title={'Liquidity'}/>

      <View>
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

const styles = StyleSheet.create({})