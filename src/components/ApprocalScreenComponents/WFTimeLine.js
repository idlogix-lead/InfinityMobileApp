import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Switch,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const WFTimeline = ({steps}) => {
  const scrollRef = useRef(null);
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [showSteps, setShowSteps] = useState(false); // 👈 Toggle state

  // Active step index
  const activeIndex = steps.findIndex(s => s.status === 'pending');
  const currentIndex = activeIndex === -1 ? steps.length - 1 : activeIndex;

  const doneCount = steps.filter(s => s.status === 'done').length;
  const progressPercent = Math.round((doneCount / steps.length) * 100);

  // Auto scroll when steps visible
  useEffect(() => {
    if (showSteps) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          x: currentIndex * 140,
          animated: true,
        });
      }, 300);
    }
  }, [currentIndex, showSteps]);

  // Glow animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, []);

  // Progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercent,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [progressPercent]);

  const getColor = status => {
    if (status === 'done') return '#4CAF7D';
    if (status === 'pending') return '#2E7D57';
    return '#9CA3AF';
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View>
      {/* 🔥 PROGRESS BAR + TOGGLE */}
      <View style={styles.progressContainer}>
        {/* 👇 Toggle */}
        <View style={styles.toggleWrap}>
          <Text style={styles.toggleLabel}>Workflow Timeline</Text>
          <Switch
            value={showSteps}
            onValueChange={setShowSteps}
            trackColor={{false: '#D1D5DB', true: '#77DD77'}}
            thumbColor={'#fff'}
          />
        </View>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>{progressPercent}% Completed</Text>
        </View>

        <View style={styles.progressBg}>
          <Animated.View
            style={[styles.progressFill, {width: progressWidth}]}
          />
        </View>

        {/* 👇 Steps Visible Only When Toggle True */}
        {showSteps && (
          <ScrollView
            horizontal
            ref={scrollRef}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}>
            {steps.map((step, index) => {
              const isActive = index === currentIndex;
              const color = getColor(step.status);

              const glow = glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 12],
              });

              return (
                <View key={step.id} style={styles.stepWrap}>
                  {index !== 0 && (
                    <View style={[styles.line, {backgroundColor: color}]} />
                  )}

                  <Animated.View
                    style={[
                      styles.circle,
                      {
                        borderColor: color,
                        shadowColor: color,
                        shadowRadius: isActive ? glow : 0,
                      },
                    ]}>
                    <MaterialIcons
                      name={step.status === 'done' ? 'check' : 'circle'}
                      size={18}
                      color={color}
                    />
                  </Animated.View>

                  <Text style={styles.stepTitle}>{step.step}</Text>
                  <Text style={styles.user}>{step.user}</Text>
                  <Text style={styles.date}>{step.date}</Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default WFTimeline;

const styles = StyleSheet.create({
  progressContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },

  progressBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },

  progressFill: {
    height: 8,
    backgroundColor: '#2E7D57',
    borderRadius: 8,
  },

  progressText: {
    marginTop: 6,
    fontSize: 12,
    color: '#374151',
    fontFamily: 'K2D-SemiBold',
  },

  container: {
    paddingVertical: '5%',
    top: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    right: 20,
    // backgroundColor:'#ccc',
  },

  stepWrap: {
    width: 120,
    alignItems: 'center',
  },

  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },

  line: {
    position: 'absolute',
    top: 18,
    left: -40,
    width: 80,
    height: 2,
  },

  stepTitle: {
    fontSize: 13,
    fontFamily: 'K2D-SemiBold',
    marginTop: 6,
    textAlign: 'center',
  },

  user: {
    fontSize: 11,
    color: '#374151',
    textAlign: 'center',
  },

  date: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  toggleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  toggleLabel: {
    fontSize: 15,
    fontFamily: 'K2D-SemiBold',
    color: '#000',
    marginBottom: 8,
  },
});
