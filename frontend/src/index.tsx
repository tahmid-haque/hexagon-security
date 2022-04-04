import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/app/App';
import { store } from './store/store';
import { Provider } from 'react-redux';
import colors from './shared/colors.module.scss';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthForm from './components/auth-form/AuthForm';
import NotFound from './components/not-found/NotFound';
import Dashboard from './components/dashboard/Dashboard';
import CredentialsView from './components/credentials/CredentialsView';
import MFAView from './components/mfa/MFAView';
import NotesView from './components/notes/NotesView';
import ShareFinalizer from './components/shares/ShareFinalizer';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const muiTheme = createTheme({
    palette: {
        primary: {
            main: colors.primary,
            light: colors.lightPrimary,
            dark: colors.darkPrimary,
        },
        secondary: {
            main: colors.secondary,
            light: colors.lightSecondary,
            dark: colors.darkSecondary,
        },
    },
    typography: {
        fontFamily: ['Lato', 'Roboto', 'Helvetica', 'Ariel', 'sans-serif'].join(
            ','
        ),
    },
});

const client = new ApolloClient({
    uri: '/api/graphql',
    cache: new InMemoryCache(),
    defaultOptions: {
        query: { fetchPolicy: 'no-cache' },
        mutate: { fetchPolicy: 'no-cache' },
    },
});
//const testController =  new CredentialController(client, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVSUQiOiIzZmE0ZmU4OC01YTcwLTRiYzEtODFjNS0xM2NkZGIxNGY5YmUiLCJ1c2VybmFtZSI6ImhlbGxvMkBnbWFpbC5jb20iLCJpYXQiOjE2NDg0MTg5NzQsImV4cCI6MTY0ODY3ODE3NH0.HaVJuCAA-jdnJ1RuVkIcp8YMIPJAxc0t_IRn5fH3Fug");

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <ThemeProvider theme={muiTheme}>
                <ApolloProvider client={client}>
                    <BrowserRouter>
                        <Routes>
                            <Route path='/' element={<App />}>
                                <Route path='app/' element={<Dashboard />}>
                                    <Route
                                        path='credentials'
                                        element={<CredentialsView />}
                                    />
                                    <Route path='mfa' element={<MFAView />} />
                                    <Route
                                        path='notes'
                                        element={<NotesView />}
                                    />
                                    <Route
                                        path='share'
                                        element={<ShareFinalizer />}
                                    />
                                </Route>
                                <Route
                                    path='authenticate'
                                    element={<AuthForm />}
                                />
                                <Route path='*' element={<NotFound />} />
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </ApolloProvider>
            </ThemeProvider>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);
