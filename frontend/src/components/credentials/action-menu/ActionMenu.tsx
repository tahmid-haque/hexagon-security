import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ShareIcon from '@mui/icons-material/Share';
import {
    Box,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
} from '@mui/material';
import { useCallback, useState } from 'react';
import {
    createEvent,
    DashboardEventType,
} from '../../../store/slices/DashboardSlice';
import { useAppDispatch } from '../../../store/store';

export type hideOptions = {
    edit?: boolean;
    share?: boolean;
    delete?: boolean;
};

export default function ActionMenu(props: {
    id: string;
    hideOptions?: hideOptions;
}) {
    // inspired from https://mui.com/material-ui/react-menu/
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const dispatch = useAppDispatch();

    const onClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const onClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const onDeleteClick = useCallback(() => {
        dispatch(
            createEvent({
                type: DashboardEventType.DELETE_CLICK,
                param: props.id,
            })
        );
        onClose();
    }, []);

    const onEditClick = useCallback(() => {
        dispatch(
            createEvent({
                type: DashboardEventType.EDIT_CLICK,
                param: props.id,
            })
        );
        onClose();
    }, []);

    return (
        <Box>
            <IconButton onClick={onClick}>
                <MoreHorizIcon />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={onClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                {!props.hideOptions?.edit && (
                    <MenuItem onClick={onEditClick}>
                        <ListItemIcon>
                            <EditIcon />
                        </ListItemIcon>
                        <ListItemText>Edit</ListItemText>
                    </MenuItem>
                )}
                {!props.hideOptions?.share && (
                    <MenuItem onClick={onClose}>
                        <ListItemIcon>
                            <ShareIcon />
                        </ListItemIcon>
                        <ListItemText>Share</ListItemText>
                    </MenuItem>
                )}
                {!props.hideOptions?.delete && (
                    <MenuItem onClick={onDeleteClick}>
                        <ListItemIcon>
                            <DeleteIcon color='error' />
                        </ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </MenuItem>
                )}
            </Menu>
        </Box>
    );
}
