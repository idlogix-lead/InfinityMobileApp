import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const SalarySlipCardView = ({Icon,TitleText,Txt}) => {
  return (
    <View style={styles.ContainerView}>
    <View style={styles.IconView}>
        {Icon}
    </View>
    <View>
      <Text style={styles.TextTop}>{TitleText}</Text>
      <Text style={styles.TextBottom}>{Txt}</Text>
    </View>
  </View>
  )
}

export default SalarySlipCardView

const styles = StyleSheet.create({})