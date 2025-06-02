// import React from 'react';
// import {View, Text, StyleSheet, Linking, TouchableOpacity} from 'react-native';
// import QRCodeScanner from 'react-native-qrcode-scanner';
// import {RNCamera} from 'react-native-camera';

// const QRScannerScreen = () => {
//   const onSuccess = e => {
//     alert(`QR Code Data: ${e.data}`);
//     // Example: Linking.openURL(e.data) if it's a URL
//   };

//   return (
//     <View style={styles.container}>
//       <QRCodeScanner
//         onRead={onSuccess}
//         flashMode={RNCamera.Constants.FlashMode.off}
//         showMarker={true}
//         reactivate={true}
//         reactivateTimeout={2000}
//         topContent={
//           <Text style={styles.centerText}>
//             QR Code ko camera ke samne layein
//           </Text>
//         }
//         bottomContent={
//           <TouchableOpacity style={styles.buttonTouchable}>
//             <Text style={styles.buttonText}>
//               QR Code Scan Karne Ke Liye Tayyar
//             </Text>
//           </TouchableOpacity>
//         }
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   centerText: {
//     fontSize: 18,
//     padding: 32,
//     color: '#000',
//     textAlign: 'center',
//   },
//   buttonText: {
//     fontSize: 16,
//     color: 'white',
//   },
//   buttonTouchable: {
//     padding: 16,
//     backgroundColor: '#2196f3',
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 20,
//   },
// });

// export default QRScannerScreen;

// import React, {useEffect, useState} from 'react';
// import {View, Text, StyleSheet, Alert} from 'react-native';
// import {Camera, useCameraDevices} from 'react-native-vision-camera';
// import {useScanBarcodes, BarcodeFormat} from 'vision-camera-code-scanner';

// const QRScannerScreen = () => {
//   const [hasPermission, setHasPermission] = useState(false);
//   const devices = useCameraDevices();
//   const device = devices.back;

//   const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
//     checkInverted: true,
//   });

//   useEffect(() => {
//     (async () => {
//       const status = await Camera.requestCameraPermission();
//       setHasPermission(status === 'authorized');
//     })();
//   }, []);

//   useEffect(() => {
//     if (barcodes.length > 0) {
//       const data = barcodes[0].rawValue;
//       if (data) {
//         Alert.alert('QR Code', data);
//         // Optional: Navigate or open URL
//         // Linking.openURL(data);
//       }
//     }
//   }, [barcodes]);

//   if (!device || !hasPermission) {
//     return (
//       <View style={styles.centered}>
//         <Text>Camera loading ya permission ka intezar...</Text>
//       </View>
//     );
//   }

//   return (
//     <Camera
//       style={StyleSheet.absoluteFill}
//       device={device}
//       isActive={true}
//       frameProcessor={frameProcessor}
//       frameProcessorFps={5}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default QRScannerScreen;

import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

const QRScannerScreen = () => {
  return (
    <View>
      <Text style={{color: 'black', fontSize: 30}}>QRScannerScreen</Text>
    </View>
  );
};

export default QRScannerScreen;

const styles = StyleSheet.create({});
