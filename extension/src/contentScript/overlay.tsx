import React, { SyntheticEvent, useState } from 'react'
import ReactDOM from 'react-dom'
import { Card, Box, Button, InputLabel, MenuItem, FormControl, Select, TextField, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Header from '../sharedComponents/header/header'
import './overlay.css'

const autofillFormSubmit = (e: SyntheticEvent, autofill: (uname: string, pass: string) => void) => {
    e.preventDefault();
    let form = document.querySelector("#hexagon-autofill-login-form") as HTMLFormElement;
    if(form.reportValidity()){
        let account = document.querySelector("#hexagon-autofill-username") as HTMLSelectElement;
        console.log(account.innerHTML);
        autofill(account.innerHTML, "abc");
    }
}

const AutofillOverlay = ({autofill, closeOverlay} : {autofill: (uname: string, pass: string) => void, closeOverlay: () => void}) => {
    const [username, setUsername] = React.useState('');

    const handleChange = (event) => {
      setUsername(event.target.value);
    };

    return (
        <div className='hexagon-overlay'>
            <Header url={chrome.runtime.getURL("icon.png")} clickAction={closeOverlay} />
            <Card className='hexagon-overlay-body'>
                <div>Username/Password fields detected. Autofill fields?</div>

                <Box component={"form"} id="hexagon-autofill-login-form">
                    <div>
                        <FormControl required sx={{ mt: 2, width: 180}}>
                            <InputLabel id="demo-simple-select-helper-label">Account</InputLabel>
                            <Select
                                id="hexagon-autofill-username"
                                required
                                value={username}
                                label="account"
                                onChange={handleChange}
                                MenuProps={{
                                    style: {zIndex: 100005}
                                }}
                            >
                                <MenuItem value={"sally123"}>sally123</MenuItem>
                                <MenuItem value={"ttt@tt.tt"}>ttt@tt.tt</MenuItem>
                                <MenuItem value={"abcs321@gmail2.com"}>abcs321@gmail2.com</MenuItem>
                            </Select>
                        </FormControl>
                    </div>

                    <Button size='large' onClick={e => autofillFormSubmit(e, autofill)} sx={{margin: "5px", fontSize: "15px"}}>Autofill</Button>
                </Box>

            </Card>
        </div>
    )
}

const saveFormSubmit = (e: SyntheticEvent, closeOverlay: () => void) => {
    e.preventDefault();
    let form = document.querySelector("#hexagon-save-login-form") as HTMLFormElement;
    if(form.reportValidity()){
        let username = document.querySelector("#hexagon-save-username") as HTMLInputElement;
        let password = document.querySelector("#hexagon-save-password") as HTMLInputElement;
        console.log(username.value);
        console.log(password.value);
        closeOverlay();
    }
}

const SavePassOverlay = ({username, password, closeOverlay} : {username:string, password:string, closeOverlay: () => void}) => {
    const [showPass, setShowPass] = useState(false);

    const icon = <IconButton sx={{m:0}} onClick={() => setShowPass(showPass => !showPass)}><VisibilityIcon fontSize='small' /></IconButton>;

    return (
        <div className='hexagon-overlay hexagon-save-overlay'>
            <Header url={chrome.runtime.getURL("icon.png")} clickAction={closeOverlay} />
            <Card className='hexagon-overlay-body hexagon-save-overlay-body'>
                <div>Username/Password detected. Save username and password?</div>

                <Box component={"form"} id="hexagon-save-login-form">
                    <TextField required id="hexagon-save-username" label="Username" defaultValue={username} sx={{mt:3, mb:2, width:"240px"}}/>

                    {showPass
                        ?   <TextField required id="hexagon-save-password" label="Password" defaultValue={password} 
                            InputProps={{
                                endAdornment: icon
                            }}
                            sx={{m:1, width:"240px"}}
                            />
                        :   <TextField required id="hexagon-save-password" label="Password" type="password" defaultValue={password} 
                            InputProps={{
                                endAdornment: icon,
                            }}
                            sx={{m:1, width:"240px"}}
                            /> 
                    }

                    <Button onClick={e => saveFormSubmit(e, closeOverlay)} size='large' sx={{margin: "5px", fontSize: "15px"}}>Save</Button>
                </Box>
                
                
            </Card>
        </div>
    )
}

export { AutofillOverlay, SavePassOverlay }