import AppModal from '../shared/AppModal';
import { useComponentState } from '../../utils/hooks';
import { Display, setDisplay } from '../../store/slices/DisplaySlice';
import { sendToast } from '../../store/slices/ToastSlice';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    Input,
    InputAdornment,
    Link,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    clearEvent,
    createEvent,
    DashboardEvent,
    DashboardEventType,
} from '../../store/slices/DashboardSlice';
import PasswordField from '../shared/PasswordField';
import AccountService from '../../services/AccountService';
import './settings.css';
import { NULL } from 'sass';

export type SettingsProps = {
    isOpen: boolean;
    onClose: (modified?: boolean) => void;
    accountService: AccountService;
};

export enum SettingsView {
    UPDATE,
    IMPORT,
    ABOUT,
}

type SettingsState = {
    isURLValid: boolean;
    isUserValid: boolean;
    isSecretValid: boolean;
    isOldPassValid: boolean;
    oldPassword: string;
    oldPasswordError: string;
    isNewPassValid: boolean;
    newPassword: string;
    newPasswordError: string;
    currentTab: SettingsView;
    urlError: string;
    userError: string;
    secretError: string;
    url: string;
    user: string;
    secret: string;
    isLoading: boolean;
    importFile: File;
};

const initState: SettingsState = {
    isURLValid: true,
    isUserValid: true,
    isSecretValid: true,
    isOldPassValid: true,
    oldPassword: '',
    oldPasswordError: '',
    isNewPassValid: true,
    newPassword: '',
    newPasswordError: '',
    urlError: '',
    userError: '',
    secretError: '',
    url: '',
    user: '',
    secret: '',
    isLoading: false,
    currentTab: SettingsView.UPDATE,
    importFile: {} as File,
};

type SettingsContext = {
    state: SettingsState;
    update: (update: Partial<SettingsState>) => void;
    dispatch: any;
    props: SettingsProps;
};

const onViewChange = function (
    this: SettingsContext,
    _: any,
    newView: SettingsView
) {
    if (this.state.isLoading) return;
    this.update({
        currentTab: newView,
    });
};

const onOldPasswordChange = (
    update: (update: Partial<SettingsState>) => void,
    event: React.ChangeEvent<HTMLInputElement>
) => {
    const value = event.target.value;
    update({
        oldPassword: value,
        isOldPassValid: value.length > 0,
        oldPasswordError: '',
    });
};

const onNewPasswordChange = (
    update: (update: Partial<SettingsState>) => void,
    event: React.ChangeEvent<HTMLInputElement>
) => {
    const value = event.target.value;
    update({
        newPassword: value,
        isNewPassValid: value.length > 0,
        newPasswordError: '',
    });
};

const onFileUpload = (
    update: (update: Partial<SettingsState>) => void,
    event: React.ChangeEvent<HTMLInputElement>
) => {
    if(event.target.files){
        const file = event.target.files[0];
        update({
            importFile: file,
        })
    }
   
}

const onClose = (
    update: (update: Partial<SettingsState>) => void,
    close: (modified: boolean) => void,
    modified: boolean
) => {
    update(initState);
    close(modified);
};

const validateForm = (
    state: SettingsState,
    update: (update: Partial<SettingsState>) => void
) => {
    let error = false;
    if (!state.isOldPassValid|| !state.oldPassword) {
        update({ 
            oldPasswordError: 'Please enter your current password', 
            isOldPassValid: false,
        });
        error = true;
    }
    if (!state.isNewPassValid || !state.newPassword) {
        update({
            newPasswordError: 'Please enter a password',
            isNewPassValid: false,
        });
        error = true;
    }
    return error;
};

const onUpdateSubmit = async (
    state: SettingsState,
    update: (update: Partial<SettingsState>) => void,
    props: SettingsProps,
    dispatch: any
) => {
    if (validateForm(state, update)) return;
    update({ isLoading: true });
    try {
        await props.accountService.updatePassword(
            state.oldPassword,
            state.newPassword
        );
        dispatch(
            sendToast({
                message: 'Successfully updated your password.',
                severity: 'success',
            })
        );
    } catch (error: any) {
        update({ isLoading: false });

        //need some error if current password is incorrect

        // if (error.status === 409) {
        //     return update({
        //         isExists: true,
        //         id: error.id,
        //         key: error.key,
        //     });
        // }

        return dispatch(
            sendToast({
                message:
                    'Something went wrong and we were unable to update your password. Try again later.',
                severity: 'error',
            })
        );
    }
    onClose(update, props.onClose, true);
};

const readCSVFile = (filename: string) => {

}

const onImportSubmit = async (
    state: SettingsState,
    update: (update: Partial<SettingsState>) => void,
    props: SettingsProps,
    dispatch: any
) => {
    update({ isLoading: true });
    try {
        let reader = new FileReader();
        reader.readAsText(state.importFile, "UTF-8");

        dispatch(
            sendToast({
                message: 'Successfully imported your passwords.',
                severity: 'success',
            })
        );
    } catch (error: any) {
        update({ isLoading: false });

        return dispatch(
            sendToast({
                message:
                    'No file uploaded. Please try again.',
                severity: 'error',
            })
        );
    }
    onClose(update, props.onClose, true);
};

export default function Settings(props: SettingsProps) {
    const dispatch = useAppDispatch();
    const { state, update } = useComponentState(initState);
    const context = { state, update, dispatch, props };

    return (
        <AppModal
            isOpen={props.isOpen}
            onClose={onClose.bind(null, update, props.onClose, false)}
            modalTitle={'User Settings'}
        >
            <Box sx={{ width: 400 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={state.currentTab}
                        onChange={onViewChange.bind(context)}
                    >
                        <Tab
                            label='Update'
                            value={SettingsView.UPDATE}
                        />
                        <Tab
                            label='Import'
                            value={SettingsView.IMPORT}
                        />
                        <Tab
                            label='About'
                            value={SettingsView.ABOUT}
                        />
                    </Tabs>
                </Box>
                {state.currentTab === SettingsView.UPDATE && (
                    <div>
                        <Box my={1}>
                            <PasswordField
                                isError={!state.isOldPassValid}
                                password={state.oldPassword}
                                onPasswordChange={onOldPasswordChange.bind(null, update)}
                                errorMessage={state.oldPasswordError}
                                label="Current Password"
                            />
                        </Box>

                        <Box>
                            <PasswordField
                                isError={!state.isNewPassValid}
                                password={state.newPassword}
                                onPasswordChange={onNewPasswordChange.bind(null, update)}
                                errorMessage={state.newPasswordError}
                                label="New Password"
                            />
                        </Box>
                        
                    </div>
                    
                )}
                {state.currentTab === SettingsView.IMPORT && (
                    <Box mt={2}>
                        <div id="import-view">
                            <Typography variant='body1' sx={{fontWeight: 'bold'}}>Steps to Import</Typography>
                            <ol>
                                <li>Export your passwords from another password manager to a CSV file.</li>
                                <li>Format your CSV file to follow the 
                                    <Link href='../../../Import_Passwords.csv' underline="hover" color="secondary" ml={"4px"} download>template</Link>.
                                </li>
                                <li>Upload your file below.</li>
                            </ol>

                            <Box mx={2} mt={2}>
                                <input 
                                    type="file"
                                    id="import-passwords" 
                                    name="import-passwords"
                                    accept=".csv"
                                    onChange={onFileUpload.bind(null, update)}
                                >
                                </input>
                            </Box>
                        </div>
                            
                    </Box>
                )}
                {state.currentTab === SettingsView.ABOUT && (
                    <Box>
                        <Box my={2}>
                            <Typography variant='body1' sx={{fontWeight: 'bold'}}>About Hexagon</Typography>
                            <div>
                                abjdksfgkj;fdklgkfdkgkfdgjksfsd
                            </div>
                        </Box>
                        
                        <Box>
                            <Typography variant='body1' sx={{fontWeight: 'bold'}}>Credits</Typography>
                            <div>
                                iorkesfkdskfkdfjkdsjfjkljk
                            </div>
                        </Box>
                    </Box>
                )}
                <Box sx={{ position: 'relative',  mt: 2, float: 'right' }}>
                    <Button
                        variant='contained'
                        disabled={state.isLoading}
                        onClick={() => 
                            {
                                if(state.currentTab === SettingsView.UPDATE)
                                    onUpdateSubmit(state, update, props, dispatch);
                                else if(state.currentTab === SettingsView.IMPORT)
                                    onImportSubmit(state, update, props, dispatch);
                                else
                                    onClose(update, props.onClose, true);
                            }
                            
                        }
                    >
                        Done
                    </Button>
                    {state.isLoading && (
                        <CircularProgress
                            size={24}
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                marginTop: '-12px',
                                marginLeft: '-12px',
                            }}
                        />
                    )}
                </Box>
            </Box>
        </AppModal>
    );
}