import { Box, LinearProgress } from '@mui/material';
import { DataGrid, GridColDef, GridSortDirection } from '@mui/x-data-grid';
import { RefObject, useEffect, useRef, useState } from 'react';
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
};

type AppTableContext = {
    state: AppTableState;
    update: (update: Partial<AppTableState>) => void;
    ref: RefObject<HTMLDivElement>;
    event: DashboardEvent;
    props: AppTableProps;
};

const updateContent = function (this: AppTableContext) {
    const { props, state } = this;

    if (props.contentCount && state.numRows) {
        props.updateContent(
            state.currentPage * state.numRows,
            state.numRows,
            state.sortType
        );
    }
};

const handleEvent = function (this: AppTableContext) {
    if (this.event.type === DashboardEventType.RERENDER_DATA)
        updateContent.call(this);
};

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

export default function AppTable(props: AppTableProps) {
    const ref = useRef(null) as RefObject<HTMLDivElement>;
    const event = useAppSelector((state) => state.dashboard);

    const { state, update } = useComponentState({
        numRows: 0,
        currentPage: 0,
        sortType: props.initialSort ?? 'asc',
    } as AppTableState);

    const context = {
        state,
        update,
        ref,
        props,
        event,
    };

    useEffect(init.bind(context), []);
    useEffect(updateContent.bind(context), [
        state.numRows,
        state.sortType,
        state.currentPage,
        props.contentCount,
    ]);
    useEffect(handleEvent.bind(context), [event]);

    return (
        <Box ref={ref} sx={{ height: '100%', width: 'calc(100vw - 66px)' }}>
            <DataGrid
                disableColumnMenu
                disableSelectionOnClick
                paginationMode='server'
                loading={props.isLoading}
                {...(props.errorText.length && { error: props.errorText })}
                components={{
                    LoadingOverlay: LinearProgress,
                    NoRowsOverlay: () => (
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
                            No data found.
                        </Box>
                    ),
                    ErrorOverlay: () => (
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
                            {props.errorText}
                        </Box>
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
                    // remove focus outlinees
                    '&.MuiDataGrid-root .MuiDataGrid-cell, &.MuiDataGrid-root .MuiDataGrid-columnHeader':
                        {
                            outline: 'none',
                        },
                }}
            />
        </Box>
    );
}
