import AppBar from '@/components/AppBar';
import FilterPopup from '@/components/FilterPopup';
import ListView from '@/components/ListView';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import IconButton from '../../components/IconButton';
import MapContainer from '../../components/MapContainer';

export default function ExploreScreen() {
  const [filterVisible, setFilterVisible] = useState(false);
  return (
    <View style={styles.container}>
          <AppBar 
            right= {<IconButton icon={<Ionicons name='options' size={24}></Ionicons>} clickHandler={() => {
              setFilterVisible(true)
            }}></IconButton>}
            center= {<Text style={Typography.screenTitle}>Explore</Text>}
            >
          </AppBar>
      <View style={styles.mapPanel}>
        <MapContainer isFullScreen={true} />
        <View style={styles.listViewOverlay}>
          <ListView></ListView>
        </View>
      </View>
      <FilterPopup visible={filterVisible} onClose={() => setFilterVisible(false)}></FilterPopup>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundBase,
  },
  eyebrow: {
    ...Typography.eyebrow,
    color: Colors.accent,
  },
  title: {
    ...Typography.sectionTitle,
    marginTop: 8,
    color: Colors.textPrimary,
  },
  copy: {
    ...Typography.body,
    marginTop: 10,
    color: Colors.textSecondary,
  },
  mapPanel: {
    flex: 1,
    width: '100%',
    minHeight: 320,
  },
  listViewOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  filterContainer: {
    position: 'absolute',
    top: 24,
    right: 24,
    zIndex: 1,
  },

});
