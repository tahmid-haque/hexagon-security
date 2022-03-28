import { Box, Grid, LinearProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import {
    clearEvent,
    DashboardEventType,
} from '../../store/slices/DashboardSlice';
import { useAppDispatch, useAppSelector } from '../../store/store';
import MFAItem from './mfa-item/MFAItem';

type MFAState = {
    content: MFA[];
    isLoading: boolean;
};

export type MFA = {
    id: string;
    name: string;
    user: string;
    seed: string;
    key: ArrayBuffer;
    shares: string[];
};

const testCredentials: MFA[] = [
    {
        id: '0',
        name: 'Apple.com',
        user: 'john.doe@test.com',
        seed: 'password123',
        key: new ArrayBuffer(0),
        shares: [],
    },
    {
        id: '1',
        name: 'Amazon.com',
        user: 'TheRaggedGamer@gmail.com',
        seed: '65u563j5jm5j',
        key: new ArrayBuffer(0),
        shares: [],
    },
    {
        id: '2',
        name: 'Twitter.com',
        user: 'maiya.kling@gmail.com',
        seed: '6j53k6536yhgf',
        key: new ArrayBuffer(0),
        shares: [],
    },
    {
        id: '3',
        name: 'Facebook.com',
        user: 'unienow@gmail.com',
        seed: 'gj43589hu249hj9',
        key: new ArrayBuffer(0),
        shares: [],
    },
    {
        id: '4',
        name: 'Instagram.com',
        user: 'heichmann@yahoo.com',
        seed: '543hy456jhh56j56j3',
        key: new ArrayBuffer(0),
        shares: [],
    },
    {
        id: '5',
        name: 'Reddit.com',
        user: 'gerardo.mosciski@brakus.com',
        seed: '534y54n656',
        key: new ArrayBuffer(0),
        shares: [],
    },
    {
        id: '6',
        name: 'yahoo.ca',
        user: 'jett.ryan@bradtke.net',
        seed: 'fj43890fj394893g',
        key: new ArrayBuffer(0),
        shares: [],
    },
    {
        id: '7',
        name: 'msn.com',
        user: 'schamplin@bergstrom.net',
        seed: 'fj34298j9238',
        key: new ArrayBuffer(0),
        shares: [],
    },
    {
        id: '8',
        name: 'yelp.com',
        user: 'delia21@kulas.com',
        seed: 'gfj4389gj3948g',
        key: new ArrayBuffer(0),
        shares: [],
    },
    {
        id: '9',
        name: 'youtube.com',
        user: 'hansen.kenna@shanahan.com',
        seed: 'g34545hj5jkvhkghku',
        key: new ArrayBuffer(0),
        shares: [],
    },
    {
        id: '10',
        name: 'Google.com',
        user: 'flueilwitz@paucek.biz',
        seed: 'fj48903gj3489g398hg3',
        key: new ArrayBuffer(0),
        shares: [],
    },
    {
        id: '11',
        name: 'rbc.ca',
        user: 'cayla.west@bauch.com',
        seed: 'kg4839ghgh4537',
        key: new ArrayBuffer(0),
        shares: [],
    },
    {
        id: '12',
        name: 'Apple.com',
        user: 'uriel65@sauer.com',
        seed: 'rj34829y34gf83hg',
        key: new ArrayBuffer(0),
        shares: [],
    },
    {
        id: '13',
        name: 'gmail.com',
        user: 'lauryn67@hettinger.com',
        seed: 'password123',
        key: new ArrayBuffer(0),
        shares: [],
    },
    {
        id: '14',
        name: 'Linkedin.com',
        user: 'vfeeney@yahoo.ch',
        seed: 'hf7348ghkjshdfgkjdsnbvkj',
        key: new ArrayBuffer(0),
        shares: [],
    },
    {
        id: '15',
        name: 'piazza.com',
        user: 'misael48@hotmail.com',
        seed: 'gj4389gh398gh3',
        key: new ArrayBuffer(0),
        shares: [],
    },
    {
        id: '16',
        name: 'utoronto.ca',
        user: 'qoconner@ryan.net',
        seed: 'password123',
        key: new ArrayBuffer(0),
        shares: [],
    },
    {
        id: '17',
        name: 'ryerson.ca',
        user: 'dsatterfield@bernier.biz',
        seed: 'jf4389gh39gh398ghh',
        key: new ArrayBuffer(0),
        shares: [],
    },
    {
        id: '18',
        name: 'uwaterloo.ca',
        user: 'sreichel@gmail.com',
        seed: 'f48934g398g93h',
        key: new ArrayBuffer(0),
        shares: [],
    },
    {
        id: '19',
        name: 'ebay.ca',
        user: 'orland.monahan@yahoo.com',
        seed: 'fhj3489gh34g897hg458gkljfg',
        key: new ArrayBuffer(0),
        shares: [],
    },
    {
        id: '20',
        name: 'Apple.com',
        user: 'john.doe@test.com',
        seed: 'password123',
        key: new ArrayBuffer(0),
        shares: [],
    },
    {
        id: '21',
        name: 'snapchat.com',
        user: 'nigel.orn@harber.info',
        seed: 'gjn89374gh3489hgdfhgl',
        key: new ArrayBuffer(0),
        shares: [],
    },
    {
        id: '22',
        name: 'etsy.com',
        user: 'delbert.skiles@yahoo.com',
        seed: 'jf87394gh3jkfhjkghkfhkgl',
        key: new ArrayBuffer(0),
        shares: [],
    },
];

export default function MFAView(props: any) {
    const [state, setState] = useState({
        isLoading: false,
        content: testCredentials,
    } as MFAState);
    const dispatch = useAppDispatch();
    const event = useAppSelector((state) => state.dashboard);

    const update = (update: Partial<MFAState>) => {
        setState((state) => {
            return { ...state, ...update };
        });
    };

    useEffect(() => {
        switch (event.type) {
            case DashboardEventType.CREATE_CLICK:
                dispatch(clearEvent());
                break;

            case DashboardEventType.DELETE_CLICK:
                dispatch(clearEvent());
                break;

            case DashboardEventType.EDIT_CLICK:
                dispatch(clearEvent());
                break;

            default:
                break;
        }
    }, [event]);

    console.log(state.content);

    return (
        <Box sx={{ m: 1 }}>
            {state.isLoading && <LinearProgress />}
            <Grid container spacing={2}>
                {state.content.map((mfa) => {
                    return (
                        <Grid item xs={12} md={6} lg={4} xl={3} key={mfa.id}>
                            <MFAItem mfa={mfa} />
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}
