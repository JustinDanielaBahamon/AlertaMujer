import { View, StyleSheet } from 'react-native';

export function TutorialDots({ activeIndex }: { activeIndex: number }) {
  return (
    <View style={styles.container}>
      {[0, 1, 2, 3, 4].map((index) => (
        <View 
          key={index}
          style={[
            styles.dot,
            activeIndex === index ? styles.activeDot : styles.inactiveDot
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', // 🔥 clave
    bottom: 100,          // 🔥 ajusta según tus botones
    left: 0,
    right: 0,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#6A4DA8',
    paddingVertical: 15,
  },

  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },

  activeDot: {
    backgroundColor: '#FFF',
  },

  inactiveDot: {
    backgroundColor: 'transparent',
  }
});