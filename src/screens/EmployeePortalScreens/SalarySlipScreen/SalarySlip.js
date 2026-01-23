// src/screens/EmployeePortal/SalarySlip/SalarySlip.js
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSalarySlips } from '../../../hooks/useSalary';
import Loader from '../../../components/Loader';
import CustomHeader from '../../../components/CustomHeader';
import SalarySlipCardView from '../../../components/EmployeePortalComponents/SalarySlipComponents/SalarySlipCardView';

const SalarySlip = ({ navigation }) => {
  const { 
    data: salaryData = { records: [], latestPeriod: '', latestData: {} }, 
    isLoading 
  } = useSalarySlips();
  
  const [selectedPeriod, setSelectedPeriod] = useState(salaryData.latestPeriod);
  const [selectedPeriodData, setSelectedPeriodData] = useState(salaryData.latestData);

  const size = 26;
  const color = '#0050c0';

  // Handle period selection
  const handlePeriodChange = (itemValue) => {
    setSelectedPeriod(itemValue);
    const selectedData = salaryData.records.find(
      (item) => item.HR_Period_ID?.identifier === itemValue
    );
    setSelectedPeriodData(selectedData || {});
  };

  // Format currency values
  const formatCurrency = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toFixed(2);
  };

  // Salary items configuration
  const salaryItems = [
    {
      id: 1,
      icon: 'account-cash',
      title: 'Gross Salary',
      value: selectedPeriodData.p_gross,
      key: 'p_gross'
    },
    {
      id: 2,
      icon: 'cash-minus',
      title: 'Deduction',
      value: selectedPeriodData.total_deductions,
      key: 'total_deductions'
    },
    {
      id: 3,
      icon: 'cash-plus',
      title: 'Allowance',
      value: selectedPeriodData.total_additions,
      key: 'total_additions'
    },
    {
      id: 4,
      icon: 'form-select',
      title: 'Tax',
      value: selectedPeriodData.tax,
      key: 'tax'
    },
    {
      id: 5,
      icon: 'currency-inr',
      title: 'Net Salary',
      value: selectedPeriodData.p_net,
      key: 'p_net'
    }
  ];

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title="Salary Slip" />
      
      {/* Period Picker */}
      {salaryData.records.length > 0 && (
        <View style={styles.PickerContainer}>
          <Picker
            style={styles.PickerStyle}
            dropdownIconColor={'#000'}
            selectedValue={selectedPeriod}
            onValueChange={handlePeriodChange}
          >
            {salaryData.records.map((item) => (
              <Picker.Item
                key={item.HR_Period_ID?.identifier || item.StartDate}
                label={item.HR_Period_ID?.identifier || 'N/A'}
                value={item.HR_Period_ID?.identifier || ''}
              />
            ))}
          </Picker>
        </View>
      )}

      {/* Selected Period Info */}
      {selectedPeriod && (
        <View style={styles.periodInfo}>
          <Text style={styles.periodText}>Selected Period: {selectedPeriod}</Text>
          {selectedPeriodData.StartDate && (
            <Text style={styles.dateText}>
              {new Date(selectedPeriodData.StartDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          )}
        </View>
      )}

      {/* Salary Details */}
      <View style={styles.contentContainer}>
        <Text style={styles.textHeading}>HR Payroll Movement</Text>
        
        <View style={styles.cardsContainer}>
          {salaryItems.map((item) => (
            <SalarySlipCardView
              key={item.id}
              Icon={<MaterialCommunityIcons name={item.icon} size={size} color={color} />}
              TitleText={item.title}
              Txt={formatCurrency(item.value)}
            />
          ))}
        </View>

        {/* Summary Card */}
        {selectedPeriodData.p_net && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Salary Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Gross Salary:</Text>
              <Text style={styles.summaryValue}>₹{formatCurrency(selectedPeriodData.p_gross)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Deductions:</Text>
              <Text style={[styles.summaryValue, styles.deductionValue]}>
                -₹{formatCurrency(selectedPeriodData.total_deductions)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Allowances:</Text>
              <Text style={[styles.summaryValue, styles.allowanceValue]}>
                +₹{formatCurrency(selectedPeriodData.total_additions)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.summaryLabel}>Net Salary:</Text>
              <Text style={[styles.summaryValue, styles.netSalaryValue]}>
                ₹{formatCurrency(selectedPeriodData.p_net)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* No Data Message */}
      {!isLoading && salaryData.records.length === 0 && (
        <View style={styles.noDataContainer}>
          <MaterialCommunityIcons name="file-document-outline" size={50} color="#ccc" />
          <Text style={styles.noDataText}>No salary slips available</Text>
          <Text style={styles.noDataSubtext}>Salary slips will appear here once processed</Text>
        </View>
      )}

      {isLoading && <Loader />}
    </View>
  );
};

export default SalarySlip;

const styles = StyleSheet.create({
  PickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '90%',
    alignSelf: 'center',
    marginTop: '3%',
    borderRadius: 7,
    backgroundColor: '#fff',
  },
  PickerStyle: {
    color: '#000',
  },
  periodInfo: {
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  periodText: {
    fontFamily: 'K2D-SemiBold',
    fontSize: 16,
    color: '#333',
  },
  dateText: {
    fontFamily: 'K2D-Regular',
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  contentContainer: {
    paddingHorizontal: 15,
    marginTop: 20,
  },
  textHeading: {
    color: '#000',
    fontFamily: 'K2D-Bold',
    fontSize: 20,
    marginBottom: 15,
  },
  cardsContainer: {
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 10,
  },
  summaryTitle: {
    fontFamily: 'K2D-Bold',
    fontSize: 18,
    color: '#000',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 5,
  },
  summaryLabel: {
    fontFamily: 'K2D-Regular',
    fontSize: 16,
    color: '#333',
  },
  summaryValue: {
    fontFamily: 'K2D-SemiBold',
    fontSize: 16,
    color: '#000',
  },
  deductionValue: {
    color: '#FF3B30',
  },
  allowanceValue: {
    color: '#34C759',
  },
  netSalaryValue: {
    color: '#2F4FE3',
    fontSize: 18,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  noDataText: {
    fontFamily: 'K2D-SemiBold',
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    marginBottom: 5,
  },
  noDataSubtext: {
    fontFamily: 'K2D-Regular',
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});