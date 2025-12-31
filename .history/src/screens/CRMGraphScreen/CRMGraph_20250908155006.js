import {StyleSheet, Text, View, ScrollView} from 'react-native';
import React from 'react';
import {BarChart} from 'react-native-chart-kit';
import Foundation from 'react-native-vector-icons/Foundation';

const CRMGraph = () => {
  return (
    <View>
      <View>
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
              <Text style={styles.salesAmount}>
                Rs: {totalOpportunity.toFixed(2)}
              </Text>
            </View>
            <View style={styles.opportunityValue}>
              <Text style={{color: '#000'}}>
                Rs: {totalOpportunity.toFixed(2)}
              </Text>
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

const styles = StyleSheet.create({});
