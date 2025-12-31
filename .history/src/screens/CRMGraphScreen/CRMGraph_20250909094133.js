import {StyleSheet, Text, View, ScrollView, Dimensions} from 'react-native';
import React, {useState} from 'react';
import {BarChart} from 'react-native-chart-kit';
import Foundation from 'react-native-vector-icons/Foundation';

const screenWidth = Dimensions.get('window').width;

const CRMGraph = () => {
  const [salesCall, setSalesCall] = useState([]);

  // OpportunityAmt Function
  const totalOpportunity = salesCall.reduce((sum, item) => {
    const amount = parseFloat(item?.OpportunityAmt) || 0;
    return sum + amount;
  }, 0);

  const monthlyOpportunities = [
    20.5, 35.2, 50.1, 45.3, 60.8, 75.0, 80.9, 55.2, 90.1, 40.4, 65.6, 70.3,
  ];
  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <View style={{marginTop: 60}}>
        <View style={styles.salesContainer}>
          <View style={styles.SaleCard}>
            <View>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{
                    backgroundColor: '#69c9ca',
                    height: 36,
                    width: 36,
                    borderRadius: 18,
                    textAlign: 'center',
                    marginTop: -5,
                    paddingTop: 5,
                  }}>
                  <Foundation name="dollar" size={25} color={'#fff'} />
                </Text>
                <Text style={styles.salesTitle}>Total Sales</Text>
              </View>
              <Text style={styles.salesAmount}>Rs:</Text>
            </View>
            <View style={styles.opportunityValue}>
              <Text style={{color: '#000'}}>Rs:</Text>
            </View>
          </View>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {/* API K sath graph */}
            <BarChart
              data={{
                labels: [
                  'Jan',
                  'Feb',
                  'Mar',
                  'Apr',
                  'May',
                  'Jun',
                  'Jul',
                  'Aug',
                  'Sep',
                  'Oct',
                  'Nov',
                  'Dec',
                ],
                datasets: [
                  {
                    data: monthlyOpportunities,
                  },
                ],
              }}
              width={screenWidth * 2}
              height={210}
              yAxisLabel="Rs: "
              chartConfig={{
                backgroundGradientFrom: '#f4fafa',
                backgroundGradientTo: '#f4fafa',
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                barPercentage: 0.5,
              }}
              withInnerLines={true}
              withVerticalLabels={true}
              showBarTops={true}
              style={styles.chart}
              decorator={() => {
                return monthlyOpportunities.map((value, index) => {
                  const barWidth = (screenWidth * 2) / 12;
                  return (
                    <Svg
                      key={index}
                      height="250"
                      width={screenWidth * 2}
                      style={{position: 'absolute'}}>
                      <SvgText
                        x={barWidth * index + barWidth / 2}
                        y={250 - value * 2 - 10} // Adjust the position above bar
                        fontSize="12"
                        fill="black"
                        textAnchor="middle">
                        {value.toFixed(0)}
                      </SvgText>
                    </Svg>
                  );
                });
              }}
            />
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default CRMGraph;

const styles = StyleSheet.create({
  salesContainer: {
    backgroundColor: '#f4fafa',
    borderRadius: 10,
    margin: 10,
    borderWidth: 2,
    borderColor: 'gray',
    marginTop: -5,
  },
  SaleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingLeft: 20,
  },
  opportunityValue: {
    height: 29,
    borderRadius: 15,
    backgroundColor: '#f9def4',
    right: 10,
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
  },
  salesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  salesAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  chart: {
    alignSelf: 'center',
  },
});
