import React, { useState, useEffect, SyntheticEvent } from 'react'
import { Card, Box, Typography, TextField, IconButton, Avatar, Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import '../popup.css'
import './passwords.css'


type PasswordInfo = {
    website: string,
    username: string,
    password: string
}

const onFormSubmit = (e: SyntheticEvent, username: string) => {
    e.preventDefault();
    let password = document.querySelector("#hexagon-updated-password-" + username) as HTMLInputElement;
    console.log(password.value);
    console.log(username);
    let form = document.querySelector("#hexagon-update-pass-" + username) as HTMLFormElement;
    form.reset();
}

const PasswordCardForm = ({username, password}: {username:string, password:string}) => {

    const [showPass, setShowPass] = useState(false);
    const icon = <IconButton onClick={() => setShowPass(showPass => !showPass)}><VisibilityIcon fontSize='small'/></IconButton>

    return (
        <Card sx={{borderTop: "solid 1.5px #3a5cb5", borderRadius: "0 0 2px 2px"}}>
            <Box id={"hexagon-update-pass-" + username} padding={2} pt={"8px"} display="flex" justifyContent={"space-between"} alignItems={"flex-end"} component={"form"} onSubmit={e => onFormSubmit(e, username)}>
                {showPass
                    ?   <TextField
                            id={"hexagon-updated-password-" + username}
                            required
                            label="Password"
                            autoComplete="current-password"
                            variant="standard"
                            defaultValue=''
                            InputProps={{
                                endAdornment: icon,
                            }}
                        />
                    :   <TextField
                            id={"hexagon-updated-password-" + username}
                            required
                            label="Password"
                            type="password"
                            autoComplete="current-password"
                            variant="standard"
                            defaultValue=''
                            InputProps={{
                                endAdornment: icon,
                            }}
                        />
                }
                <Button type='submit' variant="contained" size='small' sx={{height: "30px"}}>Update</Button>
            </Box>
        </Card>
    )
}

const PasswordCard = ({ website, username, password } : PasswordInfo) => {
    const [showPass, setShowPass] = useState(false);
    const [showPassUpdateForm, setShowPassUpdateForm] = useState(false);

    return (
        <Box mb={"2px"}>
            <Card sx={{display: "flex", padding: "10px", justifyContent: "space-between"}}>
                <div className='website-pass-container'>
                    <div className='site-icon-container'>
                        <Avatar
                            sx={{ bgcolor: 'none', width: '60px', height: '60px', objectFit: "contain"}}
                            variant='rounded'
                            src={`https://logo.clearbit.com/${website}`}
                            alt={website.toUpperCase()}
                        >
                        </Avatar>
                    </div>
                    <div className='site-info'>
                        <Typography variant='button' sx={{ fontWeight: 'bold' }} display="block">{website}</Typography>
                        <Typography variant='caption' sx={{ fontWeight: 'light', color: "#424242" }} display="block" onDoubleClick={() => navigator.clipboard.writeText(username)}>{username}</Typography>
                        <div className='pass-info'>
                            {showPass
                                ? <TextField value={password} 
                                    InputProps={{ readOnly: true, disableUnderline: true, style: { fontSize: 14, width: 100, marginRight: 5 } }} 
                                    size="small" variant="standard"
                                    onDoubleClick={() => navigator.clipboard.writeText(password)}
                                    />
                                : <TextField value="••••••••••••••••••" 
                                    InputProps={{ readOnly: true, disableUnderline: true, style: { fontSize: 14, width: 100, marginRight: 5 } }} 
                                    size="small" variant="standard"
                                    onDoubleClick={() => navigator.clipboard.writeText(password)}
                                    />
                            }
                            <IconButton onClick={() => setShowPass(showPass => !showPass)}>
                                <VisibilityIcon fontSize='small' />
                            </IconButton>
                        </div>
                    </div>
                </div>
                <Box display={"flex"} flexDirection={"column"} justifyContent="space-between">
                    <IconButton onClick={() => console.log("delete pass")} sx={{ height:30, width:30 }}>
                        <DeleteOutlineIcon color='disabled' sx={{ fontSize: 24 }} />
                    </IconButton>

                    <IconButton onClick={() => setShowPassUpdateForm(showPassUpdateForm => !showPassUpdateForm)} sx={{ height:30, width:30 }}>
                        <EditIcon color='disabled' sx={{ fontSize: 22 }} />
                    </IconButton>
                </Box>
            </Card>
            {showPassUpdateForm && <PasswordCardForm username={username} password={password} />}
            
        </Box>
    )
}

const EmptyPasswordsPage = ({url} : {url:string}) => {
    return (
        <Box className='hexagon-subheading hexagon-empty-passwords' m={"auto"} width="100%" height="100%" 
            display="flex"
            justifyContent="center"
            py={4}
            >
                <Box display="flex" flexDirection="column" fontSize={18}>
                    <div>No passwords for this site yet...</div>
                    {url
                        ?<img src={'https://logo.clearbit.com/https:/' + url} ></img>
                        :<img src='web-link.png'></img>
                    }
                </Box>
        </Box>
    )
}

const PopupPasswords = ({url}: {url:string}) => {
    return (
        
        <div>
            {/* <EmptyPasswordsPage url={url}/> */}

            <PasswordCard website='amazon.com' username='sally' password='password'/>
            <PasswordCard website='google.com' username='saaaaallllyy' password='123456789'/>
            <PasswordCard website='grademy.work' username='sallyisme' password='cookies123'/>
            <PasswordCard website='heroku.com' username='sal123' password='smithysmith'/>
            <PasswordCard website='facebook.com' username='smithsally' password='abcdefghifgdfgfdgffgfdgfdgfdgfdgdgfdgdgdg'/>
            <PasswordCard website='netflix.com' username='sallyisme' password='cookies123'/>
        </div>
    )
}

export default PopupPasswords