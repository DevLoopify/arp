import utilityIcons, { getUtilityIcon } from "@/constants/utilityIcons"
import { Ionicons } from "@expo/vector-icons"
import Slider from "@react-native-community/slider"
import { useRef, useState } from "react"
import { Animated, Dimensions, Modal, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import useCurrentLocation from "../hooks/useCurrentLocation"
import MapContainer from "./MapContainer"

const UTILITIES = Object.keys(utilityIcons)

const { width: SCREEN_WIDTH } = Dimensions.get("window")
const TOGGLE_WIDTH = SCREEN_WIDTH - 32
const TOGGLE_HEIGHT = 50
const KNOB_MARGIN = 4
const KNOB_WIDTH = TOGGLE_WIDTH / 2 - KNOB_MARGIN * 2
const KNOB_HEIGHT = TOGGLE_HEIGHT - KNOB_MARGIN * 2

export default function FilterPopup({ visible, onClose }) {
    const [noiseLevel, setNoiseLevel] = useState(null)
    const [radius, setRadius] = useState(500)
    const [workMode, setWorkMode] = useState('solo')
    const [selectedUtilities, setSelectedUtilities] = useState([])
    const [showAppliedToast, setShowAppliedToast] = useState(false)
    const slideAnim = useRef(new Animated.Value(0)).current
    const { location, permissionGranted } = useCurrentLocation()
    const panResponder = useRef(
    PanResponder.create({
  onStartShouldSetPanResponder: () => true,
  onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
  onPanResponderRelease: (_, g) => {
    if (g.dy > 80) onClose()
  },
})
    ).current

    const knobTranslateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [KNOB_MARGIN, TOGGLE_WIDTH - KNOB_WIDTH - KNOB_MARGIN],
    })

    const toggleUtility = (utility) => {
        setSelectedUtilities((prev) =>
            prev.includes(utility) ? prev.filter((u) => u !== utility) : [...prev, utility]
        )
    }

    const toggleWorkMode = () => {
        const next = workMode === 'solo' ? 'group' : 'solo'
        setWorkMode(next)
        Animated.timing(slideAnim, {
            toValue: next === 'group' ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start()
    }

    const handleReset = () => {
        setNoiseLevel(null)
        setRadius(500)
        setSelectedUtilities([])
        setWorkMode('solo')
        slideAnim.setValue(0)
    }

    const handleApply = () => {
        onClose()
        setShowAppliedToast(true)
        setTimeout(() => setShowAppliedToast(false), 1200)
    }

    return (
    <>
    <Modal visible={visible} transparent animationType="slide" >
        <View style={styles.overlay}>
            <View style={styles.sheet} >
            <View style={styles.handleArea} {...panResponder.panHandlers}>
                <View style={styles.handle} />
                <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
                    <Ionicons name="close" size={24} />
                </Pressable>
            </View>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View>
                  <Text style={styles.title}>Noise Level</Text>
                  <View style={styles.noiseRow}>
                      <Pressable
                        onPress={() => setNoiseLevel('quiet')}
                        style={[
                          styles.noiseBox,
                          styles.quietBox,
                          noiseLevel === 'quiet' && styles.quietBoxSelected,
                        ]}
                      >
                        <Text style={noiseLevel === 'quiet' && styles.noiseTextSelected}>Quiet</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setNoiseLevel('average')}
                        style={[
                          styles.noiseBox,
                          styles.averageBox,
                          noiseLevel === 'average' && styles.averageBoxSelected,
                        ]}
                      >
                        <Text style={noiseLevel === 'average' && styles.noiseTextSelected}>Average</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setNoiseLevel('noisy')}
                        style={[
                          styles.noiseBox,
                          styles.noisyBox,
                          noiseLevel === 'noisy' && styles.noisyBoxSelected,
                        ]}
                      >
                        <Text style={noiseLevel === 'noisy' && styles.noiseTextSelected}>Noisy</Text>
                      </Pressable>
                  </View>
                </View>
                <View style={styles.radiusSection}>
                  <View style={styles.radiusTitleRow}>
                    <Text style={[styles.title, styles.radiusTitleText]}>Radius</Text>
                    <Text style={styles.radiusValue}>{radius} m</Text>
                  </View>
                  <View style={styles.mapWrapper}>
                    <MapContainer
                      isFullScreen
                      userLocation={location}
                      permissionGranted={permissionGranted}
                      radius={radius}
                    />
                  </View>
                  <View style={styles.sliderContainer}>
                    <Slider
                      style={styles.slider}
                      minimumValue={100}
                      maximumValue={5000}
                      step={100}
                      value={radius}
                      onValueChange={setRadius}
                      minimumTrackTintColor="#1E88E5"
                      maximumTrackTintColor="#ccc"
                      thumbTintColor="#1E88E5"
                    />
                  </View>
                </View>
                <View style={styles.workModeSection}>
                  <Text style={styles.title}>Work Mode</Text>
                  <Pressable onPress={toggleWorkMode} style={styles.toggleButton}>
                    <Animated.View
                      style={[styles.toggleKnob, { transform: [{ translateX: knobTranslateX }] }]}
                    />
                    <Text style={styles.toggleLabel}>
                      {workMode === 'solo' ? 'Solo Work' : 'Group Work'}
                    </Text>
                  </Pressable>
                </View>
                <View style={styles.utilitiesSection}>
                  <Text style={styles.title}>Utilities</Text>
                  <View style={styles.utilitiesGrid}>
                    {UTILITIES.map((utility) => {
                      const selected = selectedUtilities.includes(utility)
                      return (
                        <Pressable
                          key={utility}
                          onPress={() => toggleUtility(utility)}
                          style={[styles.utilityChip, selected && styles.utilityChipSelected]}
                        >
                          <Ionicons
                            name={getUtilityIcon(utility)}
                            size={16}
                            color={selected ? 'white' : '#1E88E5'}
                          />
                          <Text style={[styles.utilityChipText, selected && styles.utilityChipTextSelected]}>
                            {utility}
                          </Text>
                        </Pressable>
                      )
                    })}
                  </View>
                </View>
            </ScrollView>
            <View style={styles.footer}>
                <Pressable onPress={handleReset} style={[styles.footerButton, styles.resetButton]}>
                    <Text style={styles.resetButtonText}>Reset</Text>
                </Pressable>
                <Pressable onPress={handleApply} style={[styles.footerButton, styles.applyButton]}>
                    <Text style={styles.applyButtonText}>Apply</Text>
                </Pressable>
            </View>
            </View>
        </View>
    </Modal>
    <Modal visible={showAppliedToast} transparent animationType="fade">
        <View style={styles.toastOverlay} pointerEvents="none">
            <View style={styles.toast}>
                <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                <Text style={styles.toastText}>Filter applied</Text>
            </View>
        </View>
    </Modal>
    </>
  )
}

const styles = StyleSheet.create({
    overlay: {
  flex: 1,
  justifyContent: 'flex-end',  // Sheet von unten
},
sheet: {
  height: '93%',
  backgroundColor: 'white',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
},
handle: {
  width: 40,
  height: 4,
  backgroundColor: '#ccc',
  borderRadius: 2,
  alignSelf: 'center',
  marginTop: 8,
  marginBottom: 8,
},
handleArea: {
  width: '100%',
  paddingVertical: 16,
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
},
closeButton: {
  position: 'absolute',
  left: 16,
  top: 0,
  bottom: 0,
  justifyContent: 'center',
},
title: {
  fontSize: 20,
  fontWeight: '600',
  paddingHorizontal: 16,
  marginBottom: 8,
},
utilitiesSection: {
  marginTop: 24,
},
utilitiesGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  paddingHorizontal: 16,
  gap: 8,
},
utilityChip: {
  width: '47%',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderRadius: 8,
  backgroundColor: '#DCEEFB',
},
utilityChipSelected: {
  backgroundColor: '#1E88E5',
},
utilityChipText: {
  fontSize: 14,
  fontWeight: '500',
  color: '#1E88E5',
  textTransform: 'capitalize',
},
utilityChipTextSelected: {
  color: 'white',
  fontWeight: '700',
},
noiseRow: {
  flexDirection: 'row',
  gap: 8,
  paddingHorizontal: 16,
},
noiseBox: {
  flex: 1,
  paddingVertical: 12,
  alignItems: 'center',
  borderRadius: 8,
  borderWidth: 2,
  borderColor: 'transparent',
},
quietBox: {
  backgroundColor: '#DFF5E1',
},
quietBoxSelected: {
  backgroundColor: '#4CAF50',
  borderColor: '#2E7D32',
},
averageBox: {
  backgroundColor: '#FFF3CD',
},
averageBoxSelected: {
  backgroundColor: '#FFC107',
  borderColor: '#B28704',
},
noisyBox: {
  backgroundColor: '#FDE0E0',
},
noisyBoxSelected: {
  backgroundColor: '#F44336',
  borderColor: '#B71C1C',
},
noiseTextSelected: {
  color: 'white',
  fontWeight: '700',
},
radiusSection: {
  marginTop: 24,
},
radiusTitleRow: {
  flexDirection: 'row',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
},
radiusTitleText: {
  paddingHorizontal: 0,
  marginBottom: 0,
},
mapWrapper: {
  width: SCREEN_WIDTH,
  height: SCREEN_WIDTH,
  overflow: 'hidden',
},
sliderContainer: {
  paddingHorizontal: 16,
  marginTop: 12,
},
slider: {
  width: '100%',
  height: 40,
},
radiusValue: {
  fontSize: 16,
  fontWeight: '500',
  color: '#1E88E5',
},
scrollView: {
  flex: 1,
},
scrollContent: {
  paddingBottom: 24,
},
workModeSection: {
  marginTop: 24,
},
toggleButton: {
  width: TOGGLE_WIDTH,
  height: TOGGLE_HEIGHT,
  borderRadius: TOGGLE_HEIGHT / 2,
  backgroundColor: '#90CAF9',
  marginHorizontal: 16,
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
},
toggleKnob: {
  position: 'absolute',
  top: KNOB_MARGIN,
  left: 0,
  width: KNOB_WIDTH,
  height: KNOB_HEIGHT,
  borderRadius: KNOB_HEIGHT / 2,
  backgroundColor: '#1E88E5',
},
toggleLabel: {
  color: 'white',
  fontSize: 16,
  fontWeight: '700',
},
footer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderTopWidth: 1,
  borderTopColor: '#eee',
},
footerButton: {
  flex: 1,
  paddingVertical: 10,
  borderRadius: 20,
  alignItems: 'center',
},
resetButton: {
  backgroundColor: '#FDE0E0',
},
resetButtonText: {
  color: '#F44336',
  fontSize: 14,
  fontWeight: '700',
},
applyButton: {
  backgroundColor: '#DFF5E1',
},
applyButtonText: {
  color: '#4CAF50',
  fontSize: 14,
  fontWeight: '700',
},
toastOverlay: {
  flex: 1,
  alignItems: 'center',
  paddingTop: 60,
},
toast: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  backgroundColor: '#DFF5E1',
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
toastText: {
  color: '#2E7D32',
  fontSize: 14,
  fontWeight: '700',
}
})