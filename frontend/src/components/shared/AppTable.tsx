import { Box, LinearProgress } from '@mui/material';
import { DataGrid, GridColDef, GridSortDirection } from '@mui/x-data-grid';
import { RefObject, useEffect, useRef } from 'react';
import {
    DashboardEvent,
    DashboardEventType,
} from '../../store/slices/DashboardSlice';
import { useAppSelector } from '../../store/store';
import { useComponentState } from '../../utils/hooks';

export type AppTableProps = {
    columnDef: GridColDef[];
    content: any[];
    contentCount: number;
    isLoading: boolean;
    errorText: string;
    updateContent: (
        offset: number,
        limit: number,
        sortType?: GridSortDirection
    ) => void;
    sortField?: string;
    initialSort?: GridSortDirection;
};

type AppTableState = {
    numRows: number;
    currentPage: number;
    sortType: GridSortDirection;
    isUpdateInProgress: boolean;
};

type AppTableContext = {
    state: AppTableState;
    update: (update: Partial<AppTableState>) => void;
    ref: RefObject<HTMLDivElement>;
    event: DashboardEvent;
    props: AppTableProps;
};

/**
 * Update the table's contents
 * @param this context in which to execute the function
 */
const updateContent = async function (this: AppTableContext) {
    const { props, state, update } = this;

    if (props.contentCount && state.numRows && !state.isUpdateInProgress) {
        update({ isUpdateInProgress: true });
        await props.updateContent(
            state.currentPage * state.numRows,
            state.numRows,
            state.sortType
        );
        update({ isUpdateInProgress: false });
    }
};

/**
 * Handle dashboard events dispatched by Redux
 * @param this context in which to execute the function
 */
const handleEvent = function (this: AppTableContext) {
    if (this.event.type === DashboardEventType.RERENDER_DATA)
        updateContent.call(this);
};

/**
 * Initialize the table by calculating the number of rows to display
 * @param this context in which to execute the function
 */
const init = function (this: AppTableContext) {
    const { ref, update, state } = this;
    const updateNumRows = () => {
        const numRows = Math.floor((ref.current!.clientHeight - 110) / 52);
        if (numRows !== state.numRows) {
            update({
                numRows,
            });
        }
    };
    window.addEventListener('resize', updateNumRows);
    updateNumRows();
};

/**
 * MessageOverlay component used to display messages about the table on errors / no data.
 * @param props contains the text to display
 * @returns a MessageOverlay component
 */
const MessageOverlay = (props: { text: string }) => (
    <Box
        sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
        }}
    >
        {props.text}
    </Box>
);

export default function AppTable(props: AppTableProps) {
    const ref = useRef(null) as RefObject<HTMLDivElement>;
    const event = useAppSelector((state) => state.dashboard);

    const { state, update } = useComponentState({
        numRows: 0,
        currentPage: 0,
        sortType: props.initialSort ?? 'asc',
        isUpdateInProgress: false,
    } as AppTableState);

    const context = {
        state,
        update,
        ref,
        props,
        event,
    };

    useEffect(init.bind(context), []);
    // update table content on parameter change
    useEffect(() => {
        updateContent.call(context);
    }, [state.numRows, state.sortType, state.currentPage, props.contentCount]);
    useEffect(handleEvent.bind(context), [event]);

    return (
        <Box ref={ref} sx={{ height: '100%', width: 'calc(100vw - 65px)' }}>
            <DataGrid
                disableColumnMenu
                disableSelectionOnClick
                paginationMode='server'
                loading={props.isLoading}
                {...(props.errorText.length && { error: props.errorText })}
                components={{
                    LoadingOverlay: LinearProgress,
                    NoRowsOverlay: () => (
                        <MessageOverlay text='No data found.' />
                    ),
                    NoResultsOverlay: () => (
                        <MessageOverlay text='No data found.' />
                    ),
                    ErrorOverlay: () => (
                        <MessageOverlay text={props.errorText} />
                    ),
                }}
                rowCount={props.contentCount}
                rows={props.content}
                columns={props.columnDef}
                pageSize={state.numRows}
                rowsPerPageOptions={[state.numRows]}
                onPageChange={(currentPage) => update({ currentPage })}
                {...{
                    ...(props.sortField && {
                        sortModel: [
                            { field: props.sortField, sort: state.sortType },
                        ],
                        onSortModelChange: () => {
                            update({
                                sortType:
                                    state.sortType === 'asc' ? 'desc' : 'asc',
                            });
                        },
                    }),
                }}
                sx={{
                    mx: 0,
                    // remove focus outlines
                    '&.MuiDataGrid-root .MuiDataGrid-cell, &.MuiDataGrid-root .MuiDataGrid-columnHeader':
                        {
                            outline: 'none',
                        },
                }}
            />
        </Box>
    );
}
