import ToastMessage from 'react-native-toast-message';

interface IToast {
  success: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string) => void;
}
const Toast: IToast = {
  success(msg: string) {
    ToastMessage.show({
      type: 'success',
      text1: msg,
    });
  },
  warn(msg: string) {
    ToastMessage.show({
      type: 'warn',
      text1: msg,
    });
  },
  error(msg: string) {
    ToastMessage.show({
      type: 'error',
      text1: msg,
    });
  }
};

export default Toast;
