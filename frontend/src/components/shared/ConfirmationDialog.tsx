import { Box, Button, CircularProgress, Typography } from '@mui/material';
import AppModal from './AppModal';

export type ConfirmationDialogProps = {
    isOpen: boolean;
    isLoading: boolean;
    onClose: () => void;
    onAccept: () => void;
    title: string;
    body: string;
};

export default function ConfirmationDialog(props: ConfirmationDialogProps) {
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
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mt: 2,
                }}
            >
                <Button variant='text' onClick={props.onClose}>
                    Cancel
                </Button>
                <Box
                    style={{
                        position: 'relative',
                    }}
                >
                    <Button
                        variant='contained'
                        onClick={props.onAccept}
                        disabled={props.isLoading}
                    >
                        Continue
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
