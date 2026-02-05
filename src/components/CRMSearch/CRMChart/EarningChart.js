// WeeklyEarningsHighlightChartWithDropdown.js
import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import Svg, {Line, Circle, Text as SvgText, G} from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';

const screenWidth = Dimensions.get('window').width;

const EarningChart = ({data, days, width = screenWidth - 40, height = 200}) => {
  const [selectedOption, setSelectedOption] = useState('Weekly');
  const [visible, setVisible] = useState(false);
  const padding = 35;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const maxIndex = data.indexOf(maxValue);

  const scaleY = value =>
    chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight + padding;
  const scaleX = index => (chartWidth / (data.length - 1)) * index + padding;

  const options = ['Weekly', 'Monthly'];

  const handleSelect = option => {
    setSelectedOption(option);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Header - Same design, just tighter */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Weekly Earnings</Text>
          <Text style={styles.total}>₹{(data.reduce((a, b) => a + b, 0)).toLocaleString()}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setVisible(true)}
          activeOpacity={0.7}>
          <Text style={styles.dropdownText}>{selectedOption}</Text>
          <Ionicons name="chevron-down" size={12} color="#2F4FE3" />
        </TouchableOpacity>
      </View>

      {/* Chart - Same design, just tighter */}
      <View style={styles.chartContainer}>
        <Svg width={width} height={height}>
          {/* Grid lines - same design */}
          {[0, 0.25, 0.5, 0.75, 1].map((v, i) => {
            const y = padding + chartHeight * (1 - v);
            const labelValue = Math.round(minValue + (maxValue - minValue) * v);
            
            return (
              <G key={`grid-${i}`}>
                <Line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke={i === 0 ? "#E8EAED" : "#F0F2F5"}
                  strokeWidth={i === 0 ? 1 : 0.5}
                />
                <SvgText
                  x={padding - 6}
                  y={y + 3}
                  fill="#666"
                  fontSize="9"
                  fontFamily="K2D-Medium"
                  textAnchor="end">
                  {`₹${labelValue}`}
                </SvgText>
              </G>
            );
          })}

          {/* Main line - same design */}
          {data.map((value, index) => {
            if (index === 0) return null;
            const x1 = scaleX(index - 1);
            const y1 = scaleY(data[index - 1]);
            const x2 = scaleX(index);
            const y2 = scaleY(value);
            
            return (
              <Line
                key={`line-${index}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#2F4FE3"
                strokeWidth={2}
                strokeLinecap="round"
              />
            );
          })}

          {/* All data points with values - same design */}
          {data.map((value, index) => (
            <G key={`point-${index}`}>
              <Circle
                cx={scaleX(index)}
                cy={scaleY(value)}
                r={3}
                fill="#fff"
                stroke="#2F4FE3"
                strokeWidth={1.5}
              />
              {/* Value labels on hover/peak */}
              {(index === maxIndex || index === 0 || index === data.length - 1) && (
                <SvgText
                  x={scaleX(index)}
                  y={scaleY(value) - 8}
                  fill="#333"
                  fontSize="9"
                  fontFamily="K2D-SemiBold"
                  textAnchor="middle">
                  {`₹${value}`}
                </SvgText>
              )}
            </G>
          ))}

          {/* Highlight max with vertical line - same design */}
          <Line
            x1={scaleX(maxIndex)}
            y1={scaleY(maxValue)}
            x2={scaleX(maxIndex)}
            y2={height - padding + 5}
            stroke="rgba(255, 107, 53, 0.3)"
            strokeWidth={1}
          />

          {/* Max value badge - same design */}
          <G>
            <SvgText
              x={scaleX(maxIndex)}
              y={scaleY(maxValue) - 12}
              fill="#FF6B35"
              fontSize="10"
              fontFamily="K2D-Bold"
              textAnchor="middle">
              {`Peak: ₹${maxValue}`}
            </SvgText>
          </G>

          {/* Day labels - same design */}
          {days.map((day, idx) => (
            <G key={`day-${idx}`}>
              {/* Day indicator line */}
              <Line
                x1={scaleX(idx)}
                y1={height - padding}
                x2={scaleX(idx)}
                y2={height - padding + 3}
                stroke="#666"
                strokeWidth={1}
              />
              <SvgText
                x={scaleX(idx)}
                y={height - padding + 16}
                fill="#666"
                fontSize="10"
                fontFamily="K2D-Medium"
                textAnchor="middle">
                {day}
              </SvgText>
            </G>
          ))}
        </Svg>
      </View>
      {/* Legend - Same design */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.primaryDot]} />
          <Text style={styles.legendText}>Daily Earnings</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.peakDot]} />
          <Text style={styles.legendText}>Peak Value</Text>
        </View>
      </View>

      {/* Dropdown Modal - Same design */}
      <Modal transparent visible={visible} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}>
          <View style={styles.modalContent}>
            {options.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.modalOption,
                  selectedOption === opt && styles.modalOptionActive,
                ]}
                onPress={() => handleSelect(opt)}>
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedOption === opt && styles.modalOptionTextActive,
                  ]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14, // Reduced from 16
    marginBottom: 14, // Reduced from 16
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14, // Reduced from 16
  },
  title: {
    fontSize: 16, // Same
    fontFamily: 'K2D-SemiBold',
    color: '#333',
    marginBottom: 2, // Same
  },
  total: {
    fontSize: 22, // Slightly reduced from 24
    fontFamily: 'K2D-Bold',
    color: '#2F4FE3',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(47, 79, 227, 0.1)',
    borderRadius: 14, // Slightly reduced
    paddingHorizontal: 10, // Reduced from 12
    paddingVertical: 5, // Reduced from 6
  },
  dropdownText: {
    fontSize: 12, // Same
    fontFamily: 'K2D-Medium',
    color: '#2F4FE3',
    marginRight: 4, // Same
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 5, // Reduced from 16
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FF',
    borderRadius: 8, // Reduced from 10
    padding: 5, // Reduced from 12
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3, // Reduced from 4
  },
  statLabel: {
    fontSize: 10, // Same
    fontFamily: 'K2D-Medium',
    color: '#666',
    marginRight: 4, // Same
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 5, // Same
    paddingVertical: 1, // Reduced from 2
    borderRadius: 6, // Reduced from 8
  },
  changeText: {
    fontSize: 9, // Same
    fontFamily: 'K2D-SemiBold',
    color: '#10B981',
    marginLeft: 2, // Same
  },
  statValue: {
    fontSize: 15, // Slightly reduced from 16
    fontFamily: 'K2D-Bold',
    color: '#333',
  },
  peakDay: {
    fontSize: 9, // Same
    fontFamily: 'K2D-Medium',
    color: '#FF6B35',
    marginTop: 1, // Reduced from 2
  },
  statDivider: {
    width: 1,
    height: 20, // Reduced from 40
    backgroundColor: 'rgba(47, 79, 227, 0.1)',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6, // Reduced from 8
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10, // Same
  },
  legendDot: {
    width: 7, // Slightly reduced from 8
    height: 7, // Slightly reduced from 8
    borderRadius: 3.5, // Adjusted
    marginRight: 5, // Slightly reduced from 6
  },
  primaryDot: {
    backgroundColor: '#2F4FE3',
  },
  peakDot: {
    backgroundColor: '#FF6B35',
  },
  legendText: {
    fontSize: 10, // Same
    fontFamily: 'K2D-Medium',
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 4, // Same
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    minWidth: 120,
    position: 'absolute',
    top: 55, // Adjusted from 60
    right: 20,
  },
  modalOption: {
    paddingHorizontal: 16,
    paddingVertical: 9, // Reduced from 10
  },
  modalOptionActive: {
    backgroundColor: 'rgba(47, 79, 227, 0.05)',
  },
  modalOptionText: {
    fontSize: 14,
    fontFamily: 'K2D-Medium',
    color: '#333',
  },
  modalOptionTextActive: {
    color: '#2F4FE3',
    fontFamily: 'K2D-SemiBold',
  },
});

export default EarningChart;