import React, { useState, useEffect } from 'react'
import { Card, Box, Typography, TextField, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import '../popup.css'
import './password.css'

type PasswordInfo = {
    website: string,
    username: string,
    password: string
}

const PasswordCard = ({ website, username, password } : PasswordInfo) => {
    const [showPass, setShowPass] = useState(false);

    return (
        <Box mb={"2px"}>
        <Card sx={{display: "flex", padding: "10px", justifyContent: "space-between"}}>
            <div className='website-pass-container'>
            <div className='site-icon-container'>
                <img src={'https://logo.clearbit.com/https:/' + website} />
            </div>
            <div className='site-info'>
                <Typography variant='button' sx={{ fontWeight: 'bold' }} display="block">{website}</Typography>
                <Typography variant='caption' sx={{ fontWeight: 'light', color: "#424242" }} display="block">{username}</Typography>
                <div className='pass-info'>
                    {showPass
                        ? <TextField value={password} InputProps={{ readOnly: true, disableUnderline: true, style: { fontSize: 14, width: 100, marginRight: 7 } }} size="small" variant="standard"/>
                        : <TextField value="••••••••••••••••••" InputProps={{ readOnly: true, disableUnderline: true, style: { fontSize: 14, width: 100, marginRight: 7 } }} size="small" variant="standard"/>
                    }
                    <IconButton onClick={() => setShowPass(showPass => !showPass)}>
                        <VisibilityIcon fontSize='small' />
                    </IconButton>
                </div>
            </div>
            </div>
            <div className='delete-pass-container'>
                <IconButton onClick={() => console.log("delete pass")} >
                    <DeleteOutlineIcon color='disabled' sx={{ fontSize: 28 }} />
                </IconButton>
            </div>
        </Card>
        </Box>
    )
}

const PopupPasswords = () => {
    return (
        <div>
            <PasswordCard website='amazon.com' username='sally' password='password'/>
            <PasswordCard website='google.com' username='saaaaallllyy' password='123456789'/>
            <PasswordCard website='heroku.com' username='sal123' password='smithysmith'/>
            <PasswordCard website='facebook.com' username='smithsally' password='abcdefghifgdfgfdgffgfdgfdgfdgfdgdgfdgdgdg'/>
            <PasswordCard website='netflix.com' username='sallyisme' password='cookies123'/>
        </div>
    )
}

export default PopupPasswords