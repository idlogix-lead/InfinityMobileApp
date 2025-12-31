// WeeklyEarningsBarChart.js
import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal } from 'react-native';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SalesChart = ({ data, days, width = 350, height = 200 }) => {
  const [selectedOption, setSelectedOption] = useState('Weekly');
  const [visible, setVisible] = useState(false);

  const padding = 40;
  const chartWidth = width - padding * 3;
  const chartHeight = height - padding * 2;

  const maxValue = Math.max(...data);
  const maxIndex = data.indexOf(maxValue);

  const barWidth = chartWidth / data.length / 1.5; // bar spacing
  const scaleY = value => chartHeight - (value / maxValue) * chartHeight + padding;
  const scaleX = index => (chartWidth / data.length) * index + padding + (barWidth / 2);

  const options = ['Weekly', 'Monthly'];

  const handleSelect = option => {
    setSelectedOption(option);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.row}>
        <Text style={styles.heading}>Earnings</Text>

        <TouchableOpacity style={styles.dropdown} onPress={() => setVisible(true)}>
          <Text style={styles.dropdownText}>{selectedOption}</Text>
          <Ionicons name="chevron-down" size={13} color="rgba(132, 138, 156, 1)" />
        </TouchableOpacity>

        <Modal transparent visible={visible} animationType="fade">
          <TouchableOpacity style={styles.overlay} onPress={() => setVisible(false)}>
            <View style={styles.dropdownList}>
              {options.map(opt => (
                <TouchableOpacity key={opt} style={styles.dropdownItem} onPress={() => handleSelect(opt)}>
                  <Text style={styles.itemText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      <Svg width={width} height={height}>
        {/* Bars */}
        {data.map((value, index) => {
          const x = scaleX(index) - barWidth / 2;
          const y = scaleY(value);
          const h = height - padding - y;

          return (
            <Rect
              key={`bar-${index}`}
              x={x}
              y={y}
              width={barWidth}
              height={h}
              fill={index === maxIndex ? 'rgba(0, 128, 0, 0.5)' : 'rgba(21, 69, 136, 1)'}
              rx={4} // optional rounded corners
            />
          );
        })}

        {/* Max value label */}
        <SvgText
          x={scaleX(maxIndex)}
          y={scaleY(maxValue) - 10}
          fill="orange"
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {`Rs:${maxValue}`}
        </SvgText>

        {/* X-axis labels */}
        {days.map((day, idx) => (
          <SvgText
            key={`day-${idx}`}
            x={scaleX(idx)}
            y={height - padding / 2}
            fill="rgba(132, 138, 156, 1)"
            fontSize="10"
            textAnchor="middle"
          >
            {day}
          </SvgText>
        ))}

        {/* Y-axis horizontal grid lines & labels */}
        {[0.25, 0.5, 0.75, 1].map((v, i) => {
          const y = padding + chartHeight * (1 - v);
          return (
            <React.Fragment key={`grid-${i}`}>
              <Line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e0e0e0" strokeWidth={0.5} />
              <SvgText
                x={padding - 12}
                y={y + 4}
                fill="rgba(132, 138, 156, 1)"
                fontSize="10"
                textAnchor="end"
              >
                {`${Math.round(maxValue * v)}`}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgba(36, 52, 101, 1)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(196, 200, 211, 1)',
    borderRadius: 20,
    height: 28,
    width: 90,
    justifyContent: 'center',
  },
  dropdownText: {
    marginRight: 5,
    fontSize: 13,
    color: 'rgba(132, 138, 156, 1)',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginTop: '-90%',
    marginRight: '-52%',
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 95,
    elevation: 5,
    paddingVertical: 8,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default SalesChart;
