// WeeklyEarningsHighlightChartWithDropdown.js
import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import Svg, {Line, Circle, Text as SvgText} from 'react-native-svg';
import {Picker} from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

const EarningChart = ({data, days, width = 350, height = 200}) => {
  const [selectedOption, setSelectedOption] = useState('Weekly');
  const [visible, setVisible] = useState(false);
  const padding = 40;
  const chartWidth = width - padding * 3;
  const chartHeight = height - padding * 2;

  const maxValue = Math.max(...data);
  const maxIndex = data.indexOf(maxValue);

  const scaleY = value =>
    chartHeight - (value / maxValue) * chartHeight + padding;
  const scaleX = index => (chartWidth / (data.length - 1)) * index + padding;

  const options = ['Weekly', 'Monthly'];

  const handleSelect = option => {
    setSelectedOption(option);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Header Row */}
      {/* <View style={styles.headerRow}>
        <Text style={styles.heading}>Earnings</Text> */}
      {/* <View style={styles.pickerRow}>
          <Text style={styles.pickerLabel}>{selectedOption}:</Text>
          <Picker
            selectedValue={selectedOption}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedOption(itemValue)}
            mode="dropdown"
          >
            <Picker.Item label="Weekly" value="Weekly" />
            <Picker.Item label="Monthly" value="Monthly" />
          </Picker>
        </View> */}
      {/* <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownText}>Weekly</Text>
          <Ionicons name="chevron-down" size={14} color="#444" />
        </TouchableOpacity>
      </View> */}

      {/* <ChartHeader /> */}

      <View style={styles.row}>
        {/* Heading */}
        <Text style={styles.heading}>Earnings</Text>

        {/* Dropdown */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setVisible(true)}>
          <Text style={styles.dropdownText}>{selectedOption}</Text>
          <Ionicons
            name="chevron-down"
            size={13}
            color="rgba(132, 138, 156, 1)"
          />
        </TouchableOpacity>

        {/* Dropdown Modal */}
        <Modal transparent visible={visible} animationType="fade">
          <TouchableOpacity
            style={styles.overlay}
            onPress={() => setVisible(false)}>
            <View style={styles.dropdownList}>
              {options.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={styles.dropdownItem}
                  onPress={() => handleSelect(opt)}>
                  <Text style={styles.itemText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      <Svg width={width} height={height}>
        {/* Past line */}
        {data.map((value, index) => {
          if (index === 0) return null;
          const x1 = scaleX(index - 1);
          const y1 = scaleY(data[index - 1]);
          const x2 = scaleX(index);
          const y2 = scaleY(value);
          const strokeColor =
            index <= maxIndex ? 'rgba(21, 69, 136, 1)' : 'rgba(21, 69, 136, 1)';
          return (
            <Line
              key={`line-${index}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={strokeColor}
              strokeWidth={2}
            />
          );
        })}

        {/* Highlight max day */}
        <Line
          x1={scaleX(maxIndex)}
          y1={scaleY(maxValue)}
          x2={scaleX(maxIndex)}
          y2={height - padding / .58}
          stroke="orange"
          strokeWidth={1.5}
          strokearray="2,2"
        />
        <Circle
          cx={scaleX(maxIndex)}
          cy={scaleY(maxValue)}
          r={6}
          stroke="orange"
          strokeWidth={2}
          fill="white"
        />

        <SvgText
          x={scaleX(maxIndex)}
          y={scaleY(maxValue) - 12}
          fill="orange"
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="middle">
          {`Rs:${maxValue}`}
        </SvgText> 

        

        {/* X-axis labels */}
        {days.map((day, idx) => (
          <SvgText
            key={`day-${idx}`}
            x={scaleX(idx)}
            y={height - padding / 1}
            fill="rgba(132, 138, 156, 1)"
            fontSize="10"
            textAnchor="middle">
            {day}
          </SvgText>
        ))}

        {/* Y-axis horizontal grid lines & labels */}
        {[0.25, 0.5, 0.75, 1].map((v, i) => {
          const y = padding + chartHeight * (1 - v);
          return (
            <React.Fragment key={`grid-${i}`}>
              <Line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#e0e0e0"
                strokeWidth={0.5}
              />
              <SvgText
                x={padding - 12}
                y={y + 4}
                fill="rgba(132, 138, 156, 1)"
                fontSize="10"
                textAnchor="end">
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
    paddingVertical: 15,
    paddingHorizontal:25,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // chart header styles
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
    // marginTop: 10,
  },

  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(196, 200, 211, 1)',
    borderRadius: 20,
    // paddingHorizontal: 5,
    // paddingVertical: 3,
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
  pickerRow: {
    backgroundColor: '#f6f7fb',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  pickerLabel: {
    fontSize: 14,
    // marginRight: 5,
    color: '#000',
    fontWeight: '500',
  },
  picker: {
    height: 30,
    width: 120,
  },
  // dropdown: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   paddingHorizontal: 10,
  //   paddingVertical: 4,
  //   borderRadius: 12,
  //   borderWidth: 1,
  //   borderColor: 'rgba(196, 200, 211, 1)',
  // },
  // dropdownText: { fontSize: 12, marginRight: 5 },
});

export default EarningChart;

// WeeklyMonthlyEarningsChart.js
// Displays weekly or monthly chart based on dropdown selection

// import React, { useState } from 'react';
// import { View, StyleSheet, Text, TouchableOpacity, Modal } from 'react-native';
// import Svg, { Line, Circle, Text as SvgText } from 'react-native-svg';
// import Ionicons from 'react-native-vector-icons/Ionicons';

// const WeeklyMonthlyEarningsChart = ({
//   weeklyData,
//   weeklyLabels,
//   monthlyData,
//   monthlyLabels,
//   width = 350,
//   height = 200,
// }) => {
//   const [selectedOption, setSelectedOption] = useState('Weekly');
//   const [visible, setVisible] = useState(false);

//   const padding = 40;
//   const chartWidth = width - padding * 3;
//   const chartHeight = height - padding * 2;

//   // choose dataset
//   const data = selectedOption === 'Weekly' ? weeklyData : monthlyData;
//   const labels = selectedOption === 'Weekly' ? weeklyLabels : monthlyLabels;

//   const maxValue = Math.max(...data);
//   const maxIndex = data.indexOf(maxValue);

//   const scaleY = (value) => chartHeight - (value / maxValue) * chartHeight + padding;
//   const scaleX = (index) => (chartWidth / (data.length - 1)) * index + padding;

//   const options = ['Weekly', 'Monthly'];

//   const handleSelect = (option) => {
//     setSelectedOption(option);
//     setVisible(false);
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.row}>
//         <Text style={styles.heading}>Earnings</Text>
//         <TouchableOpacity style={styles.dropdown} onPress={() => setVisible(true)}>
//           <Text style={styles.dropdownText}>{selectedOption}</Text>
//           <Ionicons name="chevron-down" size={18} color="#333" />
//         </TouchableOpacity>

//         {/* Dropdown Modal */}
//         <Modal transparent visible={visible} animationType="fade">
//           <TouchableOpacity style={styles.overlay} onPress={() => setVisible(false)}>
//             <View style={styles.dropdownList}>
//               {options.map((opt) => (
//                 <TouchableOpacity key={opt} style={styles.dropdownItem} onPress={() => handleSelect(opt)}>
//                   <Text style={styles.itemText}>{opt}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </TouchableOpacity>
//         </Modal>
//       </View>

//       {/* Chart */}
//       <Svg width={width} height={height}>
//         {data.map((value, index) => {
//           if (index === 0) return null;
//           const x1 = scaleX(index - 1);
//           const y1 = scaleY(data[index - 1]);
//           const x2 = scaleX(index);
//           const y2 = scaleY(value);
//           const strokeColor = 'rgba(21, 69, 136, 1)';
//           return <Line key={`line-${index}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={strokeColor} strokeWidth={2} />;
//         })}

//         {/* Highlight max point */}
//         <Line
//           x1={scaleX(maxIndex)}
//           y1={scaleY(maxValue)}
//           x2={scaleX(maxIndex)}
//           y2={height - padding / 2}
//           stroke="orange"
//           strokeWidth={1.5}
//         />
//         <Circle cx={scaleX(maxIndex)} cy={scaleY(maxValue)} r={6} stroke="orange" strokeWidth={2} fill="white" />
//         <SvgText
//           x={scaleX(maxIndex)}
//           y={scaleY(maxValue) - 12}
//           fill="orange"
//           fontSize="12"
//           fontWeight="bold"
//           textAnchor="middle"
//           alignmentBaseline="middle"
//         >
//           {`$${maxValue}`}
//         </SvgText>

//         {/* X-axis labels */}
//         {labels.map((label, idx) => (
//           <SvgText
//             key={`label-${idx}`}
//             x={scaleX(idx)}
//             y={height - padding / 2 + 12}
//             fill="rgba(132, 138, 156, 1)"
//             fontSize="10"
//             textAnchor="middle"
//           >
//             {label}
//           </SvgText>
//         ))}

//         {/* Grid lines */}
//         {[0.25, 0.5, 0.75, 1].map((v, i) => {
//           const y = padding + chartHeight * (1 - v);
//           return (
//             <React.Fragment key={`grid-${i}`}>
//               <Line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e0e0e0" strokeWidth={0.5} />
//               <SvgText
//                 x={padding - 10}
//                 y={y + 4}
//                 fill="rgba(132, 138, 156, 1)"
//                 fontSize="10"
//                 textAnchor="end"
//               >
//                 {`$${Math.round(maxValue * v)}`}
//               </SvgText>
//             </React.Fragment>
//           );
//         })}
//       </Svg>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 10,
//     backgroundColor: 'white',
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginHorizontal: 10,
//   },
//   heading: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: 'rgba(36, 52, 101, 1)',
//   },
//   dropdown: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: 'rgba(196, 200, 211, 1)',
//   },
//   dropdownText: { fontSize: 12, marginRight: 5 },
//   overlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.2)',
//     marginTop: '-90%',
//     marginRight: '-52%',
//   },
//   dropdownList: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     width: 95,
//     elevation: 5,
//     paddingVertical: 8,
//   },
//   dropdownItem: {
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//   },
//   itemText: {
//     fontSize: 16,
//     color: '#333',
//   },
// });

// export default WeeklyMonthlyEarningsChart;