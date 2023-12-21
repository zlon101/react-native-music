import DownloadDialog from './downloadDialog';
import EditSheetDetailDialog from './editSheetDetail';
import LoadingDialog from './loadingDialog';
import RadioDialog from './radioDialog';
import SimpleDialog from './simpleDialog';
import SubscribePluginDialog from './subscribePluginDialog';
import AddGitlabMusicDialog from './addGitlabMusic';

const dialogs = {
  SimpleDialog,
  RadioDialog,
  DownloadDialog,
  SubscribePluginDialog,
  LoadingDialog,
  EditSheetDetailDialog,
  AddGitlabMusicDialog,
};

export default dialogs;

export type IDialogType = typeof dialogs;
export type IDialogKey = keyof IDialogType;
