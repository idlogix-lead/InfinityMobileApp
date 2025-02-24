import { StyleSheet, Text, View,FlatList } from 'react-native'
import React from 'react'
import CustomHeader from '../../../components/CustomHeader'
import Card from '../../../components/ReportsComponents/Card'

const Liquidity = () => {
    const data = [
        { id: '1', title: 'May 19',  price:' ربح 525.00',  cash : '50.00', visa:'70.00'},
        { id: '2', title: 'May 16',  price:'ربح 254.50' ,  cash : '60.00', visa:'80.00'},
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