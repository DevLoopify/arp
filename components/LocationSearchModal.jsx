import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { useSearchLocation } from '@/context/SearchLocationContext';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, PanResponder, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const SEARCH_DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 3;

export default function LocationSearchModal({ visible, onClose }) {
    const { searchLocation, history, setSearchLocation, clearSearchLocation } = useSearchLocation();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const latestQueryRef = useRef('');

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
            onPanResponderRelease: (_, g) => {
                const wasSwipedDownFarEnough = g.dy > 80;
                if (wasSwipedDownFarEnough) {
                    onClose();
                }
            },
        })
    ).current;

    useEffect(() => {
        if (!visible) {
            setQuery('');
            setSuggestions([]);
        }
    }, [visible]);

    useEffect(() => {
        const trimmed = query.trim();
        latestQueryRef.current = trimmed;

        if (trimmed.length < MIN_QUERY_LENGTH) {
            setSuggestions([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const timeout = setTimeout(async () => {
            const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(trimmed)}`;

            try {
                const res = await fetch(url, { headers: { Accept: 'application/json' } });
                const results = await res.json();

                const isStillLatestQuery = latestQueryRef.current === trimmed;
                if (isStillLatestQuery) {
                    setSuggestions(results);
                }
            } catch {
                const isStillLatestQuery = latestQueryRef.current === trimmed;
                if (isStillLatestQuery) {
                    setSuggestions([]);
                }
            } finally {
                const isStillLatestQuery = latestQueryRef.current === trimmed;
                if (isStillLatestQuery) {
                    setLoading(false);
                }
            }
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timeout);
    }, [query]);

    const selectLocation = (location) => {
        setSearchLocation(location);
        onClose();
    };

    const handleSelectSuggestion = (item) => {
        selectLocation({
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            label: item.display_name,
        });
    };

    const handleUseCurrentLocation = () => {
        clearSearchLocation();
        onClose();
    };

    const showSuggestions = query.trim().length >= MIN_QUERY_LENGTH;

    function renderResultsSection() {
        if (showSuggestions) {
            return (
                <View style={styles.resultsSection}>
                    <Text style={styles.sectionLabel}>Suggestions</Text>
                    {suggestions.length > 0 ? (
                        suggestions.map((item) => (
                            <Pressable
                                key={item.place_id}
                                style={styles.resultRow}
                                onPress={() => handleSelectSuggestion(item)}
                            >
                                <Ionicons name="location-outline" size={18} color={Colors.textMuted} />
                                <Text style={styles.resultText} numberOfLines={2}>
                                    {item.display_name}
                                </Text>
                            </Pressable>
                        ))
                    ) : !loading ? (
                        <Text style={styles.emptyText}>No matches found.</Text>
                    ) : null}
                </View>
            );
        }

        const hasHistory = history.length > 0;
        if (!hasHistory) {
            return null;
        }

        return (
            <View style={styles.resultsSection}>
                <Text style={styles.sectionLabel}>Recent searches</Text>
                {history.map((item) => (
                    <Pressable
                        key={`${item.label}-${item.latitude}-${item.longitude}`}
                        style={styles.resultRow}
                        onPress={() => selectLocation(item)}
                    >
                        <Ionicons name="time-outline" size={18} color={Colors.textMuted} />
                        <Text style={styles.resultText} numberOfLines={2}>
                            {item.label}
                        </Text>
                    </Pressable>
                ))}
            </View>
        );
    }

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <View style={styles.handleArea} {...panResponder.panHandlers}>
                        <View style={styles.handle} />
                        <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
                            <Ionicons name="arrow-back" size={24} />
                        </Pressable>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.title}>Search a location</Text>
                        <View style={styles.inputRow}>
                            <Ionicons name="search" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Frankfurt Hauptbahnhof"
                                value={query}
                                onChangeText={setQuery}
                                returnKeyType="search"
                                autoFocus
                            />
                            {loading && <ActivityIndicator style={styles.inputSpinner} color={Colors.primary} />}
                        </View>

                        <Pressable onPress={handleUseCurrentLocation} style={styles.currentLocationButton}>
                            <Ionicons name="locate" size={16} color={Colors.primary} />
                            <Text style={styles.currentLocationText}>
                                {searchLocation ? 'Reset to current location' : 'Using current location'}
                            </Text>
                        </Pressable>

                        {renderResultsSection()}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    sheet: {
        height: '93%',
        backgroundColor: Colors.backgroundWhite,
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
    content: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 12,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        paddingHorizontal: 10,
    },
    inputIcon: {
        marginRight: 6,
    },
    input: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    inputSpinner: {
        marginLeft: 6,
    },
    currentLocationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
        alignSelf: 'flex-start',
    },
    currentLocationText: {
        ...Typography.link,
        color: Colors.primary,
    },
    resultsSection: {
        marginTop: 20,
    },
    sectionLabel: {
        ...Typography.caption,
        fontWeight: '700',
        color: Colors.textMuted,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    resultRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    resultText: {
        ...Typography.body,
        color: Colors.textPrimary,
        flex: 1,
    },
    emptyText: {
        ...Typography.caption,
        color: Colors.textMuted,
        paddingVertical: 8,
    },
});
