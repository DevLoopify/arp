import ProfilePicture from '@/components/ProfilePicture';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <ProfilePicture 
        uri="https://static.vecteezy.com/ti/fotos-kostenlos/p2/55121385-capybara-steht-bewachen-uber-es-ist-jung-im-ein-heiter-naturlich-lebensraum-wahrend-tageslicht-std-im-das-wild-prasentieren-das-bindung-zwischen-mutter-und-baby-foto.jpeg">
      </ProfilePicture>
      <Text style={styles.copy}>Your account details will live here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSubtle,
    padding: 24,
  },
  title: {
    ...Typography.screenTitle,
    color: Colors.textPrimary,
  },
  copy: {
    ...Typography.body,
    marginTop: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
