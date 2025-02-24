// import { Button, StyleSheet, Text, View } from 'react-native';
// import React, { useState } from 'react';

// // const swapValues = (a, b) => {
// //   return [b, a]; 
// // };

// const JsFile = () => {
// //   let a = 5, b = 10;
// //   [a, b] = swapValues(a, b); 

//   const[value, setValue] = useState({a:10, b:15})

//   const swapperValus = () =>{
//     setValue({a:value.b, b:value.a})
//   }


//   return (
//     <View style={styles.container}>
//       {/* <Text style={styles.text}>Swapped Values: a = {a}, b = {b}</Text> */}
//       <Text style={styles.text}>Value Swapper = a{value.a}, b{value.b}  </Text>
//       <Button title="Swap" onPress={swapperValus} />
//     </View>
//   );
// };

// export default JsFile;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   text: {
//     backgroundColor: 'red',
//     fontSize: 20,
//     padding: 10,
//     color: 'white',
//   },
// });



import { Button, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'

const JsFIle = () => {
    const[value, setValue] = useState({a:10, b:15})

    const swapperValues = () =>{
        setValue({a:value.b,b:value.a})
    }
  return (
    <View>
      <Text style={{backgroundColor:"red"}}>JsFIle</Text>
      <Text style={{backgroundColor:"red"}}>Value a={value.a},b{value.b}</Text>
      <Button title="Swap" onPress={swapperValues} />
    </View>
  )
}

export default JsFIle

const styles = StyleSheet.create({})