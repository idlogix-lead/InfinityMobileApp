import { StyleSheet, Text, View, Dimensions, TouchableOpacity, BackHandler, Platform, useWindowDimensions } from 'react-native'
import React, { useEffect } from 'react'
import CardCompanyInformation from '../../components/CompanyInformationScreen/CardCompanyInformation';
import CustomHeader from '../../components/CustomHeader';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useAuthStore } from '../../store/authStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CompanyInformationScreen = ({ navigation }) => {
    // Get screen dimensions
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    
    // Get data from Zustand store
    const {
        clientName,
        roleName,
        organizationName,
        warehouseName,
    } = useAuthStore();

    useEffect(() => {
        const backAction = () => {
            navigation.goBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, []);

    // Responsive calculations
    const isSmallScreen = width < 375; // iPhone SE, small Android
    const isMediumScreen = width >= 375 && width < 414; // iPhone 8, 11 Pro
    const isLargeScreen = width >= 414; // iPhone Plus, Pro Max
    const isTablet = width >= 768;

    // Responsive sizes
    const getResponsiveValue = (phone, tablet) => isTablet ? tablet : phone;
    
    const profileMarginTop = getResponsiveValue(
        Platform.OS === 'ios' ? 15 + insets.top : 15,
        20
    );
    
    const iconSize = getResponsiveValue(23, 28);
    const profileFontSize = getResponsiveValue(24, 28);
    const cardSpacing = getResponsiveValue(25, 30);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <CustomHeader title={'Company Information'}/>

            <View style={[styles.profileCon, { marginTop: profileMarginTop }]}>
                <Text style={[styles.profileTxt, { fontSize: profileFontSize }]}>
                    Profile
                </Text>
            </View>

            <View style={styles.cardsContainer}>
                <CardCompanyInformation
                    topText="Client"
                    secondtext={clientName || 'Not Selected'}
                    Icon={<FontAwesome5 name='user-tie' size={iconSize} color='#877e7e'/>}
                    spacing={cardSpacing}
                    isTablet={isTablet}
                />

                <CardCompanyInformation
                    topText="Role"
                    secondtext={roleName || 'Not Selected'}
                    Icon={<FontAwesome5 name='user-check' size={iconSize} color='#877e7e'/>}
                    spacing={cardSpacing}
                    isTablet={isTablet}
                />

                <CardCompanyInformation
                    topText="Organization"
                    secondtext={organizationName || 'Not Selected'}
                    Icon={<FontAwesome6 name='users-viewfinder' size={iconSize} color='#877e7e'/>}
                    spacing={cardSpacing}
                    isTablet={isTablet}
                />

                <CardCompanyInformation
                    topText="Company"
                    secondtext={warehouseName || 'Not Selected'}
                    Icon={<MaterialCommunityIcons name='warehouse' size={iconSize} color='#877e7e'/>}
                    spacing={cardSpacing}
                    isTablet={isTablet}
                />
            </View>
        </View>
    )
}

export default CompanyInformationScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    profileCon: {
        width: '90%',
        alignSelf: 'center',
    },
    profileTxt: {
        fontFamily: 'K2D-Regular',
        color: '#00B0F0',
        includeFontPadding: false,
    },
    cardsContainer: {
        width: '100%',
        alignItems: 'center',
    },
});