import AppModal from '../shared/AppModal';
import { useComponentState } from '../../utils/hooks';
import { Display, setDisplay } from '../../store/slices/DisplaySlice';
import { sendToast } from '../../store/slices/ToastSlice';

const readCSVFile = (filename: string) => {

}

export type SettingsProps = {
    isOpen: boolean;
    onClose: (modified?: boolean) => void;
};

type SettingsState = {
    isURLValid: boolean;
    isUserValid: boolean;
    isSecretValid: boolean;
    urlError: string;
    userError: string;
    secretError: string;
    url: string;
    user: string;
    secret: string;
    isLoading: boolean;
};

const initState: SettingsState = {
    isURLValid: true,
    isUserValid: true,
    isSecretValid: true,
    urlError: '',
    userError: '',
    secretError: '',
    url: '',
    user: '',
    secret: '',
    isLoading: false,
};

const onClose = (
    update: (update: Partial<SettingsState>) => void,
    close: (modified: boolean) => void,
    modified: boolean
) => {
    update(initState);
    close(modified);
};

export default function Settings(props: SettingsProps) {
    const { state, update } = useComponentState(initState);
    return (
        <AppModal
            isOpen={props.isOpen}
            modalTitle={'User Settings'}
            onClose={onClose.bind(null, update, props.onClose, false)}
        >
            <div>hello</div>
        </AppModal>
    );
}