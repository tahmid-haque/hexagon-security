import React, { useState, useEffect, SyntheticEvent } from 'react';
import { Card, Box, Button, Typography, Tab, TextField, IconButton } from '@mui/material';
import '../../popup.css';
import '../Signin/signin.css';
import VisibilityIcon from '@mui/icons-material/Visibility';


const MFAKeyForm = ({url}: {url:string}) => {
    const [showSecret, setShowSecret] = useState(false);

    const icon = <IconButton onClick={() => setShowSecret(showSecret => !showSecret)}><VisibilityIcon fontSize='small'/></IconButton>

    const onFormSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        let website = document.querySelector("#mfa-website") as HTMLInputElement;
        let username = document.querySelector("#mfa-username") as HTMLInputElement;
        let secret = document.querySelector("#mfa-secret") as HTMLInputElement;
        console.log(website.value);
        console.log(username.value);
        console.log(secret.value);
        let form = document.querySelector("#add-mfa-form") as HTMLFormElement;
        form.reset();
    }

    return (
        <div>
            <Box id="add-mfa-form" display={"flex"} flexDirection={"column"} padding={3} component={"form"} onSubmit={onFormSubmit}>
                <div className='hexagon-mfa-subheading'>Create MFA Credential</div>
                
                <TextField
                    id="mfa-website"
                    required
                    label="URL"
                    defaultValue={url}
                    InputProps={{
                        readOnly: true,
                    }}
                    variant="standard"
                    sx={{mb:"5px"}}
                />
                <TextField
                    id="mfa-username"
                    required
                    label="Username/Email"
                    variant="standard"
                    sx={{mb:"5px"}}
                />
                {showSecret
                    ?   <TextField
                            id="mfa-secret"
                            required
                            label="Secret"
                            autoComplete="current-password"
                            variant="standard"
                            sx={{mb:4}}
                            InputProps={{
                                endAdornment: icon,
                            }}
                        />
                    :   <TextField
                            id="mfa-secret"
                            required
                            label="Secret"
                            type="password"
                            autoComplete="current-password"
                            variant="standard"
                            sx={{mb:4}}
                            InputProps={{
                                endAdornment: icon,
                            }}
                        />
                }
                <Button type='submit' variant="contained" size='large' sx={{width:"150px", marginLeft:"auto"}}>Submit</Button>
            </Box>
            
        </div>
        
    )
}

export default MFAKeyForm