import { Box, Button, CircularProgress, Typography } from '@mui/material';
import AppModal from './AppModal';

export type LoadingDialogProps = {
    isOpen: boolean;
    isLoading: boolean;
    onClose: (event?: {}, reason?: "escapeKeyDown" | "backdropClick") => void;
    onAccept: () => void;
    title: string;
    body: string;
    primaryActionText?: string;
    secondaryActionText?: string;
    onReject?: () => void;
};

export default function LoadingDialog(props: LoadingDialogProps) {
    return (
        <AppModal
            isOpen={props.isOpen}
            modalTitle={props.title}
            onClose={props.onClose}
        >
            <Typography sx={{ maxWidth: 300 }}>{props.body}</Typography>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    mt: 2,
                }}
            >
                <Box
                    style={{
                        position: 'relative',
                    }}
                >
                    <Button
                        variant='contained'
                        onClick={props.onClose}
                        disabled={props.isLoading}
                    >
                        {props.primaryActionText ?? 'Close'}
                    </Button>
                    {props.isLoading && (
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
