import AppModal from '../shared/AppModal';
import { useComponentState } from '../../utils/hooks';
import { sendToast } from '../../store/slices/ToastSlice';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
    Box,
    Button,
    CircularProgress,
    Link,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import PasswordField from '../shared/PasswordField';
import LoadingDialog from '../shared/LoadingDialog';
import AccountService from '../../services/AccountService';
import CredentialService from '../../services/CredentialService';
import './settings.css';
import parser from 'hexagon-shared/utils/parser';
import {
    createEvent,
    DashboardEventType,
} from '../../store/slices/DashboardSlice';
import {
    ApolloClient,
    NormalizedCacheObject,
    useApolloClient,
} from '@apollo/client';

export type SettingsProps = {
    isOpen: boolean;
    onClose: (modified?: boolean) => void;
    accountService: AccountService;
    credentialService: CredentialService;
};

export enum SettingsView {
    UPDATE,
    IMPORT,
    ABOUT,
}

type SettingsState = {
    isOldPassValid: boolean;
    oldPassword: string;
    oldPasswordError: string;
    isNewPassValid: boolean;
    newPassword: string;
    newPasswordError: string;
    isImportLoadOpen: boolean;
    isImportLoading: boolean;
    currentTab: SettingsView;
    isLoading: boolean;
    importFile: File;
};

const initState: SettingsState = {
    isOldPassValid: true,
    oldPassword: '',
    oldPasswordError: '',
    isNewPassValid: true,
    newPassword: '',
    newPasswordError: '',
    isImportLoadOpen: false,
    isImportLoading: false,
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

/**
 * Change the tab to newView
 * @param this context in which to execute the function
 * @param _ UNUSED
 * @param newView the next tab to move to
 */
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

/**
 * Event handler to handle old password field changes.
 * Determine whether the old password is valid and update the page.
 * @param update function used to update the state
 * @param event a ChangeEvent
 */
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

/**
 * Event handler to handle new password field changes.
 * Determine whether the new password is valid and update the page.
 * @param update function used to update the state
 * @param event a ChangeEvent
 */
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

/**
 * Event handler to handle old import field changes.
 * @param update function used to update the state
 * @param event a ChangeEvent
 */
const onFileUpload = (
    update: (update: Partial<SettingsState>) => void,
    event: React.ChangeEvent<HTMLInputElement>
) => {
    if (event.target.files) {
        const file = event.target.files[0];
        update({
            importFile: file,
        });
    }
};

/**
 * Event handler to handle close events
 * @param state the current state of Settings
 * @param update function used to update the state
 * @param close callback to call on close
 */
const onClose = (
    state: SettingsState,
    update: (update: Partial<SettingsState>) => void,
    close: () => void
) => {
    if (state.isLoading) return;
    update(initState);
    close();
};

/**
 * Determine whether the form is valid
 * @param state the current state of the Settings
 * @param update function used to update the state
 * @returns true if the form is valid, false otherwise
 */
const validateForm = (
    state: SettingsState,
    update: (update: Partial<SettingsState>) => void
) => {
    let error = false;
    if (!state.isOldPassValid || !state.oldPassword) {
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

/**
 * Event handler for handling master password update. Updates the password on the server.
 * @param state the current state of the CredentialEditor
 * @param update function used to update the state
 * @param props the props passed to the CredentialEditor
 * @param dispatch function used to dispatch redux actions
 * @param client the GraphQL client used to communicate with the backend
 * @param token the JWT token associated to the user
 */
const onUpdateSubmit = async (
    state: SettingsState,
    update: (update: Partial<SettingsState>) => void,
    props: SettingsProps,
    dispatch: any,
    client: ApolloClient<NormalizedCacheObject>,
    token: string
) => {
    if (validateForm(state, update)) return;
    update({ isLoading: true });
    try {
        await props.accountService.updatePassword(
            state.oldPassword,
            state.newPassword,
            client,
            token
        );
        dispatch(
            sendToast({
                message: 'Successfully updated your password.',
                severity: 'success',
            })
        );
    } catch (error: any) {
        update({ isLoading: false });

        return dispatch(
            sendToast({
                message:
                    'Something went wrong and we were unable to update your password. Try again later.',
                severity: 'error',
            })
        );
    }
    onClose(state, update, props.onClose);
};

/**
 * Check whether the headers match the required format
 * @param headers the headers to verify
 * @returns true if the headers match, false otherwise
 */
const verifyHeaders = (headers: string[]): boolean => {
    if (headers.length !== 4) return false;
    if (
        headers[0].trim().toLowerCase() !== 'name' ||
        headers[1].trim().toLowerCase() !== 'url' ||
        headers[2].trim().toLowerCase() !== 'username' ||
        headers[3].trim().toLowerCase() !== 'password'
    )
        return false;

    return true;
};

/**
 * Read through the CSV content and create credentials as requested
 * @param lines the CSV content
 * @param update function used to update the state
 * @param props the props passed to Settings
 * @param dispatch function used to dispatch redux actions
 */
const readCSVFile = async (
    lines: string[],
    update: (update: Partial<SettingsState>) => void,
    props: SettingsProps,
    dispatch: any
) => {
    for (let i = 1; i < lines.length; i++) {
        try {
            let current = lines[i].split(',');
            let currentDomain = parser.extractDomain(current[1].trim());
            let currentUsername = current[2].trim();
            let currentPassword = current[3].trim();

            if (!currentDomain || !currentUsername || !currentPassword)
                throw new Error('Missing fields in credentials');

            await props.credentialService.createCredential(
                currentDomain,
                currentUsername,
                currentPassword
            );
        } catch {
            dispatch(
                sendToast({
                    message:
                        'Unable to add credentials for website on line ' +
                        i +
                        '.',
                    severity: 'error',
                })
            );
        }
    }

    dispatch(
        createEvent({
            type: DashboardEventType.RERENDER_DATA,
        })
    );

    dispatch(
        sendToast({
            message: 'Successfully imported your passwords.',
            severity: 'success',
        })
    );

    let importForm = document.querySelector(
        '#import-passwords-form'
    ) as HTMLFormElement;
    importForm.reset();
    update({
        isLoading: false,
        isImportLoading: false,
        importFile: {} as File,
    });
};

/**
 * Event handler for handling import submission. Uses the CSV file to create credentials.
 * @param state the current state of Settings
 * @param update function used to update the state
 * @param props the props passed to Settings
 * @param dispatch function used to dispatch redux actions
 */
const onImportSubmit = async (
    state: SettingsState,
    update: (update: Partial<SettingsState>) => void,
    props: SettingsProps,
    dispatch: any
) => {
    update({ isLoading: true, isImportLoadOpen: true, isImportLoading: true });
    try {
        const reader = new FileReader();
        reader.readAsText(state.importFile);

        reader.onload = function () {
            try {
                const fileContents = reader.result as string;
                if (!fileContents) return;
                let lines = fileContents.split(/\r\n|\n/);
                if (lines.length < 1) return;

                const headers = lines[0].split(',');

                if (!verifyHeaders(headers))
                    throw new Error('Error with file formatting');

                readCSVFile(lines, update, props, dispatch);
            } catch (error: any) {
                update({
                    isLoading: false,
                    isImportLoadOpen: false,
                    isImportLoading: false,
                });

                return dispatch(
                    sendToast({
                        message:
                            'Something went wrong. Please check your file contents or try again later.',
                        severity: 'error',
                    })
                );
            }
        };
    } catch (error: any) {
        update({
            isLoading: false,
            isImportLoadOpen: false,
            isImportLoading: false,
        });

        return dispatch(
            sendToast({
                message: 'No file uploaded. Please try again.',
                severity: 'error',
            })
        );
    }
};

/**
 * Settings component used to allow certain miscellaneous features for the user
 * @param props props used to configure the Settings
 * @returns a Settings component
 */
export default function Settings(props: SettingsProps) {
    const dispatch = useAppDispatch();
    const account = useAppSelector((state) => state.account);
    const client = useApolloClient() as ApolloClient<NormalizedCacheObject>;
    const { state, update } = useComponentState(initState);
    const context = { state, update, dispatch, props };

    return (
        <AppModal
            isOpen={props.isOpen}
            onClose={onClose.bind(null, state, update, props.onClose, false)}
            modalTitle={'User Settings'}
        >
            <Box sx={{ width: 400 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={state.currentTab}
                        onChange={onViewChange.bind(context)}
                    >
                        <Tab
                            label='Update Password'
                            value={SettingsView.UPDATE}
                        />
                        <Tab label='Import' value={SettingsView.IMPORT} />
                        <Tab label='About' value={SettingsView.ABOUT} />
                    </Tabs>
                </Box>
                {state.currentTab === SettingsView.UPDATE && (
                    <div>
                        <Box my={1}>
                            <PasswordField
                                isError={!state.isOldPassValid}
                                password={state.oldPassword}
                                onPasswordChange={onOldPasswordChange.bind(
                                    null,
                                    update
                                )}
                                errorMessage={state.oldPasswordError}
                                label='Current Password'
                            />
                        </Box>

                        <Box>
                            <PasswordField
                                isError={!state.isNewPassValid}
                                password={state.newPassword}
                                onPasswordChange={onNewPasswordChange.bind(
                                    null,
                                    update
                                )}
                                errorMessage={state.newPasswordError}
                                label='New Password'
                            />
                        </Box>
                    </div>
                )}
                {state.currentTab === SettingsView.IMPORT && (
                    <Box mt={2}>
                        <div id='import-view'>
                            <Typography
                                variant='body1'
                                sx={{ fontWeight: 'bold' }}
                            >
                                Steps to Import
                            </Typography>
                            <ol>
                                <li>
                                    Export your passwords from another password
                                    manager to a CSV file.
                                </li>
                                <li>
                                    Format your CSV file to follow the
                                    <Link
                                        href='../../../Import_Passwords.csv'
                                        underline='hover'
                                        color='secondary'
                                        ml={'4px'}
                                        download
                                    >
                                        template
                                    </Link>
                                    .
                                </li>
                                <li>Upload your file below.</li>
                            </ol>

                            <Box
                                mx={2}
                                mt={2}
                                component={'form'}
                                id='import-passwords-form'
                            >
                                <input
                                    type='file'
                                    id='import-passwords'
                                    name='import-passwords'
                                    accept='.csv'
                                    onChange={onFileUpload.bind(null, update)}
                                ></input>
                            </Box>
                        </div>
                    </Box>
                )}
                {state.currentTab === SettingsView.ABOUT && (
                    <Box id='about-tab-view'>
                        <Box my={2}>
                            <Typography
                                variant='body1'
                                sx={{ fontWeight: 'bold' }}
                            >
                                About Hexagon
                            </Typography>
                            <div>
                                A secure password manager for all your security
                                needs. Save all your passwords, MFA secrets, and
                                notes in one place.
                            </div>
                        </Box>

                        <Box>
                            <Typography
                                variant='body1'
                                sx={{ fontWeight: 'bold' }}
                            >
                                Credits
                            </Typography>
                            <ul style={{ margin: 0 }}>
                                <li>
                                    UI designed using{' '}
                                    <a href='https://mui.com/'>MUI</a>
                                </li>
                                <li>
                                    All site logos retrieved from{' '}
                                    <a href='https://clearbit.com/logo'>
                                        Clearbit
                                    </a>
                                </li>
                                <li>
                                    Password security checked by{' '}
                                    <a href='https://haveibeenpwned.com/Passwords'>
                                        HaveIBeenPwned
                                    </a>
                                </li>
                                <li>
                                    Full list of credits can be found{' '}
                                    <a href='https://github.com/UTSCC09/project-noaccess/blob/31e4489aaae33d07d13ee0f393e7bd835b5547a6/README.md'>
                                        here
                                    </a>
                                </li>
                            </ul>
                        </Box>
                    </Box>
                )}
                <Box sx={{ position: 'relative', mt: 2, float: 'right' }}>
                    <Button
                        variant='contained'
                        disabled={state.isLoading}
                        onClick={() => {
                            if (state.currentTab === SettingsView.UPDATE)
                                onUpdateSubmit(
                                    state,
                                    update,
                                    props,
                                    dispatch,
                                    client,
                                    account.jwt
                                );
                            else if (state.currentTab === SettingsView.IMPORT)
                                onImportSubmit(state, update, props, dispatch);
                            else onClose(state, update, props.onClose);
                        }}
                    >
                        {state.currentTab !== SettingsView.ABOUT
                            ? 'Submit'
                            : 'Done'}
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
                    <LoadingDialog
                        isOpen={state.isImportLoadOpen}
                        onClose={() => update({ isImportLoadOpen: false })}
                        onAccept={() => update({ isImportLoadOpen: false })}
                        title='Importing Passwords'
                        body='Do not close this tab while passwords are importing.'
                        isLoading={state.isImportLoading}
                    />
                </Box>
            </Box>
        </AppModal>
    );
}
