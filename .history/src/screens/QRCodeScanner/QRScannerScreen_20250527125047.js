import React from 'react';
import {View, Text, StyleSheet, Linking, TouchableOpacity} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import {CameraKitCameraScreen} from 'react-native-camera-kit';

const QRScannerScreen = () => {
  const onSuccess = e => {
    alert(`QR Code Data: ${e.data}`);
    // Example: Linking.openURL(e.data) if it's a URL
  };

  return (
    <View style={styles.container}>
      {/* <QRCodeScanner
        onRead={onSuccess}
        flashMode={RNCamera.Constants.FlashMode.off}
        showMarker={true}
        reactivate={true}
        reactivateTimeout={2000}
        topContent={
          <Text style={styles.centerText}>
            QR Code ko camera ke samne layein
          </Text>
        }
        bottomContent={
          <TouchableOpacity style={styles.buttonTouchable}>
            <Text style={styles.buttonText}>
              QR Code Scan Karne Ke Liye Tayyar
            </Text>
          </TouchableOpacity>
        }
      /> */}
      <CameraKitCameraScreen
        showFrame={true}
        scanBarcode={true}
        onReadCode={event => {
          alert('QR Code: ' + event.nativeEvent.codeStringValue);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerText: {
    fontSize: 18,
    padding: 32,
    color: '#000',
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
  },
  buttonTouchable: {
    padding: 16,
    backgroundColor: '#2196f3',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
});

export default QRScannerScreen;
