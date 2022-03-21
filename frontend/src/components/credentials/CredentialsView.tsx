import { Visibility, VisibilityOff } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, IconButton, Input, InputAdornment, Tooltip } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { RefObject, useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Account } from '../../store/slices/AccountSlice';

type Credentials = {
    id: number;
    name: string;
    user: string;
    password: string;
};

const testCredentials: Credentials[] = [
    {
        id: 0,
        name: 'Apple.com',
        user: 'john.doe@test.com',
        password: 'password123',
    },
    {
        id: 1,
        name: 'Amazon.com',
        user: 'TheRaggedGamer@gmail.com',
        password: '65u563j5jm5j',
    },
    {
        id: 2,
        name: 'Twitter.com',
        user: 'maiya.kling@gmail.com',
        password: '6j53k6536yhgf',
    },
    {
        id: 3,
        name: 'Facebook.com',
        user: 'unienow@gmail.com',
        password: 'gj43589hu249hj9',
    },
    {
        id: 4,
        name: 'Instagram.com',
        user: 'heichmann@yahoo.com',
        password: '543hy456jhh56j56j3',
    },
    {
        id: 5,
        name: 'Reddit.com',
        user: 'gerardo.mosciski@brakus.com',
        password: '534y54n656',
    },
    {
        id: 6,
        name: 'yahoo.ca',
        user: 'jett.ryan@bradtke.net',
        password: 'fj43890fj394893g',
    },
    {
        id: 7,
        name: 'msn.com',
        user: 'schamplin@bergstrom.net',
        password: 'fj34298j9238',
    },
    {
        id: 8,
        name: 'yelp.com',
        user: 'delia21@kulas.com',
        password: 'gfj4389gj3948g',
    },
    {
        id: 9,
        name: 'youtube.com',
        user: 'hansen.kenna@shanahan.com',
        password: 'g34545hj5jkvhkghku',
    },
    {
        id: 10,
        name: 'Google.com',
        user: 'flueilwitz@paucek.biz',
        password: 'fj48903gj3489g398hg3',
    },
    {
        id: 11,
        name: 'rbc.ca',
        user: 'cayla.west@bauch.com',
        password: 'kg4839ghgh4537',
    },
    {
        id: 12,
        name: 'Apple.com',
        user: 'uriel65@sauer.com',
        password: 'rj34829y34gf83hg',
    },
    {
        id: 13,
        name: 'gmail.com',
        user: 'lauryn67@hettinger.com',
        password: 'password123',
    },
    {
        id: 14,
        name: 'Linkedin.com',
        user: 'vfeeney@yahoo.ch',
        password: 'hf7348ghkjshdfgkjdsnbvkj',
    },
    {
        id: 15,
        name: 'piazza.com',
        user: 'misael48@hotmail.com',
        password: 'gj4389gh398gh3',
    },
    {
        id: 16,
        name: 'utoronto.ca',
        user: 'qoconner@ryan.net',
        password: 'password123',
    },
    {
        id: 17,
        name: 'ryerson.ca',
        user: 'dsatterfield@bernier.biz',
        password: 'jf4389gh39gh398ghh',
    },
    {
        id: 18,
        name: 'uwaterloo.ca',
        user: 'sreichel@gmail.com',
        password: 'f48934g398g93h',
    },
    {
        id: 19,
        name: 'ebay.ca',
        user: 'orland.monahan@yahoo.com',
        password: 'fhj3489gh34g897hg458gkljfg',
    },
    {
        id: 20,
        name: 'Apple.com',
        user: 'john.doe@test.com',
        password: 'password123',
    },
    {
        id: 21,
        name: 'snapchat.com',
        user: 'nigel.orn@harber.info',
        password: 'gjn89374gh3489hgdfhgl',
    },
    {
        id: 22,
        name: 'etsy.com',
        user: 'delbert.skiles@yahoo.com',
        password: 'jf87394gh3jkfhjkghkfhkgl',
    },
];

type CredentialsViewState = {
    credentials: Credentials[];
    numRows: number;
};

function CredentialName(props: { name: string }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
                sx={{ bgcolor: 'none' }}
                variant='rounded'
                src={`https://logo.clearbit.com/${props.name}`}
                alt={props.name.toUpperCase()}
            ></Avatar>
            <Box sx={{ ml: 1.5 }}>{props.name.toLowerCase()}</Box>
        </Box>
    );
}

function CredentialPassword(props: { password: string }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Input
            fullWidth
            type={showPassword ? 'text' : 'password'}
            value={showPassword ? props.password : 'password'}
            sx={{
                borderBottom: 'none',
                '::after, ::before': {
                    borderBottom: 'none!important', // override MUI styling
                },
            }}
            endAdornment={
                <InputAdornment position='end'>
                    <Tooltip
                        title={`${showPassword ? 'Hide' : 'Show'} Password`}
                    >
                        <IconButton
                            aria-label='toggle password visibility'
                            onClick={() => setShowPassword(!showPassword)}
                            edge='end'
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </Tooltip>
                </InputAdornment>
            }
            readOnly={true}
        />
    );
}

const columns: GridColDef[] = [
    {
        field: 'name',
        headerName: 'Name',
        width: 300,
        sortable: true,
        hideable: false,
        renderCell: (params) => {
            return <CredentialName name={params.value} />;
        },
    },
    {
        field: 'user',
        flex: 1.5,
        headerName: 'User',
        hideable: false,
        width: 200,
    },
    {
        field: 'password',
        headerName: 'Password',
        width: 200,
        sortable: false,
        filterable: false,
        hideable: false,
        flex: 3,
        renderCell: (params) => {
            return <CredentialPassword password={params.value} />;
        },
    },
    {
        field: 'actions',
        headerName: 'Actions',
        width: 100,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
            return (
                <Box>
                    <Tooltip title='Edit Credential'>
                        <IconButton>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title='Delete Credential'>
                        <IconButton>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            );
        },
    },
];

export default function CredentialsView() {
    const hexagonAccount = useOutletContext() as Account;
    const ref = useRef(null) as RefObject<HTMLDivElement>;

    const [state, setState] = useState({
        credentials: testCredentials, // TODO: Update this when reeady
        numRows: 0,
    } as CredentialsViewState);

    const update = (update: Partial<CredentialsViewState>) => {
        setState((state) => {
            return { ...state, ...update };
        });
    };

    useEffect(() => {
        const onResize = () => {
            update({
                numRows: Math.floor((ref.current!.clientHeight - 110) / 52),
            });
        };
        onResize();
        window.addEventListener('resize', onResize);
    }, []);

    return (
        <Box ref={ref} sx={{ height: 'calc(100% - 64px)' }}>
            <DataGrid
                rows={state.credentials}
                columns={columns}
                pageSize={state.numRows}
                rowsPerPageOptions={[state.numRows]}
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
