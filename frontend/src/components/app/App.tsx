import React from 'react';
import './App.scss';
import AuthForm from '../auth-form/AuthForm';
import colors from '../../shared/colors.module.scss';
import { createTheme, ThemeProvider } from '@mui/material/styles';

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

class App extends React.Component {
    render() {
        return (
            <ThemeProvider theme={muiTheme}>
                <div id='app' className='background'>
                    <AuthForm></AuthForm>
                </div>
            </ThemeProvider>
        );
    }
}

export default App;
