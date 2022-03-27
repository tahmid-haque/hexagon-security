import React, { useState, useEffect } from 'react'
import { Card, Box, Button, Typography, Tab, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './header.css'

const Header = ({url, clickAction} : {url: string, clickAction: () => void}) => {
    return (
      <div>
        <div className='hexagon-header-top-border'></div>
        <Card>
          <div className='hexagon-header-container'>
            <div className='hexagon-header'>
              <img src={url} className="icon"/> 
              <div className='title'>HEXAGON</div>
            </div>
            <Box m={1}>
              <IconButton onClick={clickAction} >
                <CloseIcon color="action"/>
              </IconButton>
            </Box>
          </div>
        </Card>
      </div>
    )
}

export default Header;
