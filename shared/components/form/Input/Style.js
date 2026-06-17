import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  input: {
    height: Math.max(48, screenHeight * 0.06),
    borderColor: '#F1F1F1',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Math.max(16, screenWidth * 0.04),
    fontFamily: 'Roboto-Light',
    backgroundColor: '#F1F1F1',
    fontSize: Math.max(14, screenWidth * 0.035),
    color: '#131313',
  },
  inputFocused: {
    borderColor: '#0A8CD6',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
  },
  inputError: {
    borderColor: '#F44336',
    backgroundColor: '#FFF5F5',
  },
  label: {
    fontSize: Math.max(14, screenWidth * 0.035),
    color: '#545454',
    marginBottom: Math.max(8, screenHeight * 0.01),
    fontFamily: 'Roboto-Medium',
  },
  errorText: {
    fontSize: Math.max(12, screenWidth * 0.03),
    color: '#F44336',
    marginTop: Math.max(4, screenHeight * 0.005),
    fontFamily: 'Roboto-Regular',
  },
});

export default styles;
