import React, { useState, useEffect } from 'react'
import { Card, Box, Button, Typography, Tab } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './header.css'

const Header = ({url} : {url: string}) => {
    const onClickClose = () => {
      console.log("close popup");
      // window.close();
    }
  
    return (
      <div>
        <div className='top-border'></div>
        <Card>
          <div className='header-container'>
            <div className='header'>
              <img src={url} className="icon"/> 
              <div className='title'>HEXAGON</div>
            </div>
            <Box m={1}>
              <CloseIcon onClick={onClickClose} color="action"></CloseIcon>
            </Box>
          </div>
        </Card>
      </div>
    )
}

export default Header;
