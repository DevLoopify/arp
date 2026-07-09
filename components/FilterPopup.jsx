import InfoTooltip from "@/components/InfoTooltip"
import Colors from "@/constants/Colors"
import utilityIcons, { getUtilityIcon } from "@/constants/utilityIcons"
import { useFilters } from "@/context/FiltersContext"
import { useSearchLocation } from "@/context/SearchLocationContext"
import { useUserProfile } from "@/context/UserProfileContext"
import { Ionicons } from "@expo/vector-icons"
import Slider from "@react-native-community/slider"
import { useEffect, useRef, useState } from "react"
import { Animated, Dimensions, Modal, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import useCurrentLocation from "../hooks/useCurrentLocation"
import MapContainer from "./MapContainer"
import SelectionChip from "./SelectionChip"

const UTILITIES = Object.keys(utilityIcons)
const NOISE_LEVELS = [1, 2, 3, 4, 5]

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
    const { location: gpsLocation, permissionGranted } = useCurrentLocation()
    const { searchLocation } = useSearchLocation()
    const location = searchLocation ?? gpsLocation
    const { filters, defaultFilters, setFilters, resetFilters } = useFilters()
    const { settings: profileSettings } = useUserProfile()

    // Reflect whatever is currently applied (which defaults to the profile's
    // workplace preferences) each time the sheet is opened.
    useEffect(() => {
        if (!visible) return
        setNoiseLevel(filters.noiseLevel)
        setRadius(filters.radiusMeters ?? defaultFilters.radiusMeters ?? 500)
        setSelectedUtilities(filters.utilities)
        setWorkMode(profileSettings.workMode)
        slideAnim.setValue(profileSettings.workMode === 'group' ? 1 : 0)
    }, [visible])
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
        setNoiseLevel(defaultFilters.noiseLevel)
        setRadius(defaultFilters.radiusMeters ?? 500)
        setSelectedUtilities(defaultFilters.utilities)
        setWorkMode(profileSettings.workMode)
        slideAnim.setValue(profileSettings.workMode === 'group' ? 1 : 0)
        resetFilters()
    }

    // Work mode has no matching field on a workplace, so it's UI-only for now and isn't
    // part of what actually gets applied to the list/map.
    const handleApply = () => {
        setFilters({ noiseLevel, radiusMeters: radius, utilities: selectedUtilities })
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
                    <Ionicons name="arrow-back" size={24} />
                </Pressable>
            </View>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View>
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>Noise Level</Text>
                    <InfoTooltip
                      title="Noise Level"
                      message="Shows workplaces at or below the noise level you pick, from 1 (quietest) to 5 (loudest)."
                    />
                  </View>
                  <View style={styles.noiseRow}>
                      {NOISE_LEVELS.map((level) => (
                        <SelectionChip
                          key={level}
                          text={String(level)}
                          selected={noiseLevel === level}
                          onPress={() => setNoiseLevel(level)}
                        />
                      ))}
                  </View>
                </View>
                <View style={styles.radiusSection}>
                  <View style={styles.radiusTitleRow}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.title, styles.radiusTitleText]}>Radius</Text>
                      <InfoTooltip
                        title="Radius"
                        message="Only shows workplaces within this distance from your current or searched location."
                      />
                    </View>
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
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>Utilities</Text>
                    <InfoTooltip
                      title="Utilities"
                      message="Only shows workplaces that have all of the utilities you select here."
                    />
                  </View>
                  <View style={styles.utilitiesGrid}>
                    {UTILITIES.map((utility) => {
                      const selected = selectedUtilities.includes(utility)
                      return (
                        <SelectionChip
                          key={utility}
                          text={utility}
                          icon={<Ionicons name={getUtilityIcon(utility)} size={16} color={selected ? Colors.textWhite : Colors.primary} />}
                          selected={selected}
                          onPress={() => toggleUtility(utility)}
                        />
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
titleRow: {
  flexDirection: 'row',
  alignItems: 'center',
},
utilitiesSection: {
  marginTop: 24,
},
utilitiesGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  paddingHorizontal: 16,
},
noiseRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  paddingHorizontal: 16,
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