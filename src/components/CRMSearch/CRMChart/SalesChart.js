// CenterCircularChart.js - Circle in center with horizontal content below
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;

const CenterCircularChart = ({ data, labels, isRefreshing }) => {
  const [selectedSegment, setSelectedSegment] = useState(null);

  // Default data if empty
  const chartData = data && data.length > 0 ? data : [1, 1, 1];
  const chartLabels = labels && labels.length > 0 ? labels : ['Won', 'Progress', 'Lost'];
  
  const total = chartData.reduce((a, b) => a + b, 0);
  
  // Colors for segments
  const colors = ['#10B981', '#F59E0B', '#EF4444', '#2F4FE3', '#8B5CF6'];
  
  // Create segments data
  const createSegments = () => {
    if (total === 0) {
      return chartData.map((_, index) => ({
        value: 0,
        percentage: (100 / chartData.length).toFixed(0),
        label: chartLabels[index],
        color: colors[index % colors.length],
        index
      }));
    }
    
    let cumulativeAngle = 0;
    const segments = [];
    
    chartData.forEach((value, index) => {
      const percentage = (value / total) * 100;
      const segment = {
        value,
        percentage: percentage.toFixed(0),
        label: chartLabels[index],
        color: colors[index % colors.length],
        startAngle: cumulativeAngle,
        endAngle: cumulativeAngle + (percentage * 3.6),
        index
      };
      
      segments.push(segment);
      cumulativeAngle = segment.endAngle;
    });
    
    return segments;
  };

  const segments = createSegments();

  // Calculate center text
  const centerValue = selectedSegment ? `${selectedSegment.percentage}%` : `${segments.length}`;
  const centerLabel = selectedSegment ? selectedSegment.label : 'Items';

  const handleSegmentPress = (segment) => {
    setSelectedSegment(segment);
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Sales Status</Text>
        <Text style={styles.chartSubtitle}>Opportunities Distribution</Text>
      </View>
      
      {/* Circular Chart in Center */}
      <View style={styles.centerChartContainer}>
        <Svg width={120} height={120} viewBox="0 0 120 120">
          {/* Background circle */}
          <Circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#F3F4F6"
            strokeWidth="10"
          />
          
          {/* Segments */}
          {segments.map((segment, index) => {
            if (segment.percentage === '0') return null;
            
            return (
              <G key={`segment-${index}`}>
                <Circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="10"
                  strokeDasharray={`${segment.percentage} ${100 - segment.percentage}`}
                  strokeDashoffset="-25"
                  transform="rotate(-90, 60, 60)"
                />
              </G>
            );
          })}
          
          {/* Center circle */}
          <Circle
            cx="60"
            cy="60"
            r="25"
            fill="#fff"
          />
          
          {/* Center text */}
          <SvgText
            x="60"
            y="55"
            fill="#2F4FE3"
            fontSize="12"
            fontFamily="K2D-Bold"
            textAnchor="middle"
          >
            {centerValue}
          </SvgText>
          <SvgText
            x="60"
            y="68"
            fill="#666"
            fontSize="9"
            fontFamily="K2D-Medium"
            textAnchor="middle"
          >
            {centerLabel}
          </SvgText>
        </Svg>
      </View>
      
      {/* Horizontal Content Below */}
      <View style={styles.horizontalContent}>
        {segments.map((segment, index) => (
          <TouchableOpacity
            key={`content-${index}`}
            style={[
              styles.contentItem,
              selectedSegment?.index === index && styles.contentItemActive
            ]}
            onPress={() => handleSegmentPress(segment)}
            activeOpacity={0.7}
            disabled={isRefreshing}
          >
            <View style={styles.contentTop}>
              <View style={[styles.contentDot, { backgroundColor: segment.color }]} />
              <Text style={styles.contentLabel}>{segment.label}</Text>
            </View>
            <Text style={styles.contentValue}>{segment.value}</Text>
            <Text style={styles.contentPercentage}>{segment.percentage}%</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  chartHeader: {
    alignItems: 'flex-start',
    marginBottom: 5,
    marginRight:10,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'K2D-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  chartSubtitle: {
    fontSize: 12,
    fontFamily: 'K2D-Regular',
    color: '#666',
  },
  centerChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 110,
    marginBottom:5,
  },
  horizontalContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contentItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  contentItemActive: {
    backgroundColor: 'rgba(47, 79, 227, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(47, 79, 227, 0.2)',
  },
  contentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  contentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  contentLabel: {
    fontSize: 11,
    fontFamily: 'K2D-Medium',
    color: '#333',
    textAlign: 'center',
  },
  contentValue: {
    fontSize: 18,
    fontFamily: 'K2D-Bold',
    color: '#2F4FE3',
    marginBottom: 2,
  },
  contentPercentage: {
    fontSize: 11,
    fontFamily: 'K2D-Medium',
    color: '#666',
  },
});

export default CenterCircularChart;