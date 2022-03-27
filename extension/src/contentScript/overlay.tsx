import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { Card, Button, InputLabel, MenuItem, FormControl, Select, TextField, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Header from '../sharedComponents/header/header'
import './contentScript.css'

const AutofillOverlay = ({autofill, closeOverlay} : {autofill: () => void, closeOverlay: () => void}) => {
    const [username, setUsername] = React.useState('');

    const handleChange = (event) => {
      setUsername(event.target.value);
    };

    return (
        <div className='hexagon-overlay'>
            <Header url={chrome.runtime.getURL("icon.png")} clickAction={closeOverlay} />
            <Card className='hexagon-overlay-body'>
                <div>Username/Password fields detected. Autofill fields?</div>

                <div>
                    <FormControl required sx={{ mt: 2, width: 160}}>
                        <InputLabel id="demo-simple-select-helper-label">Account</InputLabel>
                        <Select
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

                <Button size='large' sx={{margin: "5px", fontSize: "15px"}} onClick={autofill}>Autofill</Button>
            </Card>
        </div>
    )
}

const SavePassOverlay = ({username, password, closeOverlay} : {username:string, password:string, closeOverlay: () => void}) => {
    const [showPass, setShowPass] = useState(false);

    const icon = <IconButton sx={{m:0}} onClick={() => setShowPass(showPass => !showPass)}><VisibilityIcon fontSize='small' /></IconButton>;

    return (
        <div className='hexagon-overlay hexagon-save-overlay'>
            <Header url={chrome.runtime.getURL("icon.png")} clickAction ={closeOverlay} />
            <Card className='hexagon-overlay-body hexagon-save-overlay-body'>
                <div>Username/Password detected. Save username and password?</div>
                <div>
                    <TextField required id="outlined-required" label="Username" defaultValue={username} sx={{mt:3, mb:2, width:"200px"}}/>

                    {showPass
                        ?   <TextField required id="outlined-required" label="Password" defaultValue={password} 
                            InputProps={{
                                endAdornment: icon
                            }}
                            sx={{m:1, width:"200px"}}
                          />
                        :   <TextField required id="outlined-password-input" label="Password" type="password" defaultValue={password} 
                            InputProps={{
                                endAdornment: icon,
                            }}
                            sx={{m:1, width:"200px"}}
                          /> 
                    }
                    
                </div>
                
                <Button size='large' sx={{margin: "5px", fontSize: "15px"}}>Save</Button>
            </Card>
        </div>
    )
}

export { AutofillOverlay, SavePassOverlay }