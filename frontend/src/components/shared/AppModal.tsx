import CloseIcon from '@mui/icons-material/Close';
import { Box, Fade, IconButton, Modal, Typography } from '@mui/material';

export type AppModalProps = {
    isOpen: boolean;
    modalTitle: string;
    onClose: (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void;
    children?: JSX.Element | JSX.Element[];
};

export default function AppModal(props: AppModalProps) {
    return (
        <Modal open={props.isOpen} onClose={props.onClose}>
            <Fade in={props.isOpen} unmountOnExit>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        border: '1px solid #000',
                        boxShadow: 24,
                        borderRadius: '15px',
                        p: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography
                            variant='h6'
                            component='h2'
                            sx={{ fontWeight: 'bold' }}
                        >
                            {props.modalTitle}
                        </Typography>
                        <IconButton
                            onClick={() => props.onClose({}, 'backdropClick')}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    {props.children}
                </Box>
            </Fade>
        </Modal>
    );
}
